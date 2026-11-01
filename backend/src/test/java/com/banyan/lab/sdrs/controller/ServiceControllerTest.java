package com.banyan.lab.sdrs.controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banyan.lab.sdrs.config.SecurityConfig;
import com.banyan.lab.sdrs.dto.ServiceResponse;
import com.banyan.lab.sdrs.mapper.ServiceMapper;
import com.banyan.lab.sdrs.service.ServiceService;
import com.banyan.lab.sdrs.support.CollectionTestData;
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

/** The {@code Service} contract. */
@WebMvcTest(ServiceController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "sdrs.admin.username=admin",
    "sdrs.admin.password=not-the-real-one"
})
class ServiceControllerTest {

    private static final String VALID_BODY = """
            {
              "slug": "structural-engineering",
              "name": "Structural Engineering",
              "category": "Design & Engineering",
              "tagline": "Frames that stand up",
              "description": "Tall and supertall buildings.",
              "capabilities": ["Tall and supertall buildings"],
              "relatedMarketSlugs": ["buildings"]
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ServiceService service;

    private static ServiceResponse response() {
        return Mappers.getMapper(ServiceMapper.class).toResponse(CollectionTestData.service());
    }

    @Test
    @DisplayName("GET /api/services/{slug} serves the Service shape the front end types")
    void testIfGetMatchesTheSharedContract() throws Exception {
        when(service.get(CollectionTestData.SERVICE_SLUG)).thenReturn(response());

        mvc.perform(get("/api/services/" + CollectionTestData.SERVICE_SLUG))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("structural-engineering"))
                .andExpect(jsonPath("$.name").value("Structural Engineering"))
                // The label, not DESIGN_AND_ENGINEERING.
                .andExpect(jsonPath("$.category").value("Design & Engineering"))
                .andExpect(jsonPath("$.tagline").exists())
                .andExpect(jsonPath("$.description").exists())
                .andExpect(jsonPath("$.capabilities[0]").value("Tall and supertall buildings"))
                // Slugs on the wire, not embedded markets.
                .andExpect(jsonPath("$.relatedMarketSlugs[0]").value("buildings"))
                .andExpect(jsonPath("$.relatedMarkets").doesNotExist())
                // No image yet: the key is absent, not null.
                .andExpect(jsonPath("$.imageUrl").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("an unknown category is a 400 that names the valid ones")
    void testIfUnknownCategoryIsBadRequest() throws Exception {
        mvc.perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY.replace("\"Design & Engineering\"", "\"Plumbing\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Design & Engineering")));
    }
}
