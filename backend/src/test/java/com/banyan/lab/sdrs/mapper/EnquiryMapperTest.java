package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.dto.EnquiryReceiptResponse;
import com.banyan.lab.sdrs.dto.EnquiryRequest;
import com.banyan.lab.sdrs.dto.EnquiryResponse;
import com.banyan.lab.sdrs.entity.Enquiry;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/** Two shapes out — the full inbox row and the narrow receipt — and one in. */
class EnquiryMapperTest {

    private static final Instant RECEIVED = Instant.parse("2026-10-10T14:32:05Z");

    private final EnquiryMapper mapper = Mappers.getMapper(EnquiryMapper.class);

    private static Enquiry enquiry() {
        Enquiry enquiry = new Enquiry();
        enquiry.setId(11L);
        enquiry.setReference("ENQ-M2X3Y4");
        enquiry.setName("Ada Lovelace");
        enquiry.setEmail("ada@example.com");
        enquiry.setOrganisation("Analytical Engines Ltd");
        enquiry.setTopic("Rail");
        enquiry.setMessage("Do you work on light rail?");
        enquiry.setReceivedAt(RECEIVED);
        return enquiry;
    }

    @Test
    @DisplayName("the inbox row carries everything the operator needs")
    void testIfInboxRowMapsEveryField() {
        EnquiryResponse response = mapper.toResponse(enquiry());

        assertThat(response).isEqualTo(new EnquiryResponse(
                "ENQ-M2X3Y4", "Ada Lovelace", "ada@example.com", "Analytical Engines Ltd", "Rail",
                "Do you work on light rail?", RECEIVED));
    }

    @Test
    @DisplayName("the receipt carries only the reference and the instant")
    void testIfReceiptCarriesOnlyReferenceAndInstant() {
        EnquiryReceiptResponse receipt = mapper.toReceipt(enquiry());

        assertThat(receipt).isEqualTo(new EnquiryReceiptResponse("ENQ-M2X3Y4", RECEIVED));
        // A record component list is the shape on the wire: nothing personal in it.
        assertThat(EnquiryReceiptResponse.class.getRecordComponents())
                .extracting(component -> component.getName())
                .containsExactly("reference", "receivedAt");
    }

    @Test
    @DisplayName("a submitter can set neither the id, the reference nor the received instant")
    void testIfToEntityIgnoresIdReferenceAndReceivedAt() {
        Enquiry enquiry = mapper.toEntity(new EnquiryRequest(
                "Ada Lovelace", "ada@example.com", null, "Rail", "Hello"));

        assertThat(enquiry.getId()).isNull();
        assertThat(enquiry.getReference()).isNull();
        assertThat(enquiry.getReceivedAt()).isNull();
        assertThat(enquiry.getName()).isEqualTo("Ada Lovelace");
        assertThat(enquiry.getOrganisation()).isNull();
        assertThat(enquiry.getMessage()).isEqualTo("Hello");
    }

    @Test
    @DisplayName("lists keep their order, and null maps to null")
    void testIfListsKeepOrderAndNullMapsToNull() {
        Enquiry second = enquiry();
        second.setReference("ENQ-AAAAAA");

        assertThat(mapper.toResponses(List.of(enquiry(), second)))
                .extracting(EnquiryResponse::reference)
                .containsExactly("ENQ-M2X3Y4", "ENQ-AAAAAA");
        assertThat(mapper.toResponse(null)).isNull();
        assertThat(mapper.toReceipt(null)).isNull();
        assertThat(mapper.toEntity(null)).isNull();
    }
}
