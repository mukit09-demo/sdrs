package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** Field for field the {@code Project} interface in {@code packages/shared/types/content.ts}. */
public record ProjectResponse(
        String slug,
        String title,
        ProjectLocationDto location,
        int year,
        String client,
        List<String> marketSlugs,
        List<String> serviceSlugs,
        String summary,
        String description,
        @JsonInclude(JsonInclude.Include.NON_NULL) String imageUrl,
        List<StatDto> stats,
        List<String> highlights) {}
