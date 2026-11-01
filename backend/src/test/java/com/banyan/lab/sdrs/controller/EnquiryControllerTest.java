package com.banyan.lab.sdrs.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banyan.lab.sdrs.config.SecurityConfig;
import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.service.EnquiryService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * The enquiry HTTP contract, and the access rule that protects it.
 *
 * <p>The read is the only endpoint in this backend that serves personal data —
 * names, email addresses and message bodies — and it is authorised purely by
 * sitting under {@code /api/admin/}, because {@code SecurityConfig} permits
 * every {@code GET /api/**} before any enquiry-specific rule is reached. There
 * is nothing in {@link EnquiryController} that would fail if the path moved, so
 * {@code anonymousInboxReadIsRejected} is the test holding it there.
 */
@WebMvcTest(EnquiryController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "sdrs.admin.username=admin",
    "sdrs.admin.password=not-the-real-one"
})
class EnquiryControllerTest {

    private static final Instant RECEIVED = Instant.parse("2026-10-09T16:04:21Z");

    private static final String VALID_BODY = """
            {
              "name": "Priya Raman",
              "email": "priya.raman@example.org",
              "organisation": "Port of Tanjung",
              "topic": "Coastal resilience",
              "message": "We are scoping a breakwater refurbishment and would like to talk."
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private EnquiryService service;

    private static EnquiryResponse response() {
        return new EnquiryResponse(
                "ENQ-M7X2Y4",
                "Priya Raman",
                "priya.raman@example.org",
                "Port of Tanjung",
                "Coastal resilience",
                "We are scoping a breakwater refurbishment and would like to talk.",
                RECEIVED);
    }

    @Test
    @DisplayName("an anonymous read of the inbox is rejected, not served")
    void testIfAnonymousInboxReadIsRejected() throws Exception {
        mvc.perform(get("/api/admin/enquiries"))
                .andExpect(status().isUnauthorized());

        // Not merely "did not return 200": the service must never have been
        // asked, so no enquiry was loaded out of the database to be discarded
        // by a later filter.
        verify(service, never()).list();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/enquiries serves the inbox shape, newest-first order intact")
    void testIfInboxMatchesTheSharedContract() throws Exception {
        when(service.list()).thenReturn(List.of(response()));

        mvc.perform(get("/api/admin/enquiries"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].reference").value("ENQ-M7X2Y4"))
                .andExpect(jsonPath("$[0].name").value("Priya Raman"))
                .andExpect(jsonPath("$[0].email").value("priya.raman@example.org"))
                .andExpect(jsonPath("$[0].organisation").value("Port of Tanjung"))
                .andExpect(jsonPath("$[0].topic").value("Coastal resilience"))
                .andExpect(jsonPath("$[0].message").value(
                        "We are scoping a breakwater refurbishment and would like to talk."))
                // An instant with an offset, not an epoch number and not a
                // zoneless local string. The CMS converts this to the
                // operator's own zone, so either drift renders hours out
                // instead of failing.
                .andExpect(jsonPath("$[0].receivedAt").value("2026-10-09T16:04:21Z"));
    }

    @Test
    @DisplayName("POST /api/enquiries is public and returns only the receipt")
    void testIfSubmitIsPublicAndReturnsOnlyTheReceipt() throws Exception {
        when(service.submit(any())).thenReturn(new EnquiryReceiptResponse("ENQ-M7X2Y4", RECEIVED));

        mvc.perform(post("/api/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference").value("ENQ-M7X2Y4"))
                .andExpect(jsonPath("$.receivedAt").value("2026-10-09T16:04:21Z"))
                // The receipt is not the enquiry. A public endpoint that echoed
                // the submission back would reflect whatever was posted to it.
                .andExpect(jsonPath("$.message").doesNotExist())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.name").doesNotExist());
    }

    @Test
    @DisplayName("a submission missing a required field is a 400, not a constraint violation at flush")
    void testIfInvalidSubmissionIsRejected() throws Exception {
        mvc.perform(post("/api/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Priya Raman",
                                  "email": "not-an-email",
                                  "topic": "Coastal resilience",
                                  "message": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.message").exists());

        verify(service, never()).submit(any());
    }
}
