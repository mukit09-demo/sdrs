package com.banyan.lab.sdrs.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

/** The single error shape, and the empty-field omission the CMS relies on. */
class ApiErrorTest {

    private final JsonMapper json = JsonMapper.builder().build();

    @Test
    @DisplayName("of() without field errors stamps now and leaves the field map empty")
    void testIfOfWithoutFieldErrorsStampsNowAndLeavesThemEmpty() {
        Instant before = Instant.now();

        ApiError error = ApiError.of(404, "Not Found", "No article", "/api/articles/x");

        assertThat(error.timestamp()).isBetween(before, Instant.now());
        assertThat(error.status()).isEqualTo(404);
        assertThat(error.fieldErrors()).isEmpty();
    }

    @Test
    @DisplayName("of() with field errors carries them")
    void testIfOfWithFieldErrorsCarriesThem() {
        ApiError error = ApiError.of(400, "Bad Request", "Invalid", "/api/markets",
                Map.of("slug", "must not be blank"));

        assertThat(error.fieldErrors()).containsEntry("slug", "must not be blank");
    }

    @Test
    @DisplayName("an empty field map is omitted from the JSON, a populated one is not")
    void testIfEmptyFieldErrorsAreOmittedFromJson() {
        String plain = json.writeValueAsString(ApiError.of(404, "Not Found", "No article", "/x"));
        String withFields = json.writeValueAsString(
                ApiError.of(400, "Bad Request", "Invalid", "/x", Map.of("slug", "must not be blank")));

        assertThat(plain).doesNotContain("fieldErrors").contains("\"status\":404");
        assertThat(withFields).contains("\"fieldErrors\":{\"slug\":\"must not be blank\"}");
    }

    @Test
    @DisplayName("exception messages name the resource and the id")
    void testIfExceptionMessagesNameTheResourceAndId() {
        assertThat(new ResourceNotFoundException("job", "7")).hasMessage("No job with id \"7\"");
        assertThat(new DuplicateResourceException("service", "digital"))
                .hasMessage("A service with id \"digital\" already exists");
    }
}
