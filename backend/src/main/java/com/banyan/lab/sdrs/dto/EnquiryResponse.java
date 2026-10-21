package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;

/**
 * One enquiry as the CMS inbox reads it — {@code GET /api/admin/enquiries}.
 *
 * <p>Under {@code /api/admin/} and not {@code /api/enquiries}, because
 * {@code config/SecurityConfig} makes every {@code GET /api/**} public and that
 * rule is matched before the enquiry one. At the unprefixed path this payload —
 * names, email addresses and message bodies — would be readable by anyone.
 * The prefix is what authorises it, so moving this endpoint is a disclosure bug,
 * not a reorganisation.
 *
 * <p>{@code receivedAt} is an instant, pinned to {@code Shape.STRING} so it
 * serialises as ISO-8601 with an offset ({@code 2026-10-10T14:32:05Z}) whatever
 * the global {@code write-dates-as-timestamps} is set to. That is the whole
 * input the inbox needs to render it in the operator's own zone: an epoch number
 * or a zoneless local string would still parse and would still render, just an
 * unpredictable number of hours out.
 */
public record EnquiryResponse(
        String reference,
        String name,
        String email,
        String organisation,
        String topic,
        String message,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant receivedAt) {}
