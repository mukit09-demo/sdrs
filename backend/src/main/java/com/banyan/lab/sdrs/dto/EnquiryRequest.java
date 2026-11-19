package com.banyan.lab.sdrs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * What {@code POST /api/enquiries} accepts, field for field the
 * {@code EnquiryInput} interface in {@code packages/shared/content/repository.ts}.
 *
 * <p>The only request body an unauthenticated caller can send, so the
 * constraints here are the whole input guard — they mirror
 * {@code entity/Enquiry} rather than trusting it, because a violation should be
 * a 400 from the controller and not a constraint violation at flush.
 *
 * <p>No {@code reference} and no {@code receivedAt}: the service mints the one
 * and Hibernate sets the other. A caller supplying either would be choosing its
 * own primary business key.
 *
 * <p>{@code message} is capped at 2000, the same as {@code enquiryRules} in
 * {@code core-web/src/lib/content/enquiry.ts}. The column is unbounded
 * {@code text}, so without this an unauthenticated caller could store a message
 * of any size.
 */
public record EnquiryRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Email @Size(max = 200) String email,
        @Size(max = 200) String organisation,
        @NotBlank @Size(max = 120) String topic,
        @NotBlank @Size(max = 2000) String message) {}
