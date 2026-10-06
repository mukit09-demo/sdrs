package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.NewsMapper;
import com.banyan.lab.sdrs.repository.NewsRepository;
import com.banyan.lab.sdrs.support.NewsTestData;
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
    void getMissingThrows() {
        when(repository.findById("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().get("nope"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("nope");
    }

    @Test
    @DisplayName("creating over an existing slug conflicts instead of replacing")
    void createDuplicateThrows() {
        when(repository.existsById(NewsTestData.SLUG)).thenReturn(true);

        assertThatThrownBy(() -> service().create(NewsTestData.request()))
                .isInstanceOf(DuplicateResourceException.class);

        // The important half: nothing was written.
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("sorts newest first, with slug as a stable tiebreaker")
    void listSortsNewestFirst() {
        when(repository.findAll(anySpec(), any(Sort.class)))
                .thenReturn(List.of(NewsTestData.article()));

        service().list(null, null, null);

        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findAll(anySpec(), sort.capture());

        assertThat(sort.getValue().getOrderFor("publishedAt").getDirection())
                .isEqualTo(Sort.Direction.DESC);
        assertThat(sort.getValue().getOrderFor("slug").getDirection())
                .isEqualTo(Sort.Direction.ASC);
    }

    @Test
    @DisplayName("limit is pushed into the query, not applied after loading every row")
    void limitBecomesAPageRequest() {
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
    void zeroLimitIsIgnored() {
        when(repository.findAll(anySpec(), any(Sort.class)))
                .thenReturn(List.of(NewsTestData.article()));

        assertThat(service().list(null, null, 0)).hasSize(1);

        verify(repository, never()).findAll(anySpec(), any(Pageable.class));
    }

    @Test
    @DisplayName("a body slug that disagrees with the path is rejected, not silently picked")
    void updateRejectsSlugMismatch() {
        ArticleRequest request = NewsTestData.request();

        assertThatThrownBy(() -> service().update("a-different-slug", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("a-different-slug");

        verify(repository, never()).findById(any());
    }

    @Test
    @DisplayName("update replaces the managed entity in place")
    void updateReplacesInPlace() {
        NewsArticle existing = NewsTestData.article();
        existing.setTitle("The old title");
        when(repository.findById(NewsTestData.SLUG)).thenReturn(Optional.of(existing));

        service().update(NewsTestData.SLUG, NewsTestData.request());

        assertThat(existing.getTitle()).isEqualTo(
                "Kai Tak Sports Park opens to the public in Hong Kong");
    }

    @Test
    @DisplayName("deleting something absent is a 404, not a silent success")
    void deleteMissingThrows() {
        when(repository.findById("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().delete("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
