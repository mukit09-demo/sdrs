package com.banyan.lab.sdrs.dto;

import java.util.List;

/** Field for field the {@code Market} interface in {@code packages/shared/types/content.ts}. */
public record MarketResponse(
        String slug,
        String name,
        String tagline,
        String description,
        String filmUrl,
        List<String> capabilities,
        List<StatDto> stats) {}
