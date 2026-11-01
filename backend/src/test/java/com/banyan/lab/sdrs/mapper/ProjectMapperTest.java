package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.dto.ProjectLocationDto;
import com.banyan.lab.sdrs.dto.ProjectRequest;
import com.banyan.lab.sdrs.dto.ProjectResponse;
import com.banyan.lab.sdrs.dto.StatDto;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Project;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.entity.Stat;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/** Rows → slugs on the way out; references left to the service on the way in. */
class ProjectMapperTest {

    private final ProjectMapper mapper = Mappers.getMapper(ProjectMapper.class);

    private static ProjectRequest request(String slug, ProjectLocationDto location) {
        return new ProjectRequest(
                slug, "Thames Tideway", location, 2025, "Tideway", List.of("water"), List.of("tunnels"),
                "A super sewer.", "Twenty-five kilometres under the river.", null,
                List.of(new StatDto("25", "km", "Of tunnel")), List.of("Cleaner river"));
    }

    @Test
    @DisplayName("maps every field, with markets and services as slugs")
    void testIfToResponseMapsEveryFieldWithSlugReferences() {
        ProjectResponse response = mapper.toResponse(CollectionTestData.project());

        assertThat(response.slug()).isEqualTo(CollectionTestData.PROJECT_SLUG);
        assertThat(response.title()).isEqualTo("Crossrail / Elizabeth line");
        assertThat(response.location()).isEqualTo(new ProjectLocationDto("London", "United Kingdom"));
        assertThat(response.year()).isEqualTo(2022);
        assertThat(response.client()).isEqualTo("Crossrail Limited");
        assertThat(response.marketSlugs()).containsExactly(CollectionTestData.MARKET_SLUG);
        assertThat(response.serviceSlugs()).containsExactly(CollectionTestData.SERVICE_SLUG);
        assertThat(response.stats()).containsExactly(new StatDto("10", null, "New stations designed"));
        assertThat(response.highlights()).hasSize(1);
        assertThat(response.imageUrl()).endsWith("elizabeth-line.jpg");
    }

    @Test
    @DisplayName("a cascaded-away market or service reads back as a null element and is dropped")
    void testIfNullMarketsAndServicesAreDropped() {
        Project project = CollectionTestData.project();
        project.getMarkets().add(0, null);
        project.getServices().add(null);

        ProjectResponse response = mapper.toResponse(project);

        assertThat(response.marketSlugs()).containsExactly(CollectionTestData.MARKET_SLUG);
        assertThat(response.serviceSlugs()).containsExactly(CollectionTestData.SERVICE_SLUG);
    }

    @Test
    @DisplayName("no references maps to empty arrays, never null")
    void testIfNoReferencesMapToEmptyArrays() {
        Project project = CollectionTestData.project();
        project.getMarkets().clear();
        project.getServices().clear();

        ProjectResponse response = mapper.toResponse(project);

        assertThat(response.marketSlugs()).isEmpty();
        assertThat(response.serviceSlugs()).isEmpty();
    }

    @Test
    @DisplayName("a location without a city keeps the city null")
    void testIfLocationWithoutCityKeepsCityNull() {
        Project project = CollectionTestData.project();
        project.getLocation().setCity(null);

        assertThat(mapper.toResponse(project).location()).isEqualTo(new ProjectLocationDto(null, "United Kingdom"));
    }

    @Test
    @DisplayName("toEntity leaves id, references and audit fields for others to set")
    void testIfToEntityIgnoresIdReferencesAndAuditFields() {
        Project project = mapper.toEntity(request("tideway", new ProjectLocationDto(null, "United Kingdom")));

        assertThat(project.getId()).isNull();
        assertThat(project.getCreatedAt()).isNull();
        assertThat(project.getUpdatedAt()).isNull();
        // Slugs → rows is the service's job; the mapper never builds a stub row.
        assertThat(project.getMarkets()).isEmpty();
        assertThat(project.getServices()).isEmpty();
        assertThat(project.getSlug()).isEqualTo("tideway");
        assertThat(project.getLocation().getCity()).isNull();
        assertThat(project.getLocation().getCountry()).isEqualTo("United Kingdom");
        assertThat(project.getStats()).singleElement().extracting(Stat::getUnit).isEqualTo("km");
    }

    @Test
    @DisplayName("update writes onto the entity but keeps its id, slug, references and audit fields")
    void testIfUpdateKeepsIdSlugReferencesAndAuditFields() {
        Project existing = CollectionTestData.project();
        existing.setId(7L);
        Instant created = Instant.parse("2026-01-01T00:00:00Z");
        existing.setCreatedAt(created);
        List<Market> markets = List.copyOf(existing.getMarkets());
        List<Service> services = List.copyOf(existing.getServices());

        mapper.update(request("a-different-slug", new ProjectLocationDto("Greenwich", "UK")), existing);

        assertThat(existing.getId()).isEqualTo(7L);
        assertThat(existing.getSlug()).isEqualTo(CollectionTestData.PROJECT_SLUG);
        assertThat(existing.getCreatedAt()).isEqualTo(created);
        assertThat(existing.getMarkets()).containsExactlyElementsOf(markets);
        assertThat(existing.getServices()).containsExactlyElementsOf(services);
        assertThat(existing.getTitle()).isEqualTo("Thames Tideway");
        assertThat(existing.getLocation().getCity()).isEqualTo("Greenwich");
        assertThat(existing.getHighlights()).containsExactly("Cleaner river");
        assertThat(existing.getImageUrl()).isNull();
    }

    @Test
    @DisplayName("lists map element for element, and null maps to null")
    void testIfListsMapEachProjectAndNullMapsToNull() {
        assertThat(mapper.toResponses(List.of(CollectionTestData.project(), CollectionTestData.project())))
                .hasSize(2);
        assertThat(mapper.toResponses(List.of())).isEmpty();
        assertThat(mapper.toResponse(null)).isNull();
        assertThat(mapper.toEntity(null)).isNull();
    }
}
