package com.banyan.lab.sdrs.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banyan.lab.sdrs.config.SecurityConfig;
import com.banyan.lab.sdrs.dto.ProjectResponse;
import com.banyan.lab.sdrs.mapper.ProjectMapper;
import com.banyan.lab.sdrs.service.ProjectService;
import com.banyan.lab.sdrs.support.CollectionTestData;
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

/** The {@code Project} contract, and the query parameters {@code listProjects} sends. */
@WebMvcTest(ProjectController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "sdrs.admin.username=admin",
    "sdrs.admin.password=not-the-real-one"
})
class ProjectControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ProjectService service;

    private static ProjectResponse response() {
        return Mappers.getMapper(ProjectMapper.class).toResponse(CollectionTestData.project());
    }

    @Test
    @DisplayName("GET /api/projects serves the Project shape the front end types")
    void testIfListMatchesTheSharedContract() throws Exception {
        when(service.list(null, null, null, null)).thenReturn(List.of(response()));

        mvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("elizabeth-line"))
                .andExpect(jsonPath("$[0].title").value("Crossrail / Elizabeth line"))
                .andExpect(jsonPath("$[0].location.city").value("London"))
                .andExpect(jsonPath("$[0].location.country").value("United Kingdom"))
                // A number, not a string.
                .andExpect(jsonPath("$[0].year").value(2022))
                .andExpect(jsonPath("$[0].client").value("Crossrail Limited"))
                .andExpect(jsonPath("$[0].marketSlugs[0]").value("buildings"))
                .andExpect(jsonPath("$[0].serviceSlugs[0]").value("structural-engineering"))
                .andExpect(jsonPath("$[0].summary").exists())
                .andExpect(jsonPath("$[0].description").exists())
                .andExpect(jsonPath("$[0].imageUrl").value(
                        "https://sdrs-media.s3.amazonaws.com/projects/elizabeth-line.jpg"))
                .andExpect(jsonPath("$[0].stats[0].value").value("10"))
                .andExpect(jsonPath("$[0].stats[0].unit").doesNotExist())
                .andExpect(jsonPath("$[0].highlights[0]").exists())
                .andExpect(jsonPath("$[0].markets").doesNotExist())
                .andExpect(jsonPath("$[0].services").doesNotExist());
    }

    @Test
    @DisplayName("market, service, slugs and limit reach the service under the names the client sends")
    void testIfQueryParametersReachTheService() throws Exception {
        mvc.perform(get("/api/projects")
                        .param("market", "buildings")
                        .param("service", "structural-engineering")
                        .param("slugs", "elizabeth-line,kai-tak")
                        .param("limit", "3"))
                .andExpect(status().isOk());

        verify(service).list(
                "buildings", "structural-engineering", List.of("elizabeth-line", "kai-tak"), 3);
    }

    @Test
    @DisplayName("a non-positive limit is a 400, not a 500")
    void testIfNonPositiveLimitIsBadRequest() throws Exception {
        mvc.perform(get("/api/projects").param("limit", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("a project with no location is a 400 against that field")
    void testIfMissingLocationIsBadRequest() throws Exception {
        when(service.create(any())).thenReturn(response());

        mvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "slug": "elizabeth-line",
                                  "title": "Crossrail",
                                  "year": 2022,
                                  "client": "Crossrail Limited",
                                  "marketSlugs": [],
                                  "serviceSlugs": [],
                                  "summary": "A railway.",
                                  "description": "A long railway.",
                                  "stats": [],
                                  "highlights": []
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.location").exists());
    }
}
