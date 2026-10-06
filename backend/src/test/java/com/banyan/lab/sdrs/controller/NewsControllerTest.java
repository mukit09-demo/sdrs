package com.banyan.lab.sdrs.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banyan.lab.sdrs.config.SecurityConfig;
import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.NewsMapper;
import com.banyan.lab.sdrs.service.NewsService;
import com.banyan.lab.sdrs.support.NewsTestData;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * The HTTP contract.
 *
 * <p>This is the test that matters most, because it is the only place the
 * backend and {@code packages/shared/types/content.ts} are checked against each
 * other. If {@code category} starts serialising as {@code "PRESS_RELEASE"} or
 * {@code publishedAt} as a timestamp, nothing else fails — the site just renders
 * wrongly.
 *
 * <p>{@link SecurityConfig} is imported explicitly: {@code @WebMvcTest} scans
 * controllers and {@code @ControllerAdvice}, not {@code @Configuration}, so
 * without this the filter chain under test would be Boot's default rather than
 * ours.
 *
 * <p>Note the import: Spring Boot 4's module split moved {@code @WebMvcTest}
 * from {@code org.springframework.boot.test.autoconfigure.web.servlet} to
 * {@code org.springframework.boot.webmvc.test.autoconfigure}. Every 3.x example
 * online still shows the old one.
 */
@WebMvcTest(NewsController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "sdrs.admin.username=admin",
    "sdrs.admin.password=not-the-real-one"
})
class NewsControllerTest {

    private static final String VALID_BODY = """
            {
              "slug": "kai-tak-sports-park-opens",
              "title": "Kai Tak Sports Park opens to the public in Hong Kong",
              "excerpt": "The stadium has hosted its first full-capacity event.",
              "body": ["One paragraph."],
              "category": "Press release",
              "publishedAt": "2026-08-28",
              "readingMinutes": 4,
              "author": { "name": "Priya Raghunathan", "role": "Comms Lead" },
              "image": { "alt": "A stadium at dusk", "seed": "news-kai-tak-park" },
              "tags": ["buildings"]
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private NewsService service;

    private static ArticleResponse response() {
        return Mappers.getMapper(NewsMapper.class).toResponse(NewsTestData.article());
    }

    @Test
    @DisplayName("GET /api/articles serves the Article shape the front end types")
    void listMatchesTheSharedContract() throws Exception {
        when(service.list(null, null, null)).thenReturn(List.of(response()));

        mvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug").value(NewsTestData.SLUG))
                // The label, not the enum constant.
                .andExpect(jsonPath("$[0].category").value("Press release"))
                // A bare date, not an ISO timestamp and not an epoch number.
                .andExpect(jsonPath("$[0].publishedAt").value("2026-08-28"))
                .andExpect(jsonPath("$[0].readingMinutes").value(4))
                .andExpect(jsonPath("$[0].author.name").value("Priya Raghunathan"))
                .andExpect(jsonPath("$[0].body", hasSize(3)))
                .andExpect(jsonPath("$[0].tags[0]").value("buildings"));
    }

    @Test
    @DisplayName("an image with no url omits the key rather than sending null")
    void absentImageUrlIsOmitted() throws Exception {
        when(service.list(null, null, null)).thenReturn(List.of(response()));

        mvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].image.url").doesNotExist())
                .andExpect(jsonPath("$[0].image.alt").exists())
                .andExpect(jsonPath("$[0].image.seed").value("news-kai-tak-park"));
    }

    @Test
    @DisplayName("tag, limit and exclude reach the service under the names the client sends")
    void passesQueryParameters() throws Exception {
        when(service.list("buildings", "other-slug", 3)).thenReturn(List.of());

        mvc.perform(get("/api/articles")
                        .param("tag", "buildings")
                        .param("limit", "3")
                        .param("exclude", "other-slug"))
                .andExpect(status().isOk());

        verify(service).list("buildings", "other-slug", 3);
    }

    @Test
    @DisplayName("a missing slug is a 404 carrying the error body")
    void missingSlugIsNotFound() throws Exception {
        when(service.get("nope")).thenThrow(new ResourceNotFoundException("article", "nope"));

        mvc.perform(get("/api/articles/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/api/articles/nope"));
    }

    @Test
    @DisplayName("writes are rejected without a credential")
    void unauthenticatedWriteIsRejected() throws Exception {
        mvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isUnauthorized());

        mvc.perform(delete("/api/articles/" + NewsTestData.SLUG))
                .andExpect(status().isUnauthorized());

        verify(service, never()).create(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("an admin can create, and gets a Location header back")
    void adminCanCreate() throws Exception {
        when(service.create(any())).thenReturn(response());

        mvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/articles/" + NewsTestData.SLUG));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("an unknown category is a 400 that names the valid ones")
    void unknownCategoryIsBadRequest() throws Exception {
        mvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY.replace("\"Press release\"", "\"Hot take\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        containsString("Press release")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("validation failures come back per field")
    void validationFailuresAreFieldKeyed() throws Exception {
        mvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY.replace("\"body\": [\"One paragraph.\"]", "\"body\": []")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.body").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("delete returns 204 with no body")
    void adminCanDelete() throws Exception {
        mvc.perform(delete("/api/articles/" + NewsTestData.SLUG))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(service).delete(eq(NewsTestData.SLUG));
    }
}
