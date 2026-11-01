package com.banyan.lab.sdrs.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * What the CMS sends to {@code POST /api/projects} and
 * {@code PUT /api/projects/{slug}}. {@code marketSlugs} and {@code serviceSlugs}
 * must each name an existing row; the service refuses one that does not.
 */
public record ProjectRequest(
        @NotBlank
        @Size(max = 160)
        @Pattern(
                regexp = "[a-z0-9]+(?:-[a-z0-9]+)*",
                message = "must be lower-case words separated by single hyphens")
        String slug,

        @NotBlank @Size(max = 300) String title,

        @Valid @NotNull ProjectLocationDto location,

        @NotNull @Positive Integer year,

        @NotBlank @Size(max = 300) String client,

        @NotNull List<@NotBlank String> marketSlugs,

        @NotNull List<@NotBlank String> serviceSlugs,

        @NotBlank @Size(max = 1000) String summary,

        @NotBlank @Size(max = 2000) String description,

        @Size(max = 600) String imageUrl,

        @NotNull List<@Valid @NotNull StatDto> stats,

        @NotNull List<@NotBlank @Size(max = 600) String> highlights) {}
