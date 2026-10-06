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
 * A delivered piece of work. Twenty of them drive {@code /projects}.
 *
 * <p>{@code marketSlugs} and {@code serviceSlugs} are what the market and
 * service filters match on, so they are indexed. Like the other cross-collection
 * references in this model they carry no foreign key — see {@link Market}.
 */
@Entity
@Table(name = "project")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @NotBlank
    @Size(max = 160)
    @Column(name = "slug", length = 160, nullable = false, updatable = false)
    private String slug;

    @NotBlank
    @Size(max = 300)
    @Column(name = "title", length = 300, nullable = false)
    private String title;

    @Valid
    @NotNull
    @Embedded
    private ProjectLocation location;

    /** Completion or delivery year. */
    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotBlank
    @Size(max = 300)
    @Column(name = "client", length = 300, nullable = false)
    private String client;

    @NotBlank
    @Size(max = 1000)
    @Column(name = "summary", length = 1000, nullable = false)
    private String summary;

    @NotBlank
    @Size(max = 2000)
    @Column(name = "description", length = 2000, nullable = false)
    private String description;

    @Valid
    @NotNull
    @Embedded
    private MediaImage image;

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_stat",
            joinColumns = @JoinColumn(name = "project_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Builder.Default
    private List<Stat> stats = new ArrayList<>();

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_highlight",
            joinColumns = @JoinColumn(name = "project_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "highlight", length = 600, nullable = false)
    @Builder.Default
    private List<String> highlights = new ArrayList<>();

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_market",
            joinColumns = @JoinColumn(name = "project_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "market_slug", length = 160, nullable = false)
    @Builder.Default
    private List<String> marketSlugs = new ArrayList<>();

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_service",
            joinColumns = @JoinColumn(name = "project_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "service_slug", length = 160, nullable = false)
    @Builder.Default
    private List<String> serviceSlugs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
