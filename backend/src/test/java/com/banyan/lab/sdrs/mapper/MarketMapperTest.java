package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.dto.MarketRequest;
import com.banyan.lab.sdrs.dto.MarketResponse;
import com.banyan.lab.sdrs.dto.StatDto;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Stat;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/** Market ↔ DTO, including the embeddable stats and the in-place update. */
class MarketMapperTest {

    private final MarketMapper mapper = Mappers.getMapper(MarketMapper.class);

    private static MarketRequest request(String slug, List<StatDto> stats) {
        return new MarketRequest(
                slug, "Energy", "Power that lasts", "Generation, grids and storage.",
                "/video/markets/energy.webm", List.of("Grid connection", "Storage"), stats);
    }

    @Test
    @DisplayName("maps every field, stats in order, a missing unit left null")
    void testIfToResponseMapsEveryField() {
        MarketResponse response = mapper.toResponse(CollectionTestData.market());

        assertThat(response.slug()).isEqualTo(CollectionTestData.MARKET_SLUG);
        assertThat(response.name()).isEqualTo("Buildings");
        assertThat(response.filmUrl()).isEqualTo("/video/markets/buildings.webm");
        assertThat(response.capabilities()).hasSize(2);
        assertThat(response.stats()).containsExactly(
                new StatDto("45", "%", "Average embodied carbon saving on reuse schemes"),
                new StatDto("900", null, "Certified sustainable buildings delivered"));
    }

    @Test
    @DisplayName("toEntity leaves the id and audit pair to the database")
    void testIfToEntityIgnoresIdAndAuditFields() {
        Market market = mapper.toEntity(request("energy", List.of(new StatDto("3", "GW", "Connected"))));

        assertThat(market.getId()).isNull();
        assertThat(market.getCreatedAt()).isNull();
        assertThat(market.getUpdatedAt()).isNull();
        assertThat(market.getSlug()).isEqualTo("energy");
        assertThat(market.getStats()).singleElement().satisfies(stat -> {
            assertThat(stat.getValue()).isEqualTo("3");
            assertThat(stat.getUnit()).isEqualTo("GW");
            assertThat(stat.getLabel()).isEqualTo("Connected");
        });
    }

    @Test
    @DisplayName("update keeps id, slug and audit fields, and refills the existing collections")
    void testIfUpdateKeepsIdentityAndRefillsCollections() {
        Market existing = CollectionTestData.market();
        existing.setId(5L);
        Instant created = Instant.parse("2026-01-01T00:00:00Z");
        existing.setCreatedAt(created);
        List<String> capabilities = existing.getCapabilities();
        List<Stat> stats = existing.getStats();

        mapper.update(request("a-different-slug", List.of()), existing);

        assertThat(existing.getId()).isEqualTo(5L);
        assertThat(existing.getSlug()).isEqualTo(CollectionTestData.MARKET_SLUG);
        assertThat(existing.getCreatedAt()).isEqualTo(created);
        assertThat(existing.getName()).isEqualTo("Energy");
        assertThat(existing.getCapabilities()).isSameAs(capabilities)
                .containsExactly("Grid connection", "Storage");
        // An empty list in the request empties the stats rather than keeping the old ones.
        assertThat(existing.getStats()).isSameAs(stats).isEmpty();
    }

    @Test
    @DisplayName("an entity with no capabilities or stats maps to empty arrays")
    void testIfEmptyCollectionsMapToEmptyArrays() {
        Market market = CollectionTestData.market();
        market.setCapabilities(new ArrayList<>());
        market.setStats(new ArrayList<>());

        MarketResponse response = mapper.toResponse(market);

        assertThat(response.capabilities()).isEmpty();
        assertThat(response.stats()).isEmpty();
    }

    @Test
    @DisplayName("lists map element for element, and null maps to null")
    void testIfListsMapEachMarketAndNullMapsToNull() {
        assertThat(mapper.toResponses(List.of(
                CollectionTestData.market(), CollectionTestData.market("rail", "Rail"))))
                .extracting(MarketResponse::slug)
                .containsExactly("buildings", "rail");
        assertThat(mapper.toResponse(null)).isNull();
        assertThat(mapper.toEntity(null)).isNull();
    }
}
