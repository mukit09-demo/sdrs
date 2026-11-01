package com.banyan.lab.sdrs.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banyan.lab.sdrs.config.SecurityConfig;
import com.banyan.lab.sdrs.dto.JobResponse;
import com.banyan.lab.sdrs.mapper.JobMapper;
import com.banyan.lab.sdrs.service.JobService;
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

/**
 * The {@code JobOpening} contract, and the path split that keeps drafts private:
 * nothing in the controller would fail if the every-status read moved off
 * {@code /api/admin/}, so this test is what holds it there.
 */
@WebMvcTest(JobController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "sdrs.admin.username=admin",
    "sdrs.admin.password=not-the-real-one"
})
class JobControllerTest {

    private static final String VALID_BODY = """
            {
              "title": "Senior Structural Engineer — Tall Buildings",
              "discipline": "Structural engineering",
              "location": "London, United Kingdom",
              "employmentType": "Full time",
              "level": "Senior",
              "status": "Open",
              "postedAt": "2026-09-12"
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private JobService service;

    private static JobResponse response() {
        return Mappers.getMapper(JobMapper.class).toResponse(CollectionTestData.job());
    }

    @Test
    @DisplayName("GET /api/jobs is public and serves the JobOpening shape")
    void testIfOpeningsMatchTheSharedContract() throws Exception {
        when(service.openings()).thenReturn(List.of(response()));

        mvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].discipline").value("Structural engineering"))
                .andExpect(jsonPath("$[0].location").value("London, United Kingdom"))
                // Labels, not constants.
                .andExpect(jsonPath("$[0].employmentType").value("Full time"))
                .andExpect(jsonPath("$[0].level").value("Senior"))
                .andExpect(jsonPath("$[0].status").value("Open"))
                .andExpect(jsonPath("$[0].postedAt").value("2026-09-12"))
                // Open until filled: absent, because isOpening tests for undefined.
                .andExpect(jsonPath("$[0].deadline").doesNotExist());

        verify(service, never()).list();
    }

    @Test
    @DisplayName("the every-status read needs the admin")
    void testIfAdminReadIsNotPublic() throws Exception {
        mvc.perform(get("/api/admin/jobs")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/jobs/1")).andExpect(status().isUnauthorized());

        verify(service, never()).list();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("an admin reads every job, and a non-numeric id is a 400")
    void testIfAdminCanReadEveryJob() throws Exception {
        when(service.list()).thenReturn(List.of(response()));

        mvc.perform(get("/api/admin/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));

        mvc.perform(get("/api/admin/jobs/abc")).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("create returns 201 with the assigned id; update returns 204")
    void testIfAdminCanCreateAndUpdate() throws Exception {
        when(service.create(any())).thenReturn(response());

        mvc.perform(post("/api/jobs").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/admin/jobs/1"))
                .andExpect(jsonPath("$.id").value(1));

        mvc.perform(put("/api/jobs/1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNoContent());

        verify(service).update(eq(1L), any());
    }

    @Test
    @DisplayName("writes are rejected without a credential")
    void testIfUnauthenticatedWriteIsRejected() throws Exception {
        mvc.perform(post("/api/jobs").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isUnauthorized());

        verify(service, never()).create(any());
    }
}
