package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * A job. The table holds every one of them — drafts and withdrawn roles
 * included — which is why it is {@code job} and not {@code job_opening}: an
 * "opening" is the subset that happens to be advertised right now, and that is
 * a query, not a table.
 *
 * <p>That subset is {@link #isPubliclyVisible()}: {@link JobStatus#OPEN} and the
 * deadline not yet passed. The candidate-facing list applies it; the CMS listing
 * does not, because an editor has to be able to see a draft in order to publish
 * it.
 *
 * <p>This is the one part of the careers page the CMS manages, which is why it
 * is stored at all — the prose around it lives in
 * {@code packages/shared/data/careers.ts} and never reaches this database.
 *
 * <p>The id is a free-text reference the CMS may generate, not a sequence.
 */
@Entity
@Table(name = "job")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @NotBlank
    @Size(max = 60)
    @Column(name = "id", length = 60, nullable = false, updatable = false)
    private String id;

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

    /**
     * Last day applications are accepted, inclusive.
     *
     * <p>Null means no closing date — advertised until somebody takes it down.
     * That is a real case ("open until filled"), not missing data, which is why
     * the column is nullable rather than defaulted to something far away.
     */
    @Column(name = "deadline")
    private LocalDate deadline;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Whether a candidate should see this job today.
     *
     * <p>The single definition of "an opening". The repository query has to
     * express the same predicate in SQL to filter in the database rather than in
     * Java — if you change one, change both, and the controller test is where
     * that gets caught.
     */
    public boolean isPubliclyVisible() {
        return isPubliclyVisibleOn(LocalDate.now());
    }

    /** Takes the date so the rule is testable without mocking the clock. */
    public boolean isPubliclyVisibleOn(LocalDate today) {
        return status == JobStatus.OPEN
                && (deadline == null || !deadline.isBefore(today));
    }
}
