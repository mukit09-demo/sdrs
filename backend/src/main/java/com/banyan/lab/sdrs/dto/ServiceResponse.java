package com.banyan.lab.sdrs.dto;

import com.banyan.lab.sdrs.entity.ServiceCategory;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * The {@code Service} interface in {@code packages/shared/types/content.ts}.
 *
 * <p>{@code imageUrl} is {@code NON_NULL} for the reason given on
 * {@link ArticleResponse}: absent means "render the gradient placeholder".
 */
public record ServiceResponse(
        String slug,
        String name,
        ServiceCategory category,
        String tagline,
        String description,
        @JsonInclude(JsonInclude.Include.NON_NULL) String imageUrl,
        List<String> capabilities,
        List<String> relatedMarketSlugs) {}
