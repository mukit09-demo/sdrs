package com.banyan.lab.sdrs.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
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
 * A sector the practice works in. Fourteen of them drive {@code /markets}.
 *
 * <p>{@code featuredProjectSlugs} is a list of plain strings with no foreign key
 * to {@code project}. That is deliberate: the read path
 * ({@code listProjects({slugs})}) already drops slugs it cannot resolve, and an
 * FK would stop the CMS saving a market that references a project not yet
 * created — forcing an ordering on content entry that the editorial workflow
 * does not have. The cost is that a dangling reference is silently ignored
 * rather than rejected.
 */
@Entity
@Table(name = "market")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Market {

    @Id
    @NotBlank
    @Size(max = 160)
    @Column(name = "slug", length = 160, nullable = false, updatable = false)
    private String slug;

    @NotBlank
    @Size(max = 200)
    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @NotBlank
    @Size(max = 300)
    @Column(name = "tagline", length = 300, nullable = false)
    private String tagline;

    @NotBlank
    @Size(max = 2000)
    @Column(name = "description", length = 2000, nullable = false)
    private String description;

    @Valid
    @NotNull
    @Embedded
    private MediaImage image;

    /** The market's own film. Null and the band is skipped. */
    @Valid
    @Embedded
    private Film film;

    /** What the practice actually does in this market. */
    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "market_capability",
            joinColumns = @JoinColumn(name = "market_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "capability", length = 300, nullable = false)
    @Builder.Default
    private List<String> capabilities = new ArrayList<>();

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "market_stat",
            joinColumns = @JoinColumn(name = "market_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Builder.Default
    private List<Stat> stats = new ArrayList<>();

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "market_featured_project",
            joinColumns = @JoinColumn(name = "market_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "project_slug", length = 160, nullable = false)
    @Builder.Default
    private List<String> featuredProjectSlugs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
