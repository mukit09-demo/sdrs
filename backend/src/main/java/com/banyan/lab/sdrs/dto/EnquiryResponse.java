package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;

public record EnquiryResponse(
        String reference,
        String name,
        String email,
        String organisation,
        String topic,
        String message,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant receivedAt) {}
