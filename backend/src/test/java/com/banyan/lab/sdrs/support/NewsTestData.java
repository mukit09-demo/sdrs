package com.banyan.lab.sdrs.support;

import com.banyan.lab.sdrs.entity.Author;
import com.banyan.lab.sdrs.entity.MediaImage;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.entity.NewsType;
import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.AuthorDto;
import com.banyan.lab.sdrs.dto.MediaImageDto;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * One article, shared by the three test classes — the real Kai Tak release from
 * {@code packages/shared/data/news.ts}, so the assertions are checked against
 * content the site actually renders rather than against "foo".
 *
 * <p>Public because the tests now live in one package per layer
 * ({@code controller}, {@code service}, {@code mapper}) and this fixture is
 * shared across all three.
 */
public final class NewsTestData {

    public static final String SLUG = "kai-tak-sports-park-opens";
    public static final LocalDate PUBLISHED = LocalDate.of(2026, 8, 28);

    public static NewsArticle article() {
        return NewsArticle.builder()
                .slug(SLUG)
                .title("Kai Tak Sports Park opens to the public in Hong Kong")
                .excerpt("The 50,000-seat stadium at the heart of the Kai Tak development has "
                        + "hosted its first full-capacity event.")
                .newsType(NewsType.PRESS_RELEASE)
                .publishedAt(PUBLISHED)
                .readingMinutes(4)
                .author(Author.builder()
                        .name("Priya Raghunathan")
                        .role("Regional Communications Lead, East Asia")
                        .build())
                // No url — the gradient-placeholder case, which is the default
                // for every piece of bundled content.
                .image(MediaImage.builder()
                        .alt("A stadium with a retractable roof at dusk")
                        .seed("news-kai-tak-park")
                        .build())
                .body(new ArrayList<>(List.of(
                        "Kai Tak Sports Park has opened on the site of Hong Kong's former airport.",
                        "Our teams worked across structural engineering and crowd movement.",
                        "The district cooling network also supplies the surrounding plots.")))
                .tags(new ArrayList<>(List.of("buildings", "cities-and-communities")))
                .build();
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
                new AuthorDto("Priya Raghunathan", "Regional Communications Lead, East Asia"),
                new MediaImageDto(null, "A stadium with a retractable roof at dusk", "news-kai-tak-park"),
                List.of("buildings", "cities-and-communities"));
    }

    private NewsTestData() {}
}
