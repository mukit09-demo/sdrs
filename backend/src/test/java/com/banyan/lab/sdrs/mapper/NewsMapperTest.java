package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.dto.ArticleSummaryResponse;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.entity.NewsType;
import com.banyan.lab.sdrs.support.NewsTestData;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/**
 * The generated mapper, with no Spring context — if this needs a container to
 * pass, the mapping has a dependency it should not have.
 */
class NewsMapperTest {

    private final NewsMapper mapper = Mappers.getMapper(NewsMapper.class);

    @Test
    @DisplayName("maps newsType to the category field the front end expects")
    void testIfNewsTypeMapsToCategory() {
        ArticleResponse response = mapper.toResponse(NewsTestData.article());

        assertThat(response.category()).isEqualTo(NewsType.PRESS_RELEASE);
        // The label, not the constant — this is what reaches CardItem.eyebrow.
        assertThat(response.category().getLabel()).isEqualTo("Press release");
    }

    @Test
    @DisplayName("preserves body paragraph order")
    void testIfBodyParagraphOrderIsPreserved() {
        ArticleResponse response = mapper.toResponse(NewsTestData.article());

        assertThat(response.body())
                .hasSize(3)
                .element(0)
                .asString()
                .startsWith("Kai Tak Sports Park has opened");
        assertThat(response.body().get(2)).startsWith("The district cooling network");
    }

    @Test
    @DisplayName("a summary never reads the body, so the lazy collection is not loaded")
    void testIfSummaryNeverReadsTheBody() {
        NewsArticle article = spy(NewsTestData.article());

        ArticleSummaryResponse summary = mapper.toSummary(article);

        // On a managed entity, this call is what would fire the query against
        // news_article_body. Not calling it is the point of the summary type.
        verify(article, never()).getBody();
        assertThat(summary.category()).isEqualTo(NewsType.PRESS_RELEASE);
        assertThat(summary.excerpt()).startsWith("The 50,000-seat stadium");
        assertThat(summary.tags()).containsExactly("buildings", "cities-and-communities");
    }

    @Test
    @DisplayName("a summary carries every field of the full response except the body")
    void testIfSummaryMatchesResponseWithoutBody() {
        assertThat(mapper.toSummary(NewsTestData.article()))
                .usingRecursiveComparison()
                .isEqualTo(mapper.toResponse(NewsTestData.article()));
    }

    @Test
    @DisplayName("leaves an absent image url null rather than blank")
    void testIfAbsentImageUrlStaysNull() {
        ArticleResponse response = mapper.toResponse(NewsTestData.article());

        // An empty string would be truthy enough to break the front end's
        // gradient placeholder, which branches on the url being absent.
        assertThat(response.imageUrl()).isNull();
    }

    @Test
    @DisplayName("round-trips a request through the entity without losing a field")
    void testIfRequestRoundTripsThroughEntity() {
        NewsArticle entity = mapper.toEntity(NewsTestData.request());
        ArticleResponse response = mapper.toResponse(entity);

        assertThat(response)
                .usingRecursiveComparison()
                // Everything a client sends must survive the trip — but the
                // audit pair is not something a client sends. `toEntity`
                // ignores it by design, so it is null here and set on the
                // fixture; `ignoresAuditFields` below is what pins that.
                .ignoringFields("createdAt", "updatedAt")
                .isEqualTo(mapper.toResponse(NewsTestData.article()));
    }

    @Test
    @DisplayName("normalises tags on the way in: lowercase, hyphenated, no blanks or repeats")
    void testIfTagsAreNormalisedOnTheWayIn() {
        ArticleRequest base = NewsTestData.request();
        ArticleRequest request = new ArticleRequest(
                base.slug(), base.title(), base.excerpt(), base.body(), base.category(),
                base.publishedAt(), base.readingMinutes(), base.imageUrl(),
                List.of("  Buildings ", "Water and\tEnvironment", "buildings", "ENERGY"));

        NewsArticle entity = mapper.toEntity(request);

        // First-use order survives: the first tag is the one related reading uses.
        assertThat(entity.getTags())
                .containsExactly("buildings", "water-and-environment", "energy");
    }

    @Test
    @DisplayName("leaves the body alone — the tag rule is not applied to other string lists")
    void testIfBodyIsNotNormalised() {
        NewsArticle entity = mapper.toEntity(NewsTestData.request());

        assertThat(entity.getBody().getFirst())
                .isEqualTo("Kai Tak Sports Park has opened on the site of Hong Kong's former airport.");
    }

    @Test
    @DisplayName("does not carry audit timestamps in from a request")
    void testIfToEntityIgnoresAuditFields() {
        NewsArticle entity = mapper.toEntity(NewsTestData.request());

        // Hibernate sets these; a client must not be able to.
        assertThat(entity.getCreatedAt()).isNull();
        assertThat(entity.getUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("null tags stay null rather than becoming an empty list")
    void testIfNullTagsStayNull() {
        assertThat(mapper.normaliseTags(null)).isNull();
    }

    @Test
    @DisplayName("tags that are only whitespace are dropped, leaving an empty list")
    void testIfBlankTagsAreDropped() {
        assertThat(mapper.normaliseTags(List.of("", "   ", "\t\n"))).isEmpty();
    }

    @Test
    @DisplayName("any run of whitespace, including Unicode spaces, becomes one hyphen")
    void testIfWhitespaceRunsCollapseToOneHyphen() {
        assertThat(mapper.normaliseTags(List.of("cities \t\n and\u00A0communities")))
                .containsExactly("cities-and-communities");
    }

    @Test
    @DisplayName("normalised tags are mutable, since replaceWith refills the entity's list")
    void testIfNormalisedTagsAreMutable() {
        List<String> tags = mapper.normaliseTags(List.of("rail"));

        tags.add("water");

        assertThat(tags).containsExactly("rail", "water");
    }

    @Test
    @DisplayName("an image url, when present, is carried through")
    void testIfPresentImageUrlIsCarriedThrough() {
        NewsArticle article = NewsTestData.article();
        article.setImageUrl("https://example.com/kai-tak.jpg");

        assertThat(mapper.toResponse(article).imageUrl()).isEqualTo("https://example.com/kai-tak.jpg");
        assertThat(mapper.toSummary(article).imageUrl()).isEqualTo("https://example.com/kai-tak.jpg");
    }

    @Test
    @DisplayName("summaries map element for element, and null maps to null")
    void testIfSummariesMapEachArticleAndNullMapsToNull() {
        assertThat(mapper.toSummaries(List.of(NewsTestData.article(), NewsTestData.article()))).hasSize(2);
        assertThat(mapper.toSummaries(List.of())).isEmpty();
        assertThat(mapper.toResponse(null)).isNull();
        assertThat(mapper.toEntity(null)).isNull();
    }
}
