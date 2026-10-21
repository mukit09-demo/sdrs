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
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * A discipline the practice offers. Drives {@code /services}.
 *
 * <p>Table name is {@code service} — quoted by Hibernate where it has to be,
 * but not a reserved word in Postgres.
 *
 * <p>{@code relatedMarketSlugs} carries no foreign key, for the same reason
 * {@link Market#getFeaturedProjectSlugs()} does not.
 *
 * <p>{@code SEQUENCE} rather than {@code IDENTITY}, because this application
 * configures {@code hibernate.jdbc.batch_size} and {@code order_inserts} and
 * {@code IDENTITY} quietly disables insert batching — Hibernate has to
 * round-trip for every generated key.
 *
 * <p>{@code allocationSize = 1}, matching {@code increment by 1} in the
 * changelog, and the two must always agree: Hibernate never asks the database
 * what the real increment is, so a mismatch has it handing out ids already
 * issued — and not on the first insert, but later, once a reserved band runs
 * out. One is not the Hibernate default (50 is). It is right here because these
 * tables hold tens of rows written when an editor clicks save, so reserving
 * ids in blocks saves a round-trip nobody can measure, while costing
 * non-contiguous ids and that late-failing footgun.
 *
 * <p>The collections are {@code LAZY} with {@code @BatchSize}. Lazy because the
 * mapping should not decide for every caller — a query that does not need a
 * collection should not pay for it — and batched because the mappers do touch
 * them, so unbatched lazy loading would be N+1. Both only hold while mapping
 * happens inside the service's transaction; {@code open-in-view} is false, so
 * a collection touched after it closes throws.
 */
@Entity
@Table(
        name = "service",
        uniqueConstraints = @UniqueConstraint(name = "uk_service_slug", columnNames = "slug"))
@Getter
@Setter
public class Service {

    /**
     * Surrogate key. Not the slug: slugs get renamed — this project already
     * carries 25 permanent redirects from renamed markets and services — and a
     * primary key that changes means a rename is a delete plus an insert, which
     * destroys the row's identity, resets its timestamps and cascades its
     * children away. With a sequence, a rename is one column update.
     *
     * <p>Never serialised. The API addresses services by slug,
     * exactly as before; this is internal.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_id_generator")
    @SequenceGenerator(
            name = "service_id_generator", sequenceName = "service_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * URL segment, and the identifier every endpoint and the CMS address this
     * by. Unique, but no longer the primary key — and deliberately updatable,
     * because that is the whole point of the change.
     */
    @NotBlank
    @Size(max = 160)
    @Column(name = "slug", length = 160, nullable = false)
    private String slug;

    @NotBlank
    @Size(max = 200)
    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 60, nullable = false)
    private ServiceCategory category;

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

    /** The specialisms inside the service. */
    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "service_capability",
            joinColumns = @JoinColumn(name = "service_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "capability", length = 300, nullable = false)
    private List<String> capabilities = new ArrayList<>();

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "service_related_market",
            joinColumns = @JoinColumn(name = "service_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "market_slug", length = 160, nullable = false)
    private List<String> relatedMarketSlugs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
