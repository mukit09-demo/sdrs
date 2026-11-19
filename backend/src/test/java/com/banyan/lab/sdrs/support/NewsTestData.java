package com.banyan.lab.sdrs.support;

import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.entity.NewsType;
import com.banyan.lab.sdrs.dto.ArticleRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class NewsTestData {

    public static final String SLUG = "kai-tak-sports-park-opens";
    public static final LocalDate PUBLISHED = LocalDate.of(2026, 8, 28);

    public static final Instant CREATED = Instant.parse("2026-08-26T09:15:30Z");
    public static final Instant UPDATED = Instant.parse("2026-08-28T14:42:05Z");

    public static NewsArticle article() {
        NewsArticle article = new NewsArticle();
        article.setSlug(SLUG);
        article.setTitle("Kai Tak Sports Park opens to the public in Hong Kong");
        article.setExcerpt("The 50,000-seat stadium at the heart of the Kai Tak development has "
                + "hosted its first full-capacity event.");
        article.setNewsType(NewsType.PRESS_RELEASE);
        article.setPublishedAt(PUBLISHED);
        article.setReadingMinutes(4);
        article.setImageUrl(null);
        article.setBody(new ArrayList<>(List.of(
                "Kai Tak Sports Park has opened on the site of Hong Kong's former airport.",
                "Our teams worked across structural engineering and crowd movement.",
                "The district cooling network also supplies the surrounding plots.")));
        article.setTags(new ArrayList<>(List.of("buildings", "cities-and-communities")));
        article.setCreatedAt(CREATED);
        article.setUpdatedAt(UPDATED);
        return article;
    }

    public static ArticleRequest request() {
        return new ArticleRequest(
                SLUG,
                "Kai Tak Sports Park opens to the public in Hong Kong",
                "The 50,000-seat stadium at the heart of the Kai Tak development has "
                        + "hosted its first full-capacity event.",
                List.of(
                        "Kai Tak Sports Park has opened on the site of Hong Kong's former airport.",
                        "Our teams worked across structural engineering and crowd movement.",
                        "The district cooling network also supplies the surrounding plots."),
                NewsType.PRESS_RELEASE,
                PUBLISHED,
                4,
                null,
                List.of("buildings", "cities-and-communities"));
    }

    private NewsTestData() {}
}
