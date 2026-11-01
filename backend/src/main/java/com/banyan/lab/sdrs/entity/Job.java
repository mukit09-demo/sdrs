package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "job")
@Getter
@Setter
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "job_id_generator")
    @SequenceGenerator(name = "job_id_generator", sequenceName = "job_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @NotBlank
    @Size(max = 300)
    @Column(name = "title", length = 300, nullable = false)
    private String title;

    @NotBlank
    @Size(max = 160)
    @Column(name = "discipline", length = 160, nullable = false)
    private String discipline;

    /** City and country, e.g. "Manchester, United Kingdom". */
    @NotBlank
    @Size(max = 160)
    @Column(name = "location", length = 160, nullable = false)
    private String location;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 40, nullable = false)
    private EmploymentType employmentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 40, nullable = false)
    private CareerLevel level;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private JobStatus status;

    @NotNull
    @Column(name = "posted_at", nullable = false)
    private LocalDate postedAt;

    @Column(name = "deadline")
    private LocalDate deadline;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public boolean isPubliclyVisible() {
        return isPubliclyVisibleOn(LocalDate.now());
    }

    public boolean isPubliclyVisibleOn(LocalDate today) {
        return status == JobStatus.OPEN
                && (deadline == null || !deadline.isBefore(today));
    }
}
