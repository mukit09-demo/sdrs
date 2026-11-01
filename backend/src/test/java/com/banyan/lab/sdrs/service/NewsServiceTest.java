package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.dto.ArticleSummaryResponse;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.NewsMapper;
import com.banyan.lab.sdrs.repository.NewsRepository;
import com.banyan.lab.sdrs.support.NewsTestData;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
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

/**
 * The service's rules, with a mocked repository.
 *
 * <p>The real mapper is used rather than a mock: it is generated code with no
 * dependencies, and stubbing it would mean these tests passed while the
 * mapping was broken.
 */
@ExtendWith(MockitoExtension.class)
class NewsServiceTest {

    @Mock
    private NewsRepository repository;

    /**
     * {@code any(Specification.class)} is a raw type, which costs an
     * unchecked-conversion warning at every call site. One typed matcher
     * instead.
     */
    private static Specification<NewsArticle> anySpec() {
        return ArgumentMatchers.any();
    }

    private NewsService service;

    private NewsService service() {
        if (service == null) {
            service = new NewsService(repository, Mappers.getMapper(NewsMapper.class));
        }
        return service;
    }

    @Test
    @DisplayName("a slug that does not exist is not found, not an empty result")
    void testIfGetThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().get("nope"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("nope");
    }

    @Test
    @DisplayName("creating over an existing slug conflicts instead of replacing")
    void testIfCreateThrowsConflictForExistingSlug() {
        when(repository.existsBySlug(NewsTestData.SLUG)).thenReturn(true);

        assertThatThrownBy(() -> service().create(NewsTestData.request()))
                .isInstanceOf(DuplicateResourceException.class);

        // The important half: nothing was written.
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("sorts newest first, with slug as a stable tiebreaker")
    void testIfListSortsArticlesNewestFirst() {
        when(repository.findAll(anySpec(), any(Sort.class)))
                .thenReturn(List.of(NewsTestData.article()));

        service().list(null, null, null);

        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findAll(anySpec(), sort.capture());

        // getOrderFor is null for a property the sort does not mention.
        Sort.Order publishedAt = sort.getValue().getOrderFor("publishedAt");
        Sort.Order slug = sort.getValue().getOrderFor("slug");
        assertThat(publishedAt).isNotNull();
        assertThat(slug).isNotNull();
        assertThat(publishedAt.getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(slug.getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    @DisplayName("limit is pushed into the query, not applied after loading every row")
    void testIfLimitBecomesAPageRequest() {
        when(repository.findAll(anySpec(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(NewsTestData.article())));

        service().list(null, null, 3);

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(anySpec(), pageable.capture());

        assertThat(pageable.getValue()).isEqualTo(
                PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "publishedAt")
                        .and(Sort.by(Sort.Direction.ASC, "slug"))));
    }

    @Test
    @DisplayName("a non-positive limit is ignored rather than producing an empty page")
    void testIfZeroLimitIsIgnored() {
        when(repository.findAll(anySpec(), any(Sort.class)))
                .thenReturn(List.of(NewsTestData.article()));

        assertThat(service().list(null, null, 0)).hasSize(1);

        verify(repository, never()).findAll(anySpec(), any(Pageable.class));
    }

    @Test
    @DisplayName("a body slug that disagrees with the path is rejected, not silently picked")
    void testIfUpdateRefusesSlugMismatch() {
        ArticleRequest request = NewsTestData.request();

        assertThatThrownBy(() -> service().update("a-different-slug", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("a-different-slug");

        verify(repository, never()).findBySlug(any());
    }

    @Test
    @DisplayName("update replaces the managed entity in place")
    void testIfUpdateReplacesTheArticleInPlace() {
        NewsArticle existing = NewsTestData.article();
        existing.setTitle("The old title");
        when(repository.findBySlug(NewsTestData.SLUG)).thenReturn(Optional.of(existing));

        service().update(NewsTestData.SLUG, NewsTestData.request());

        assertThat(existing.getTitle()).isEqualTo(
                "Kai Tak Sports Park opens to the public in Hong Kong");
    }

    @Test
    @DisplayName("deleting something absent is a 404, not a silent success")
    void testIfDeleteThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().delete("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Mock
    private Root<NewsArticle> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder builder;

    @Mock
    private Path<List<String>> tagsPath;

    @Mock
    private Path<Object> slugPath;

    private Specification<NewsArticle> capturedSpec() {
        ArgumentCaptor<Specification<NewsArticle>> specification = ArgumentCaptor.captor();
        verify(repository).findAll(specification.capture(), any(Sort.class));
        return specification.getValue();
    }

    @Test
    @DisplayName("get maps the article found at the slug, body included")
    void testIfGetFindsTheArticle() {
        when(repository.findBySlug(NewsTestData.SLUG)).thenReturn(Optional.of(NewsTestData.article()));

        ArticleResponse found = service().get(NewsTestData.SLUG);

        assertThat(found.slug()).isEqualTo(NewsTestData.SLUG);
        assertThat(found.body()).hasSize(3);
        assertThat(found.createdAt()).isEqualTo(NewsTestData.CREATED);
    }

    @Test
    @DisplayName("list returns summaries, which carry tags but no body")
    void testIfListReturnsSummariesWithoutBody() {
        when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of(NewsTestData.article()));

        List<ArticleSummaryResponse> found = service().list(null, null, null);

        assertThat(found).singleElement().satisfies(summary -> {
            assertThat(summary.slug()).isEqualTo(NewsTestData.SLUG);
            assertThat(summary.tags()).containsExactly("buildings", "cities-and-communities");
        });
    }

    @Test
    @DisplayName("nothing matching is an empty list")
    void testIfListReturnsEmptyWhenNothingMatches() {
        when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());

        assertThat(service().list("no-such-tag", null, null)).isEmpty();
    }

    @Test
    @DisplayName("a negative limit is ignored too")
    void testIfNegativeLimitIsIgnored() {
        when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of(NewsTestData.article()));

        assertThat(service().list(null, null, -1)).hasSize(1);
        verify(repository, never()).findAll(anySpec(), any(Pageable.class));
    }

    @Test
    @DisplayName("no tag and no exclude build no predicate")
    void testIfNoFilterBuildsNoPredicate() {
        when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());
        service().list(null, null, null);

        assertThat(capturedSpec().toPredicate(root, query, builder)).isNull();
    }

    @Test
    @DisplayName("blank tag and exclude are no filter")
    void testIfBlankTagAndExcludeAreIgnored() {
        when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());
        service().list("  ", "", null);

        assertThat(capturedSpec().toPredicate(root, query, builder)).isNull();
        verify(root, never()).get(any(String.class));
    }

    @Test
    @DisplayName("tag filters with isMember, never a join, and exclude with notEqual on slug")
    void testIfTagUsesIsMemberAndExcludeUsesNotEqual() {
        when(repository.findAll(anySpec(), any(Sort.class))).thenReturn(List.of());
        doReturn(tagsPath).when(root).get("tags");
        doReturn(slugPath).when(root).get("slug");

        service().list("buildings", NewsTestData.SLUG, null);
        capturedSpec().toPredicate(root, query, builder);

        verify(builder).isMember("buildings", tagsPath);
        verify(builder).notEqual(slugPath, NewsTestData.SLUG);
        verify(root, never()).join("tags");
    }

    @Test
    @DisplayName("create saves the article with its tags normalised")
    void testIfCreateSavesArticleWithNormalisedTags() {
        ArticleRequest request = NewsTestData.request();
        ArticleRequest messy = new ArticleRequest(
                request.slug(), request.title(), request.excerpt(), request.body(), request.category(),
                request.publishedAt(), request.readingMinutes(), request.imageUrl(),
                List.of("  Water and Environment ", "water-and-environment", "Rail"));
        when(repository.existsBySlug(NewsTestData.SLUG)).thenReturn(false);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ArticleResponse created = service().create(messy);

        assertThat(created.tags()).containsExactly("water-and-environment", "rail");
        ArgumentCaptor<NewsArticle> saved = ArgumentCaptor.forClass(NewsArticle.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getId()).isNull();
        assertThat(saved.getValue().getCreatedAt()).isNull();
    }

    @Test
    @DisplayName("update keeps the managed collections and replaces their contents")
    void testIfUpdateKeepsTheManagedCollections() {
        NewsArticle existing = NewsTestData.article();
        List<String> body = existing.getBody();
        List<String> tags = existing.getTags();
        existing.getBody().set(0, "An old paragraph.");
        when(repository.findBySlug(NewsTestData.SLUG)).thenReturn(Optional.of(existing));

        service().update(NewsTestData.SLUG, NewsTestData.request());

        assertThat(existing.getBody()).isSameAs(body).first().asString().startsWith("Kai Tak Sports Park");
        assertThat(existing.getTags()).isSameAs(tags);
        // The audit pair belongs to Hibernate and survives an update.
        assertThat(existing.getCreatedAt()).isEqualTo(NewsTestData.CREATED);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("updating something absent is a 404")
    void testIfUpdateThrowsNotFoundForUnknownSlug() {
        when(repository.findBySlug(NewsTestData.SLUG)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().update(NewsTestData.SLUG, NewsTestData.request()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("delete removes the article found at the slug")
    void testIfDeleteRemovesTheArticle() {
        NewsArticle existing = NewsTestData.article();
        when(repository.findBySlug(NewsTestData.SLUG)).thenReturn(Optional.of(existing));

        service().delete(NewsTestData.SLUG);

        verify(repository).delete(existing);
    }
}
