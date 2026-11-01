package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.banyan.lab.sdrs.entity.NewsType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * What {@code GET /api/articles/{slug}} returns, field for field the
 * {@code Article} interface in {@code packages/shared/types/content.ts}. The list
 * endpoint returns {@link ArticleSummaryResponse}, which is this without
 * {@code body}.
 *
 * <p>Three details carry the contract:
 *
 * <ul>
 *   <li>{@code category} is a {@link NewsType}, whose {@code @JsonValue} emits
 *       the label — {@code "Press release"}, not {@code "PRESS_RELEASE"}.
 *   <li>{@code publishedAt} is pinned to {@code yyyy-MM-dd} here rather than
 *       left to global Jackson config, because the front end formats it with
 *       {@code formatShortDate} and types it as an ISO date. An accidental
 *       timestamp would not fail — it would just render wrongly.
 *   <li>{@code createdAt} and {@code updatedAt} are the opposite kind of value
 *       and are pinned for the same reason: instants, not dates. They are
 *       {@code Shape.STRING} so they serialise as ISO-8601 with an offset
 *       ({@code 2026-10-10T14:32:05Z}) whatever the global
 *       {@code write-dates-as-timestamps} happens to be — the CMS renders them
 *       in the operator's own zone, and an epoch number or a zoneless string
 *       would make that conversion wrong rather than fail.
 * </ul>
 *
 * <p>{@code imageUrl} is {@code NON_NULL}: an article with no image yet omits
 * the key rather than sending {@code null}, matching the optional field in the
 * TypeScript interface, so the front end's gradient placeholder kicks in on a
 * plain absence.
 *
 * <p>The audit pair rides on this one read DTO rather than an admin-only copy of
 * it. {@code core-web} receives and ignores them; the alternative is a second
 * near-identical response type and a second mapper method to keep in step.
 */
public record ArticleResponse(
        String slug,
        String title,
        String excerpt,
        List<String> body,
        NewsType category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") LocalDate publishedAt,
        int readingMinutes,
        @JsonInclude(JsonInclude.Include.NON_NULL) String imageUrl,
        List<String> tags,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant updatedAt) {}
