package com.banyan.lab.sdrs.dto;

import java.util.List;

public record MarketResponse(
        String slug,
        String name,
        String tagline,
        String description,
        String filmUrl,
        List<String> capabilities,
        List<StatDto> stats) {}
