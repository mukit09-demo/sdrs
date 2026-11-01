package com.banyan.lab.sdrs.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/** What the CMS sends to {@code POST /api/markets} and {@code PUT /api/markets/{slug}}. */
public record MarketRequest(
        @NotBlank
        @Size(max = 160)
        @Pattern(
                regexp = "[a-z0-9]+(?:-[a-z0-9]+)*",
                message = "must be lower-case words separated by single hyphens")
        String slug,

        @NotBlank @Size(max = 200) String name,

        @NotBlank @Size(max = 300) String tagline,

        @NotBlank @Size(max = 2000) String description,

        @NotBlank @Size(max = 600) String filmUrl,

        @NotNull List<@NotBlank @Size(max = 300) String> capabilities,

        @NotNull List<@Valid @NotNull StatDto> stats) {}
