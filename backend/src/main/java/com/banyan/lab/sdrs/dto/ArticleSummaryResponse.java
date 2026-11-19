package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.banyan.lab.sdrs.entity.NewsType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ArticleSummaryResponse(
        String slug,
        String title,
        String excerpt,
        NewsType category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") LocalDate publishedAt,
        int readingMinutes,
        @JsonInclude(JsonInclude.Include.NON_NULL) String imageUrl,
        List<String> tags,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant updatedAt) {}
