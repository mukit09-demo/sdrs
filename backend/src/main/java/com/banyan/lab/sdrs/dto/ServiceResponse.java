package com.banyan.lab.sdrs.dto;

import com.banyan.lab.sdrs.entity.ServiceCategory;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

public record ServiceResponse(
        String slug,
        String name,
        ServiceCategory category,
        String tagline,
        String description,
        @JsonInclude(JsonInclude.Include.NON_NULL) String imageUrl,
        List<String> capabilities,
        List<String> relatedMarketSlugs) {}
