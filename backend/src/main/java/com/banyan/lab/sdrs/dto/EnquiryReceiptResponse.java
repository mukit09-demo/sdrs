package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;

public record EnquiryReceiptResponse(
        String reference,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant receivedAt) {}
