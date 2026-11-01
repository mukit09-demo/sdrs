package com.banyan.lab.sdrs.repository;

import com.banyan.lab.sdrs.entity.Job;
import com.banyan.lab.sdrs.entity.JobStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Jobs, addressed by the surrogate id — the one collection with no slug.
 *
 * <p>{@code findOpenings} is the SQL copy of {@code Job.isPubliclyVisibleOn};
 * change one, change both (and {@code isOpening} in
 * {@code packages/shared/content/jobs.ts}).
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
            select j from Job j
            where j.status = :status
              and (j.deadline is null or j.deadline >= :today)
            """)
    List<Job> findOpenings(
            @Param("status") JobStatus status, @Param("today") LocalDate today, Sort sort);
}
