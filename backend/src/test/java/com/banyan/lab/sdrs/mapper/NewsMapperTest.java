package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.entity.NewsType;
import com.banyan.lab.sdrs.support.NewsTestData;
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
    void mapsCategory() {
        ArticleResponse response = mapper.toResponse(NewsTestData.article());

        assertThat(response.category()).isEqualTo(NewsType.PRESS_RELEASE);
        // The label, not the constant — this is what reaches CardItem.eyebrow.
        assertThat(response.category().getLabel()).isEqualTo("Press release");
    }

    @Test
    @DisplayName("preserves body paragraph order")
    void preservesBodyOrder() {
        ArticleResponse response = mapper.toResponse(NewsTestData.article());

        assertThat(response.body())
                .hasSize(3)
                .element(0)
                .asString()
                .startsWith("Kai Tak Sports Park has opened");
        assertThat(response.body().get(2)).startsWith("The district cooling network");
    }

    @Test
    @DisplayName("leaves an absent image url null rather than blank")
    void keepsImageUrlAbsent() {
        ArticleResponse response = mapper.toResponse(NewsTestData.article());

        // An empty string would be truthy enough to break the front end's
        // gradient placeholder, which branches on the url being absent.
        assertThat(response.image().url()).isNull();
        assertThat(response.image().alt()).isEqualTo("A stadium with a retractable roof at dusk");
        assertThat(response.image().seed()).isEqualTo("news-kai-tak-park");
    }

    @Test
    @DisplayName("round-trips a request through the entity without losing a field")
    void roundTrips() {
        NewsArticle entity = mapper.toEntity(NewsTestData.request());
        ArticleResponse response = mapper.toResponse(entity);

        assertThat(response)
                .usingRecursiveComparison()
                .isEqualTo(mapper.toResponse(NewsTestData.article()));
    }

    @Test
    @DisplayName("does not carry audit timestamps in from a request")
    void ignoresAuditFields() {
        NewsArticle entity = mapper.toEntity(NewsTestData.request());

        // Hibernate sets these; a client must not be able to.
        assertThat(entity.getCreatedAt()).isNull();
        assertThat(entity.getUpdatedAt()).isNull();
    }
}
