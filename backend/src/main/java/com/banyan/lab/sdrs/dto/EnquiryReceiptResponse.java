package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;

/**
 * What {@code POST /api/enquiries} returns — the {@code EnquiryResult} interface
 * in {@code packages/shared/content/repository.ts}.
 *
 * <p>Deliberately not the enquiry. A receipt is all the submitter needs: the
 * reference to quote and when it landed. Echoing the message back would put
 * the submitted name, email and body in a response on a public endpoint, which
 * is a reflection any caller could use to confirm what was stored.
 *
 * <p>{@code receivedAt} is {@code Shape.STRING} so it is ISO-8601 with an offset
 * rather than an epoch number — the contact form renders it in the submitter's
 * own zone. See {@link EnquiryResponse}.
 */
public record EnquiryReceiptResponse(
        String reference,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant receivedAt) {}
