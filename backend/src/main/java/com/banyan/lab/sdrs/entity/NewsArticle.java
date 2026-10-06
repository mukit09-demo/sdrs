package com.banyan.lab.sdrs.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * A news article — the {@code Article} of the shared domain model.
 *
 * <p>The slug is the primary key rather than a surrogate id, because it is the
 * route segment ({@code /news/{slug}}) and the identifier every endpoint and
 * the CMS already address articles by. A rename is therefore a delete plus an
 * insert, which is exactly how {@code removeRenamed} in the CMS treats it.
 *
 * <p>{@code body} and {@code tags} are ordered element collections, not a
 * delimited string and not a JSON blob: body paragraphs read in sequence, and
 * losing that order would scramble an article with nothing failing loudly.
 *
 * <p>No {@code @Data} or {@code @EqualsAndHashCode} — generating those over an
 * entity's collections drags lazy associations into every {@code hashCode} call.
 * Identity here is the slug, and JPA already keys on it.
 */
@Entity
@Table(name = "news_article")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {

    @Id
    @NotBlank
    @Size(max = 160)
    @Column(name = "slug", length = 160, nullable = false, updatable = false)
    private String slug;

    @NotBlank
    @Size(max = 300)
    @Column(name = "title", length = 300, nullable = false)
    private String title;

    @NotBlank
    @Size(max = 1000)
    @Column(name = "excerpt", length = 1000, nullable = false)
    private String excerpt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "news_type", length = 40, nullable = false)
    private NewsType newsType;

    @NotNull
    @Column(name = "published_at", nullable = false)
    private LocalDate publishedAt;

    @Positive
    @Column(name = "reading_minutes", nullable = false)
    private int readingMinutes;

    @Valid
    @NotNull
    @Embedded
    private Author author;

    @Valid
    @NotNull
    @Embedded
    private MediaImage image;

    /** Paragraphs of body copy, in order. */
    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "news_article_body",
            joinColumns = @JoinColumn(name = "article_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "paragraph", nullable = false, columnDefinition = "text")
    @Builder.Default
    private List<String> body = new ArrayList<>();

    /** Market and theme slugs, used to build related-reading lists. */
    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "news_article_tag",
            joinColumns = @JoinColumn(name = "article_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "tag", length = 120, nullable = false)
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Replaces the editable fields in place, leaving the slug and the audit
     * timestamps alone. Used by the update path so Hibernate dirty-checks one
     * managed instance rather than being handed a detached copy to merge.
     */
    public void replaceWith(NewsArticle incoming) {
        this.title = incoming.title;
        this.excerpt = incoming.excerpt;
        this.newsType = incoming.newsType;
        this.publishedAt = incoming.publishedAt;
        this.readingMinutes = incoming.readingMinutes;
        this.author = incoming.author;
        this.image = incoming.image;

        // Mutated rather than reassigned: Hibernate tracks these collection
        // instances, and swapping them for new ones orphans the originals.
        this.body.clear();
        this.body.addAll(incoming.body);
        this.tags.clear();
        this.tags.addAll(incoming.tags);
    }
}
