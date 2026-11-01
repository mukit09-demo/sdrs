package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.MarketRequest;
import com.banyan.lab.sdrs.dto.MarketResponse;
import com.banyan.lab.sdrs.dto.StatDto;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Stat;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.MarketMapper;
import com.banyan.lab.sdrs.repository.MarketRepository;
import com.banyan.lab.sdrs.support.CollectionTestData;
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

/** Plain CRUD by slug: insertion order, conflict on create, slug fixed on update. */
@ExtendWith(MockitoExtension.class)
class MarketServiceTest {

    @Mock
    private MarketRepository repository;

    private MarketService service;

    @BeforeEach
    void setUp() {
        service = new MarketService(repository, Mappers.getMapper(MarketMapper.class));
    }

    private static MarketRequest request(String slug) {
        return new MarketRequest(
                slug, "Buildings, revised", "A new tagline", "A new description",
                "/video/markets/buildings-v2.webm", List.of("Retrofit"),
                List.of(new StatDto("50", "%", "Carbon saved")));
    }

    @Test
    @DisplayName("list keeps insertion order, the order the mock repository's store keeps")
    void testIfListReturnsMarketsInInsertionOrder() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(
                CollectionTestData.market(), CollectionTestData.market("rail", "Rail")));

        assertThat(service.list()).extracting(MarketResponse::slug).containsExactly("buildings", "rail");

        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findAll(sort.capture());
        assertThat(sort.getValue()).isEqualTo(Sort.by("id"));
    }

    @Test
    @DisplayName("an empty table lists as an empty array")
    void testIfListReturnsEmptyWhenNoMarketsExist() {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of());

        assertThat(service.list()).isEmpty();
    }

    @Test
    @DisplayName("get maps the market found at the slug")
    void testIfGetFindsTheMarket() {
        when(repository.findBySlug(CollectionTestData.MARKET_SLUG))
                .thenReturn(Optional.of(CollectionTestData.market()));

        MarketResponse found = service.get(CollectionTestData.MARKET_SLUG);

        assertThat(found.name()).isEqualTo("Buildings");
        assertThat(found.stats()).hasSize(2);
    }

    @Test
    @DisplayName("a slug that does not exist is not found")
    void testIfGetThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get("nope"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("market")
                .hasMessageContaining("nope");
    }

    @Test
    @DisplayName("create saves a new market and returns what was stored")
    void testIfCreateSavesTheNewMarket() {
        when(repository.existsBySlug("energy")).thenReturn(false);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        MarketResponse created = service.create(request("energy"));

        assertThat(created.slug()).isEqualTo("energy");
        assertThat(created.capabilities()).containsExactly("Retrofit");
        assertThat(created.stats()).containsExactly(new StatDto("50", "%", "Carbon saved"));

        ArgumentCaptor<Market> saved = ArgumentCaptor.forClass(Market.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getId()).isNull();
    }

    @Test
    @DisplayName("creating over an existing slug conflicts instead of replacing")
    void testIfCreateThrowsConflictForExistingSlug() {
        when(repository.existsBySlug(CollectionTestData.MARKET_SLUG)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request(CollectionTestData.MARKET_SLUG)))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(CollectionTestData.MARKET_SLUG);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update writes onto the managed market, replacing its collections in place")
    void testIfUpdateReplacesTheMarketInPlace() {
        Market existing = CollectionTestData.market();
        List<Stat> stats = existing.getStats();
        when(repository.findBySlug(CollectionTestData.MARKET_SLUG)).thenReturn(Optional.of(existing));

        MarketResponse updated = service.update(CollectionTestData.MARKET_SLUG, request(CollectionTestData.MARKET_SLUG));

        assertThat(existing.getName()).isEqualTo("Buildings, revised");
        assertThat(existing.getCapabilities()).containsExactly("Retrofit");
        assertThat(existing.getStats()).singleElement().extracting(Stat::getValue).isEqualTo("50");
        assertThat(existing.getStats()).isSameAs(stats);
        assertThat(updated.filmUrl()).isEqualTo("/video/markets/buildings-v2.webm");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("a body slug that disagrees with the path is refused before any lookup")
    void testIfUpdateRefusesSlugMismatch() {
        assertThatThrownBy(() -> service.update(CollectionTestData.MARKET_SLUG, request("rail")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("rail");
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("updating something absent is a 404")
    void testIfUpdateThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update("nope", request("nope")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("delete removes the market found at the slug")
    void testIfDeleteRemovesTheMarket() {
        Market existing = CollectionTestData.market();
        when(repository.findBySlug(CollectionTestData.MARKET_SLUG)).thenReturn(Optional.of(existing));

        service.delete(CollectionTestData.MARKET_SLUG);

        verify(repository).delete(existing);
    }

    @Test
    @DisplayName("deleting something absent is a 404, not a silent success")
    void testIfDeleteThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete("nope")).isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).delete(any(Market.class));
    }
}
