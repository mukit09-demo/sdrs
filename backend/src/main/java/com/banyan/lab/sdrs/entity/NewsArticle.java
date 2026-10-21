package com.banyan.lab.sdrs.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
        name = "news_article",
        uniqueConstraints = @UniqueConstraint(name = "uk_news_article_slug", columnNames = "slug"))
@Getter
@Setter
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "news_article_id_generator")
    @SequenceGenerator(
            name = "news_article_id_generator", sequenceName = "news_article_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @NotBlank
    @Size(max = 160)
    @Column(name = "slug", length = 160, nullable = false)
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
    private MediaImage image;

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "news_article_body",
            joinColumns = @JoinColumn(name = "article_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "paragraph", nullable = false, columnDefinition = "text")
    private List<String> body = new ArrayList<>();

    /** Market and theme slugs, used to build related-reading lists. */
    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "news_article_tag",
            joinColumns = @JoinColumn(name = "article_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "tag", length = 120, nullable = false)
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
        this.image = incoming.image;

        // Mutated rather than reassigned: Hibernate tracks these collection
        // instances, and swapping them for new ones orphans the originals.
        this.body.clear();
        this.body.addAll(incoming.body);
        this.tags.clear();
        this.tags.addAll(incoming.tags);
    }
}
