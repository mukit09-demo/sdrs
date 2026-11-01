package com.banyan.lab.sdrs.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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

@Entity
@Table(
        name = "project",
        uniqueConstraints = @UniqueConstraint(name = "uk_project_slug", columnNames = "slug"))
@Getter
@Setter
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "project_id_generator")
    @SequenceGenerator(
            name = "project_id_generator", sequenceName = "project_id_seq", allocationSize = 1)
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

    @Size(max = 600)
    @Column(name = "image_url", length = 600)
    private String imageUrl;

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_stat",
            joinColumns = @JoinColumn(name = "project_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    private List<Stat> stats = new ArrayList<>();

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_highlight",
            joinColumns = @JoinColumn(name = "project_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    @Column(name = "highlight", length = 600, nullable = false)
    private List<String> highlights = new ArrayList<>();

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "project_market",
            joinColumns = @JoinColumn(name = "project_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "market_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    private List<Market> markets = new ArrayList<>();

    @BatchSize(size = 50) // batches the lazy load; without it this is N+1
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "project_service",
            joinColumns = @JoinColumn(name = "project_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "service_id", nullable = false))
    @OrderColumn(name = "position", nullable = false)
    private List<Service> services = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
