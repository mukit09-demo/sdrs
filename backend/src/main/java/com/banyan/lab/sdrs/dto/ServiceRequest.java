package com.banyan.lab.sdrs.dto;

import com.banyan.lab.sdrs.entity.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * What the CMS sends to {@code POST /api/services} and
 * {@code PUT /api/services/{slug}}. {@code relatedMarketSlugs} must each name an
 * existing market; the service refuses one that does not.
 */
public record ServiceRequest(
        @NotBlank
        @Size(max = 160)
        @Pattern(
                regexp = "[a-z0-9]+(?:-[a-z0-9]+)*",
                message = "must be lower-case words separated by single hyphens")
        String slug,

        @NotBlank @Size(max = 200) String name,

        @NotNull ServiceCategory category,

        @NotBlank @Size(max = 300) String tagline,

        @NotBlank @Size(max = 2000) String description,

        @Size(max = 600) String imageUrl,

        @NotNull List<@NotBlank @Size(max = 300) String> capabilities,

        @NotNull List<@NotBlank String> relatedMarketSlugs) {}
