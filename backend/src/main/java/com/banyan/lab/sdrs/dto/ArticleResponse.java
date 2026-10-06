package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.banyan.lab.sdrs.entity.NewsType;
import java.time.LocalDate;
import java.util.List;

/**
 * What {@code GET /api/articles} returns, field for field the {@code Article}
 * interface in {@code packages/shared/types/content.ts}.
 *
 * <p>Two details carry the contract:
 *
 * <ul>
 *   <li>{@code category} is a {@link NewsType}, whose {@code @JsonValue} emits
 *       the label — {@code "Press release"}, not {@code "PRESS_RELEASE"}.
 *   <li>{@code publishedAt} is pinned to {@code yyyy-MM-dd} here rather than
 *       left to global Jackson config, because the front end formats it with
 *       {@code formatShortDate} and types it as an ISO date. An accidental
 *       timestamp would not fail — it would just render wrongly.
 * </ul>
 */
public record ArticleResponse(
        String slug,
        String title,
        String excerpt,
        List<String> body,
        NewsType category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") LocalDate publishedAt,
        int readingMinutes,
        AuthorDto author,
        MediaImageDto image,
        List<String> tags) {}
