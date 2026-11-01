package com.banyan.lab.sdrs.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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

@Entity
@Table(
        name = "service",
        uniqueConstraints = @UniqueConstraint(name = "uk_service_slug", columnNames = "slug"))
@Getter
@Setter
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_id_generator")
    @SequenceGenerator(
            name = "service_id_generator", sequenceName = "service_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

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

    @Size(max = 600)
    @Column(name = "image_url", length = 600)
    private String imageUrl;

    /** The specialisms inside the service. */
    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "service_capability",
            joinColumns = @JoinColumn(name = "service_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "capability", length = 300, nullable = false)
    private List<String> capabilities = new ArrayList<>();

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "service_market",
            joinColumns = @JoinColumn(name = "service_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "market_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    private List<Market> relatedMarkets = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
