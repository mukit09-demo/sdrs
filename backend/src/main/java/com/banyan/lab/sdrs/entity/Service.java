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
 * A discipline the practice offers. Drives {@code /services}.
 *
 * <p>Table name is {@code service} — quoted by Hibernate where it has to be,
 * but not a reserved word in Postgres.
 *
 * <p>{@code relatedMarketSlugs} carries no foreign key, for the same reason
 * {@link Market#getFeaturedProjectSlugs()} does not.
 */
@Entity
@Table(name = "service")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @NotBlank
    @Size(max = 160)
    @Column(name = "slug", length = 160, nullable = false, updatable = false)
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
    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_capability",
            joinColumns = @JoinColumn(name = "service_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "capability", length = 300, nullable = false)
    @Builder.Default
    private List<String> capabilities = new ArrayList<>();

    @BatchSize(size = 50)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_related_market",
            joinColumns = @JoinColumn(name = "service_slug", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "market_slug", length = 160, nullable = false)
    @Builder.Default
    private List<String> relatedMarketSlugs = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
