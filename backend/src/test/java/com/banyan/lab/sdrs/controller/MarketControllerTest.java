package com.banyan.lab.sdrs.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banyan.lab.sdrs.config.SecurityConfig;
import com.banyan.lab.sdrs.dto.MarketResponse;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.MarketMapper;
import com.banyan.lab.sdrs.service.MarketService;
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

/** The {@code Market} contract — see {@link NewsControllerTest} for why this test matters. */
@WebMvcTest(MarketController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "sdrs.admin.username=admin",
    "sdrs.admin.password=not-the-real-one"
})
class MarketControllerTest {

    private static final String VALID_BODY = """
            {
              "slug": "buildings",
              "name": "Buildings",
              "tagline": "Buildings that earn their carbon",
              "description": "Offices, homes and venues.",
              "filmUrl": "/video/markets/buildings.webm",
              "capabilities": ["Structural and façade engineering"],
              "stats": [{ "value": "45", "unit": "%", "label": "Embodied carbon saving" }]
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private MarketService service;

    private static MarketResponse response() {
        return Mappers.getMapper(MarketMapper.class).toResponse(CollectionTestData.market());
    }

    @Test
    @DisplayName("GET /api/markets serves the Market shape the front end types")
    void testIfListMatchesTheSharedContract() throws Exception {
        when(service.list()).thenReturn(List.of(response()));

        mvc.perform(get("/api/markets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug").value("buildings"))
                .andExpect(jsonPath("$[0].name").value("Buildings"))
                .andExpect(jsonPath("$[0].tagline").exists())
                .andExpect(jsonPath("$[0].description").exists())
                .andExpect(jsonPath("$[0].filmUrl").value("/video/markets/buildings.webm"))
                .andExpect(jsonPath("$[0].capabilities[0]").value("Structural and façade engineering"))
                .andExpect(jsonPath("$[0].stats[0].value").value("45"))
                .andExpect(jsonPath("$[0].stats[0].unit").value("%"))
                .andExpect(jsonPath("$[0].stats[0].label").exists())
                // Stat.unit is optional: absent, not null.
                .andExpect(jsonPath("$[0].stats[1].unit").doesNotExist())
                // A market has no image and no surrogate id on the wire.
                .andExpect(jsonPath("$[0].image").doesNotExist())
                .andExpect(jsonPath("$[0].id").doesNotExist());
    }

    @Test
    @DisplayName("a missing slug is a 404")
    void testIfMissingSlugIsNotFound() throws Exception {
        when(service.get("nope")).thenThrow(new ResourceNotFoundException("market", "nope"));

        mvc.perform(get("/api/markets/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.path").value("/api/markets/nope"));
    }

    @Test
    @DisplayName("writes are rejected without a credential")
    void testIfUnauthenticatedWriteIsRejected() throws Exception {
        mvc.perform(post("/api/markets").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isUnauthorized());

        verify(service, never()).create(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("an admin can create, update and delete")
    void testIfAdminCanWrite() throws Exception {
        when(service.create(any())).thenReturn(response());

        mvc.perform(post("/api/markets").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/markets/buildings"));

        mvc.perform(put("/api/markets/buildings").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNoContent());

        mvc.perform(delete("/api/markets/buildings"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("a market without its film is a 400 against that field")
    void testIfMissingFilmIsBadRequest() throws Exception {
        mvc.perform(post("/api/markets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY.replace("\"/video/markets/buildings.webm\"", "\"\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.filmUrl").exists());
    }
}
