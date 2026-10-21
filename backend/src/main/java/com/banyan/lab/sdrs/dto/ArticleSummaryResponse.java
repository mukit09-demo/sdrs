package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.banyan.lab.sdrs.entity.NewsType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * What {@code GET /api/articles} returns: {@link ArticleResponse} without
 * {@code body}, field for field the {@code ArticleSummary} type in
 * {@code packages/shared/types/content.ts}.
 *
 * <p>A list renders cards, and a card shows the excerpt, never the body. Leaving
 * the field off this type — rather than sending it null on the shared one — is
 * what stops the mapper calling {@code getBody()}, so the lazy collection is
 * never loaded and {@code news_article_body} is not queried for a list at all.
 * It also keeps the TypeScript side honest: {@code Article.body} stays
 * non-optional, because the one endpoint that returns an {@code Article} always
 * fills it.
 *
 * <p>{@code tags} stays. Cards carry them for filtering, and
 * {@code articleToCard} spreads them, so a missing array would throw.
 *
 * <p>The formats are pinned for the same reasons given on
 * {@link ArticleResponse}; keep the two in step.
 */
public record ArticleSummaryResponse(
        String slug,
        String title,
        String excerpt,
        NewsType category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") LocalDate publishedAt,
        int readingMinutes,
        MediaImageDto image,
        List<String> tags,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING) Instant updatedAt) {}
