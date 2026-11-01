package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.ServiceRequest;
import com.banyan.lab.sdrs.dto.ServiceResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.entity.ServiceCategory;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.ServiceMapper;
import com.banyan.lab.sdrs.repository.MarketRepository;
import com.banyan.lab.sdrs.repository.ServiceRepository;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

/** CRUD by slug, plus the related-market slugs resolved to rows on write. */
@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository repository;

    @Mock
    private MarketRepository markets;

    private ServiceService service;

    @BeforeEach
    void setUp() {
        service = new ServiceService(repository, markets, Mappers.getMapper(ServiceMapper.class));
    }

    private static ServiceRequest request(String slug, List<String> relatedMarketSlugs) {
        return new ServiceRequest(
                slug, "Structural Engineering", ServiceCategory.ADVISORY, "A new tagline",
                "A new description", null, List.of("Long spans"), relatedMarketSlugs);
    }

    @Test
    @DisplayName("list keeps insertion order")
    void testIfListReturnsServicesInInsertionOrder() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(CollectionTestData.service()));

        assertThat(service.list()).extracting(ServiceResponse::slug)
                .containsExactly(CollectionTestData.SERVICE_SLUG);

        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findAll(sort.capture());
        assertThat(sort.getValue()).isEqualTo(Sort.by("id"));
    }

    @Test
    @DisplayName("get maps the service found at the slug, related markets as slugs")
    void testIfGetFindsTheService() {
        when(repository.findBySlug(CollectionTestData.SERVICE_SLUG))
                .thenReturn(Optional.of(CollectionTestData.service()));

        ServiceResponse found = service.get(CollectionTestData.SERVICE_SLUG);

        assertThat(found.category()).isEqualTo(ServiceCategory.DESIGN_AND_ENGINEERING);
        assertThat(found.relatedMarketSlugs()).containsExactly(CollectionTestData.MARKET_SLUG);
    }

    @Test
    @DisplayName("a slug that does not exist is not found")
    void testIfGetThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get("nope"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("service")
                .hasMessageContaining("nope");
    }

    @Test
    @DisplayName("create resolves related markets in the order the request gave")
    void testIfCreateResolvesRelatedMarketsInRequestOrder() {
        when(repository.existsBySlug("advisory")).thenReturn(false);
        when(markets.findBySlugIn(any())).thenReturn(List.of(
                CollectionTestData.market("buildings", "Buildings"),
                CollectionTestData.market("rail", "Rail")));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ServiceResponse created = service.create(request("advisory", List.of("rail", "buildings")));

        assertThat(created.relatedMarketSlugs()).containsExactly("rail", "buildings");
        assertThat(created.category()).isEqualTo(ServiceCategory.ADVISORY);
    }

    @Test
    @DisplayName("an empty related-market list needs no lookup")
    void testIfCreateWithoutMarketsSkipsTheLookup() {
        when(repository.existsBySlug("advisory")).thenReturn(false);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(service.create(request("advisory", List.of())).relatedMarketSlugs()).isEmpty();
        verifyNoInteractions(markets);
    }

    @Test
    @DisplayName("creating over an existing slug conflicts instead of replacing")
    void testIfCreateThrowsConflictForExistingSlug() {
        when(repository.existsBySlug(CollectionTestData.SERVICE_SLUG)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request(CollectionTestData.SERVICE_SLUG, List.of())))
                .isInstanceOf(DuplicateResourceException.class);
        verify(repository, never()).save(any());
        verifyNoInteractions(markets);
    }

    @Test
    @DisplayName("a market slug that names no row is refused, not stored")
    void testIfCreateRefusesUnknownMarket() {
        when(repository.existsBySlug("advisory")).thenReturn(false);
        when(markets.findBySlugIn(any())).thenReturn(List.of(CollectionTestData.market()));

        assertThatThrownBy(() -> service.create(request("advisory", List.of("buildings", "atlantis"))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("market")
                .hasMessageContaining("atlantis");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update replaces fields and related markets on the managed service in place")
    void testIfUpdateReplacesTheServiceInPlace() {
        Service existing = CollectionTestData.service();
        List<Market> related = existing.getRelatedMarkets();
        when(repository.findBySlug(CollectionTestData.SERVICE_SLUG)).thenReturn(Optional.of(existing));
        when(markets.findBySlugIn(any())).thenReturn(List.of(CollectionTestData.market("rail", "Rail")));

        ServiceResponse updated = service.update(
                CollectionTestData.SERVICE_SLUG, request(CollectionTestData.SERVICE_SLUG, List.of("rail")));

        assertThat(existing.getCategory()).isEqualTo(ServiceCategory.ADVISORY);
        assertThat(existing.getCapabilities()).containsExactly("Long spans");
        assertThat(existing.getRelatedMarkets()).extracting(Market::getSlug).containsExactly("rail");
        assertThat(existing.getRelatedMarkets()).isSameAs(related);
        assertThat(updated.relatedMarketSlugs()).containsExactly("rail");
    }

    @Test
    @DisplayName("an update with no related markets clears them")
    void testIfUpdateWithoutMarketsClearsThem() {
        Service existing = CollectionTestData.service();
        when(repository.findBySlug(CollectionTestData.SERVICE_SLUG)).thenReturn(Optional.of(existing));

        service.update(CollectionTestData.SERVICE_SLUG, request(CollectionTestData.SERVICE_SLUG, List.of()));

        assertThat(existing.getRelatedMarkets()).isEmpty();
        verifyNoInteractions(markets);
    }

    @Test
    @DisplayName("a body slug that disagrees with the path is refused before any lookup")
    void testIfUpdateRefusesSlugMismatch() {
        assertThatThrownBy(() -> service.update(CollectionTestData.SERVICE_SLUG, request("other", List.of())))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("other");
        verifyNoInteractions(repository, markets);
    }

    @Test
    @DisplayName("updating something absent is a 404")
    void testIfUpdateThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update("nope", request("nope", List.of())))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("an unknown related market leaves the existing service untouched")
    void testIfUpdateWithUnknownMarketChangesNothing() {
        Service existing = CollectionTestData.service();
        List<Market> before = new ArrayList<>(existing.getRelatedMarkets());
        String tagline = existing.getTagline();
        when(repository.findBySlug(CollectionTestData.SERVICE_SLUG)).thenReturn(Optional.of(existing));
        when(markets.findBySlugIn(any())).thenReturn(List.of());

        assertThatThrownBy(() -> service.update(
                CollectionTestData.SERVICE_SLUG, request(CollectionTestData.SERVICE_SLUG, List.of("atlantis"))))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(existing.getTagline()).isEqualTo(tagline);
        assertThat(existing.getRelatedMarkets()).containsExactlyElementsOf(before);
    }

    @Test
    @DisplayName("delete removes the service found at the slug")
    void testIfDeleteRemovesTheService() {
        Service existing = CollectionTestData.service();
        when(repository.findBySlug(CollectionTestData.SERVICE_SLUG)).thenReturn(Optional.of(existing));

        service.delete(CollectionTestData.SERVICE_SLUG);

        verify(repository).delete(existing);
    }

    @Test
    @DisplayName("deleting something absent is a 404, not a silent success")
    void testIfDeleteThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete("nope")).isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).delete(any(Service.class));
    }
}
