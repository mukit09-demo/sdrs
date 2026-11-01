package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.ProjectLocationDto;
import com.banyan.lab.sdrs.dto.ProjectRequest;
import com.banyan.lab.sdrs.dto.ProjectResponse;
import com.banyan.lab.sdrs.dto.StatDto;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Project;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.ProjectMapper;
import com.banyan.lab.sdrs.repository.MarketRepository;
import com.banyan.lab.sdrs.repository.ProjectRepository;
import com.banyan.lab.sdrs.repository.ServiceRepository;
import com.banyan.lab.sdrs.support.CollectionTestData;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

/** The rules {@code listProjects} in the mock sets, and the slug references on write. */
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    private static final Sort NEWEST_FIRST =
            Sort.by(Sort.Direction.DESC, "year").and(Sort.by(Sort.Direction.ASC, "slug"));

    @Mock
    private ProjectRepository repository;

    @Mock
    private MarketRepository markets;

    @Mock
    private ServiceRepository services;

    private ProjectService service;

    @BeforeEach
    void setUp() {
        service = new ProjectService(
                repository, markets, services, Mappers.getMapper(ProjectMapper.class));
    }

    /** See {@code NewsServiceTest.anySpec}: one typed matcher instead of a raw one. */
    private static Specification<Project> anySpec() {
        return ArgumentMatchers.any();
    }

    private static Project project(String slug) {
        Project project = CollectionTestData.project();
        project.setSlug(slug);
        return project;
    }

    private static Service serviceRow(String slug) {
        Service row = CollectionTestData.service();
        row.setSlug(slug);
        return row;
    }

    private static ProjectRequest request(List<String> marketSlugs) {
        return request(marketSlugs, List.of());
    }

    private static ProjectRequest request(List<String> marketSlugs, List<String> serviceSlugs) {
        return request(CollectionTestData.PROJECT_SLUG, marketSlugs, serviceSlugs);
    }

    private static ProjectRequest request(String slug, List<String> marketSlugs, List<String> serviceSlugs) {
        return new ProjectRequest(
                slug, "Crossrail", new ProjectLocationDto("London", "United Kingdom"),
                2022, "Crossrail Limited", marketSlugs, serviceSlugs, "A railway.", "A long railway.",
                null, List.of(new StatDto("41", "km", "Of new tunnel")), List.of("Opened on time"));
    }

    @Nested
    @DisplayName("list by explicit slugs")
    class ExplicitSlugs {

        @Test
        @DisplayName("explicit slugs come back in the order asked for, whatever the database returned")
        void testIfExplicitSlugsKeepTheCallersOrder() {
            when(repository.findBySlugIn(List.of("b", "missing", "a")))
                    .thenReturn(List.of(project("a"), project("b")));

            List<ProjectResponse> found = service.list(null, null, List.of("b", "missing", "a"), null);

            assertThat(found).extracting(ProjectResponse::slug).containsExactly("b", "a");
        }

        @Test
        @DisplayName("a slug asked for twice is returned once")
        void testIfRepeatedSlugCollapse() {
            when(repository.findBySlugIn(List.of("a", "b", "a")))
                    .thenReturn(List.of(project("a"), project("b")));

            assertThat(service.list(null, null, List.of("a", "b", "a"), null))
                    .extracting(ProjectResponse::slug)
                    .containsExactly("a", "b");
        }

        @Test
        @DisplayName("an empty slug list is an empty result, with no query")
        void testIfEmptySlugsMatchNothing() {
            assertThat(service.list(null, null, List.of(), null)).isEmpty();

            verifyNoInteractions(repository, markets, services);
        }

        @Test
        @DisplayName("no slug naming a row is an empty result, not an error")
        void testIfAllMissingSlugsReturnEmpty() {
            when(repository.findBySlugIn(List.of("x", "y"))).thenReturn(List.of());

            assertThat(service.list(null, null, List.of("x", "y"), null)).isEmpty();
        }

        @Test
        @DisplayName("limit cuts the ordered list, keeping the first ones asked for")
        void testIfLimitAppliesAfterOrdering() {
            when(repository.findBySlugIn(List.of("c", "a", "b")))
                    .thenReturn(List.of(project("a"), project("b"), project("c")));

            assertThat(service.list(null, null, List.of("c", "a", "b"), 2))
                    .extracting(ProjectResponse::slug)
                    .containsExactly("c", "a");
        }

        @Test
        @DisplayName("a limit larger than the result returns everything")
        void testIfLimitLargerThanResultReturnsEverything() {
            when(repository.findBySlugIn(List.of("a"))).thenReturn(List.of(project("a")));

            assertThat(service.list(null, null, List.of("a"), 10)).hasSize(1);
        }

        @Test
        @DisplayName("a non-positive limit is ignored")
        void testIfNonPositiveLimitIsIgnoredForExplicitSlugs() {
            when(repository.findBySlugIn(List.of("a", "b")))
                    .thenReturn(List.of(project("a"), project("b")));

            assertThat(service.list(null, null, List.of("a", "b"), 0)).hasSize(2);
            assertThat(service.list(null, null, List.of("a", "b"), -1)).hasSize(2);
        }

        @Test
        @DisplayName("explicit slugs win: the market and service filters are not consulted")
        void testIfSlugsOverrideFilters() {
            when(repository.findBySlugIn(List.of("a"))).thenReturn(List.of(project("a")));

            assertThat(service.list("buildings", "structural-engineering", List.of("a"), null)).hasSize(1);

            verifyNoInteractions(markets, services);
            verify(repository, never()).findAll(anySpec(), any(Sort.class));
        }
    }

    @Nested
    @DisplayName("list by filter")
    class Filtered {

        @Test
        @DisplayName("no filter lists everything, newest year first with slug as a tiebreaker")
        void testIfUnfilteredListSortsNewestFirst() {
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of(project("a")));

            assertThat(service.list(null, null, null, null)).hasSize(1);

            ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
            verify(repository).findAll(anySpec(), sort.capture());
            assertThat(sort.getValue()).isEqualTo(NEWEST_FIRST);
            verifyNoInteractions(markets, services);
        }

        @Test
        @DisplayName("blank market and service slugs are no filter, not an unknown one")
        void testIfBlankFiltersAreIgnored() {
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of(project("a")));

            assertThat(service.list("  ", "", null, null)).hasSize(1);

            verifyNoInteractions(markets, services);
        }

        @Test
        @DisplayName("an unknown market filter matches nothing rather than everything")
        void testIfUnknownMarketMatchesNothing() {
            when(markets.findBySlug("nope")).thenReturn(Optional.empty());

            assertThat(service.list("nope", null, null, null)).isEmpty();
            verify(repository, never()).findAll(anySpec(), any(Sort.class));
        }

        @Test
        @DisplayName("an unknown service filter matches nothing rather than everything")
        void testIfUnknownServiceMatchesNothing() {
            when(services.findBySlug("nope")).thenReturn(Optional.empty());

            assertThat(service.list(null, "nope", null, null)).isEmpty();
            verify(repository, never()).findAll(anySpec(), any(Sort.class));
        }

        @Test
        @DisplayName("an unknown market short-circuits before the service is looked up")
        void testIfUnknownMarketSkipsServiceLookup() {
            when(markets.findBySlug("nope")).thenReturn(Optional.empty());

            assertThat(service.list("nope", "structural-engineering", null, null)).isEmpty();
            verifyNoInteractions(services);
        }

        @Test
        @DisplayName("a known market and service both reach the query")
        void testIfKnownFiltersReachTheQuery() {
            when(markets.findBySlug("buildings")).thenReturn(Optional.of(CollectionTestData.market()));
            when(services.findBySlug("structural-engineering"))
                    .thenReturn(Optional.of(CollectionTestData.service()));
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of(project("a")));

            assertThat(service.list("buildings", "structural-engineering", null, null))
                    .extracting(ProjectResponse::slug)
                    .containsExactly("a");
        }

        @Test
        @DisplayName("limit is pushed into the query as a first page")
        void testIfLimitBecomesAPageRequest() {
            when(repository.findAll(anySpec(), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(project("a"))));

            assertThat(service.list(null, null, null, 3)).hasSize(1);

            ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
            verify(repository).findAll(anySpec(), pageable.capture());
            assertThat(pageable.getValue()).isEqualTo(PageRequest.of(0, 3, NEWEST_FIRST));
            verify(repository, never()).findAll(anySpec(), any(Sort.class));
        }

        @Test
        @DisplayName("a non-positive limit is ignored rather than producing an empty page")
        void testIfNonPositiveLimitIsIgnoredForFilters() {
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of(project("a")));

            assertThat(service.list(null, null, null, 0)).hasSize(1);
            assertThat(service.list(null, null, null, -5)).hasSize(1);
            verify(repository, never()).findAll(anySpec(), any(Pageable.class));
        }
    }

    /**
     * The specification itself, run against mocked criteria objects — the only
     * way to see which predicates it builds without a database.
     */
    @Nested
    @DisplayName("filter specification")
    class FilterSpecification {

        @Mock
        private Root<Project> root;

        @Mock
        private CriteriaQuery<?> query;

        @Mock
        private CriteriaBuilder builder;

        @Mock
        private Path<List<Market>> marketsPath;

        @Mock
        private Path<List<Service>> servicesPath;

        private Specification<Project> captured() {
            ArgumentCaptor<Specification<Project>> specification = ArgumentCaptor.captor();
            verify(repository).findAll(specification.capture(), any(Sort.class));
            return specification.getValue();
        }

        @Test
        @DisplayName("no filter builds no predicate")
        void testIfNoFilterBuildsNoPredicate() {
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());
            service.list(null, null, null, null);

            assertThat(captured().toPredicate(root, query, builder)).isNull();
            verifyNoInteractions(root, builder);
        }

        @Test
        @DisplayName("a market filter is an isMember on markets, never a join")
        void testIfMarketFilterUsesIsMember() {
            Market market = CollectionTestData.market();
            when(markets.findBySlug("buildings")).thenReturn(Optional.of(market));
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());
            doReturn(marketsPath).when(root).get("markets");

            service.list("buildings", null, null, null);
            captured().toPredicate(root, query, builder);

            verify(builder).isMember(market, marketsPath);
            verify(root, never()).get("services");
            verify(root, never()).join("markets");
        }

        @Test
        @DisplayName("market and service together are both isMember")
        void testIfMarketAndServiceFiltersUseIsMember() {
            Market market = CollectionTestData.market();
            Service row = CollectionTestData.service();
            when(markets.findBySlug("buildings")).thenReturn(Optional.of(market));
            when(services.findBySlug("structural-engineering")).thenReturn(Optional.of(row));
            when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());
            doReturn(marketsPath).when(root).get("markets");
            doReturn(servicesPath).when(root).get("services");

            service.list("buildings", "structural-engineering", null, null);
            captured().toPredicate(root, query, builder);

            verify(builder).isMember(market, marketsPath);
            verify(builder).isMember(row, servicesPath);
        }
    }

    @Nested
    @DisplayName("get")
    class Get {

        @Test
        @DisplayName("an existing slug maps to the response, references as slugs")
        void testIfGetReturnsFoundProject() {
            when(repository.findBySlug(CollectionTestData.PROJECT_SLUG))
                    .thenReturn(Optional.of(CollectionTestData.project()));

            ProjectResponse found = service.get(CollectionTestData.PROJECT_SLUG);

            assertThat(found.slug()).isEqualTo(CollectionTestData.PROJECT_SLUG);
            assertThat(found.marketSlugs()).containsExactly(CollectionTestData.MARKET_SLUG);
            assertThat(found.serviceSlugs()).containsExactly(CollectionTestData.SERVICE_SLUG);
        }

        @Test
        @DisplayName("a slug that does not exist is not found")
        void testIfGetMissingThrows() {
            when(repository.findBySlug("nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.get("nope"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("project")
                    .hasMessageContaining("nope");
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("resolves market and service slugs to rows, in the order the request gave")
        void testIfCreateResolvesReferences() {
            when(repository.existsBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(false);
            when(markets.findBySlugIn(any())).thenReturn(List.of(
                    CollectionTestData.market("buildings", "Buildings"),
                    CollectionTestData.market("rail", "Rail")));
            when(services.findBySlugIn(any())).thenReturn(List.of(serviceRow("structural-engineering")));
            when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

            ProjectResponse created = service.create(
                    request(List.of("rail", "buildings"), List.of("structural-engineering")));

            assertThat(created.marketSlugs()).containsExactly("rail", "buildings");
            assertThat(created.serviceSlugs()).containsExactly("structural-engineering");
            assertThat(created.title()).isEqualTo("Crossrail");
            assertThat(created.location()).isEqualTo(new ProjectLocationDto("London", "United Kingdom"));
            assertThat(created.stats()).containsExactly(new StatDto("41", "km", "Of new tunnel"));

            ArgumentCaptor<Project> saved = ArgumentCaptor.forClass(Project.class);
            verify(repository).save(saved.capture());
            assertThat(saved.getValue().getId()).isNull();
        }

        @Test
        @DisplayName("a reference given twice is stored once")
        void testIfRepeatedReferencesCollapse() {
            when(repository.existsBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(false);
            when(markets.findBySlugIn(any())).thenReturn(List.of(CollectionTestData.market()));
            when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

            assertThat(service.create(request(List.of("buildings", "buildings"))).marketSlugs())
                    .containsExactly("buildings");
        }

        @Test
        @DisplayName("creating over an existing slug conflicts instead of replacing")
        void testIfCreateDuplicateThrows() {
            when(repository.existsBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(true);

            assertThatThrownBy(() -> service.create(request(List.of("buildings"))))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining(CollectionTestData.PROJECT_SLUG);
            verify(repository, never()).save(any());
            verifyNoInteractions(markets, services);
        }

        @Test
        @DisplayName("a market slug that names no row is refused, not stored")
        void testIfUnknownMarketReferenceIsRefused() {
            when(repository.existsBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(false);
            when(markets.findBySlugIn(any())).thenReturn(List.of(CollectionTestData.market()));

            assertThatThrownBy(() -> service.create(request(List.of("buildings", "atlantis"))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("atlantis");
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("a service slug that names no row is refused, not stored")
        void testIfUnknownServiceReferenceIsRefused() {
            when(repository.existsBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(false);
            when(services.findBySlugIn(any())).thenReturn(List.of());

            assertThatThrownBy(() -> service.create(request(List.of(), List.of("alchemy"))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("service")
                    .hasMessageContaining("alchemy");
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("an empty reference list needs no lookup")
        void testIfEmptyReferencesSkipTheLookup() {
            when(repository.existsBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(false);
            when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

            ProjectResponse created = service.create(request(List.of()));

            assertThat(created.marketSlugs()).isEmpty();
            assertThat(created.serviceSlugs()).isEmpty();
            verifyNoInteractions(markets, services);
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("replaces fields and references on the managed project in place")
        void testIfUpdateReplacesInPlace() {
            Project existing = CollectionTestData.project();
            List<Market> marketCollection = existing.getMarkets();
            when(repository.findBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(Optional.of(existing));
            when(markets.findBySlugIn(any())).thenReturn(List.of(CollectionTestData.market("rail", "Rail")));

            ProjectResponse updated = service.update(
                    CollectionTestData.PROJECT_SLUG, request(List.of("rail"), List.of()));

            assertThat(existing.getTitle()).isEqualTo("Crossrail");
            assertThat(existing.getSlug()).isEqualTo(CollectionTestData.PROJECT_SLUG);
            assertThat(existing.getMarkets()).extracting(Market::getSlug).containsExactly("rail");
            assertThat(existing.getServices()).isEmpty();
            // Mutated, not reassigned — Hibernate tracks the original instance.
            assertThat(existing.getMarkets()).isSameAs(marketCollection);
            assertThat(updated.marketSlugs()).containsExactly("rail");
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("a body slug that disagrees with the path is refused before any lookup")
        void testIfSlugMismatchIsRefused() {
            assertThatThrownBy(() -> service.update("a-different-slug", request(List.of())))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("a-different-slug")
                    .hasMessageContaining(CollectionTestData.PROJECT_SLUG);
            verifyNoInteractions(repository, markets, services);
        }

        @Test
        @DisplayName("updating something absent is a 404")
        void testIfUpdateMissingThrows() {
            when(repository.findBySlug("nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update("nope", request("nope", List.of(), List.of())))
                    .isInstanceOf(ResourceNotFoundException.class);
            verifyNoInteractions(markets, services);
        }

        @Test
        @DisplayName("an unknown reference leaves the existing project untouched")
        void testIfUnknownReferenceChangesNothing() {
            Project existing = CollectionTestData.project();
            String originalTitle = existing.getTitle();
            List<Market> originalMarkets = new ArrayList<>(existing.getMarkets());
            when(repository.findBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(Optional.of(existing));
            when(markets.findBySlugIn(any())).thenReturn(List.of());

            assertThatThrownBy(() -> service.update(
                    CollectionTestData.PROJECT_SLUG, request(List.of("atlantis"))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("atlantis");

            assertThat(existing.getTitle()).isEqualTo(originalTitle);
            assertThat(existing.getMarkets()).containsExactlyElementsOf(originalMarkets);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("deletes the row found at the slug")
        void testIfDeleteRemovesFoundProject() {
            Project existing = CollectionTestData.project();
            when(repository.findBySlug(CollectionTestData.PROJECT_SLUG)).thenReturn(Optional.of(existing));

            service.delete(CollectionTestData.PROJECT_SLUG);

            verify(repository).delete(existing);
        }

        @Test
        @DisplayName("deleting something absent is a 404, not a silent success")
        void testIfDeleteMissingThrows() {
            when(repository.findBySlug("nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete("nope"))
                    .isInstanceOf(ResourceNotFoundException.class);
            verify(repository, never()).delete(any(Project.class));
        }
    }
}
