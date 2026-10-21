package com.banyan.lab.sdrs.support;

import com.banyan.lab.sdrs.entity.MediaImage;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.entity.NewsType;
import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.MediaImageDto;
import java.time.Instant;
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

    /**
     * Hibernate assigns these in production; a unit test has no session, so the
     * fixture sets them. They are set at all because the audit pair is the only
     * part of the payload the CMS renders in the operator's own zone, and that
     * conversion is correct only while they stay ISO-8601 with an offset — which
     * is what {@code NewsControllerTest} asserts. Left null they would serialise
     * as nothing and the assertion would pass vacuously.
     *
     * <p>Deliberately a non-midnight, non-UTC-looking instant: a value like
     * {@code T00:00:00Z} survives being mangled into a bare date.
     */
    public static final Instant CREATED = Instant.parse("2026-08-26T09:15:30Z");
    public static final Instant UPDATED = Instant.parse("2026-08-28T14:42:05Z");

    public static NewsArticle article() {
        // No url — the gradient-placeholder case, which is the default for
        // every piece of bundled content.
        MediaImage image = new MediaImage();
        image.setAlt("A stadium with a retractable roof at dusk");
        image.setSeed("news-kai-tak-park");

        NewsArticle article = new NewsArticle();
        article.setSlug(SLUG);
        article.setTitle("Kai Tak Sports Park opens to the public in Hong Kong");
        article.setExcerpt("The 50,000-seat stadium at the heart of the Kai Tak development has "
                + "hosted its first full-capacity event.");
        article.setNewsType(NewsType.PRESS_RELEASE);
        article.setPublishedAt(PUBLISHED);
        article.setReadingMinutes(4);
        article.setImage(image);
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
                new MediaImageDto(null, "A stadium with a retractable roof at dusk", "news-kai-tak-park"),
                List.of("buildings", "cities-and-communities"));
    }

    private NewsTestData() {}
}
