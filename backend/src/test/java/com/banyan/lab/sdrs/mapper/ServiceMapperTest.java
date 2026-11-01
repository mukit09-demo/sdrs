package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.dto.ServiceRequest;
import com.banyan.lab.sdrs.dto.ServiceResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.entity.ServiceCategory;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/** Related markets go rows → slugs here; the reverse is the service's. */
class ServiceMapperTest {

    private final ServiceMapper mapper = Mappers.getMapper(ServiceMapper.class);

    private static ServiceRequest request(String slug) {
        return new ServiceRequest(
                slug, "Digital Twins", ServiceCategory.DIGITAL, "Models that stay live",
                "Asset data, joined up.", "https://example.com/twin.jpg", List.of("Sensors"),
                List.of("buildings"));
    }

    @Test
    @DisplayName("maps every field, with related markets as slugs")
    void testIfToResponseMapsEveryFieldWithMarketSlugs() {
        ServiceResponse response = mapper.toResponse(CollectionTestData.service());

        assertThat(response.slug()).isEqualTo(CollectionTestData.SERVICE_SLUG);
        assertThat(response.name()).isEqualTo("Structural Engineering");
        assertThat(response.category()).isEqualTo(ServiceCategory.DESIGN_AND_ENGINEERING);
        assertThat(response.category().getLabel()).isEqualTo("Design & Engineering");
        assertThat(response.imageUrl()).isNull();
        assertThat(response.capabilities()).containsExactly("Tall and supertall buildings");
        assertThat(response.relatedMarketSlugs()).containsExactly(CollectionTestData.MARKET_SLUG);
    }

    @Test
    @DisplayName("a cascaded-away market reads back as a null element and is dropped")
    void testIfNullRelatedMarketsAreDropped() {
        Service service = CollectionTestData.service();
        service.getRelatedMarkets().add(null);
        service.getRelatedMarkets().add(CollectionTestData.market("rail", "Rail"));

        assertThat(mapper.toResponse(service).relatedMarketSlugs())
                .containsExactly(CollectionTestData.MARKET_SLUG, "rail");
    }

    @Test
    @DisplayName("marketSlugs keeps the order of the rows")
    void testIfMarketSlugsKeepTheRowOrder() {
        List<Market> markets = List.of(
                CollectionTestData.market("water", "Water"), CollectionTestData.market("rail", "Rail"));

        assertThat(mapper.marketSlugs(markets)).containsExactly("water", "rail");
        assertThat(mapper.marketSlugs(List.of())).isEmpty();
    }

    @Test
    @DisplayName("toEntity ignores the related markets and server-owned fields")
    void testIfToEntityIgnoresRelatedMarketsAndServerFields() {
        Service service = mapper.toEntity(request("digital-twins"));

        assertThat(service.getId()).isNull();
        assertThat(service.getCreatedAt()).isNull();
        assertThat(service.getRelatedMarkets()).isEmpty();
        assertThat(service.getSlug()).isEqualTo("digital-twins");
        assertThat(service.getCategory()).isEqualTo(ServiceCategory.DIGITAL);
        assertThat(service.getImageUrl()).isEqualTo("https://example.com/twin.jpg");
    }

    @Test
    @DisplayName("update keeps the id, slug and related markets")
    void testIfUpdateKeepsIdSlugAndRelatedMarkets() {
        Service existing = CollectionTestData.service();
        existing.setId(3L);

        mapper.update(request("a-different-slug"), existing);

        assertThat(existing.getId()).isEqualTo(3L);
        assertThat(existing.getSlug()).isEqualTo(CollectionTestData.SERVICE_SLUG);
        assertThat(existing.getRelatedMarkets()).extracting(Market::getSlug)
                .containsExactly(CollectionTestData.MARKET_SLUG);
        assertThat(existing.getName()).isEqualTo("Digital Twins");
        assertThat(existing.getCapabilities()).containsExactly("Sensors");
    }

    @Test
    @DisplayName("null maps to null")
    void testIfNullMapsToNull() {
        assertThat(mapper.toResponse(null)).isNull();
        assertThat(mapper.toEntity(null)).isNull();
        assertThat(mapper.toResponses(List.of())).isEmpty();
    }
}
