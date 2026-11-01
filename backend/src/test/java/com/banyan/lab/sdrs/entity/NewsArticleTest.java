package com.banyan.lab.sdrs.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.support.NewsTestData;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** {@code replaceWith}: every editable field copied, identity and collection instances kept. */
class NewsArticleTest {

    private static NewsArticle incoming() {
        NewsArticle incoming = new NewsArticle();
        incoming.setSlug("ignored-slug");
        incoming.setTitle("A new title");
        incoming.setExcerpt("A new excerpt");
        incoming.setNewsType(NewsType.AWARD);
        incoming.setPublishedAt(LocalDate.of(2026, 10, 1));
        incoming.setReadingMinutes(7);
        incoming.setImageUrl("https://example.com/new.jpg");
        incoming.setBody(new ArrayList<>(List.of("One new paragraph.")));
        incoming.setTags(new ArrayList<>(List.of("awards")));
        return incoming;
    }

    @Test
    @DisplayName("copies every editable field")
    void testIfReplaceWithCopiesEveryEditableField() {
        NewsArticle existing = NewsTestData.article();

        existing.replaceWith(incoming());

        assertThat(existing.getTitle()).isEqualTo("A new title");
        assertThat(existing.getExcerpt()).isEqualTo("A new excerpt");
        assertThat(existing.getNewsType()).isEqualTo(NewsType.AWARD);
        assertThat(existing.getPublishedAt()).isEqualTo(LocalDate.of(2026, 10, 1));
        assertThat(existing.getReadingMinutes()).isEqualTo(7);
        assertThat(existing.getImageUrl()).isEqualTo("https://example.com/new.jpg");
        assertThat(existing.getBody()).containsExactly("One new paragraph.");
        assertThat(existing.getTags()).containsExactly("awards");
    }

    @Test
    @DisplayName("keeps the slug, id and audit pair")
    void testIfReplaceWithKeepsSlugIdAndAuditFields() {
        NewsArticle existing = NewsTestData.article();
        existing.setId(4L);

        existing.replaceWith(incoming());

        assertThat(existing.getId()).isEqualTo(4L);
        assertThat(existing.getSlug()).isEqualTo(NewsTestData.SLUG);
        assertThat(existing.getCreatedAt()).isEqualTo(NewsTestData.CREATED);
        assertThat(existing.getUpdatedAt()).isEqualTo(NewsTestData.UPDATED);
    }

    @Test
    @DisplayName("mutates the tracked collections rather than swapping or sharing them")
    void testIfReplaceWithKeepsTheTrackedCollections() {
        NewsArticle existing = NewsTestData.article();
        List<String> body = existing.getBody();
        List<String> tags = existing.getTags();
        NewsArticle incoming = incoming();

        existing.replaceWith(incoming);

        assertThat(existing.getBody()).isSameAs(body).isNotSameAs(incoming.getBody());
        assertThat(existing.getTags()).isSameAs(tags).isNotSameAs(incoming.getTags());
    }

    @Test
    @DisplayName("an incoming null image clears the old one")
    void testIfReplaceWithNullImageClearsTheOldOne() {
        NewsArticle existing = NewsTestData.article();
        existing.setImageUrl("https://example.com/old.jpg");
        NewsArticle incoming = incoming();
        incoming.setImageUrl(null);

        existing.replaceWith(incoming);

        assertThat(existing.getImageUrl()).isNull();
    }

    @Test
    @DisplayName("an incoming empty tag list empties the tags")
    void testIfReplaceWithEmptyTagsClearsTheTags() {
        NewsArticle existing = NewsTestData.article();
        NewsArticle incoming = incoming();
        incoming.setTags(new ArrayList<>());

        existing.replaceWith(incoming);

        assertThat(existing.getTags()).isEmpty();
    }
}
