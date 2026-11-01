package com.banyan.lab.sdrs.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.support.CollectionTestData;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/**
 * The Java copy of {@code JobRepository.findOpenings} and {@code isOpening} in
 * {@code jobs.ts}: open, and the deadline today or later, or none at all.
 */
class JobTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 1);

    private static Job job(JobStatus status, LocalDate deadline) {
        Job job = CollectionTestData.job();
        job.setStatus(status);
        job.setDeadline(deadline);
        return job;
    }

    @Test
    @DisplayName("open with no deadline is visible")
    void testIfOpenJobWithoutDeadlineIsVisible() {
        assertThat(job(JobStatus.OPEN, null).isPubliclyVisibleOn(TODAY)).isTrue();
    }

    @Test
    @DisplayName("open with a future deadline is visible")
    void testIfOpenJobWithFutureDeadlineIsVisible() {
        assertThat(job(JobStatus.OPEN, TODAY.plusDays(1)).isPubliclyVisibleOn(TODAY)).isTrue();
    }

    @Test
    @DisplayName("a deadline of today is still visible: the deadline day is inclusive")
    void testIfOpenJobWithDeadlineTodayIsVisible() {
        assertThat(job(JobStatus.OPEN, TODAY).isPubliclyVisibleOn(TODAY)).isTrue();
    }

    @Test
    @DisplayName("a deadline of yesterday is not visible")
    void testIfOpenJobWithPastDeadlineIsHidden() {
        assertThat(job(JobStatus.OPEN, TODAY.minusDays(1)).isPubliclyVisibleOn(TODAY)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = JobStatus.class, names = {"DRAFT", "CLOSED"})
    @DisplayName("a draft or closed job is never visible, whatever the deadline says")
    void testIfDraftOrClosedJobIsAlwaysHidden(JobStatus status) {
        assertThat(job(status, null).isPubliclyVisibleOn(TODAY)).isFalse();
        assertThat(job(status, TODAY.plusYears(1)).isPubliclyVisibleOn(TODAY)).isFalse();
    }

    @Test
    @DisplayName("a job with no status is not visible")
    void testIfJobWithoutStatusIsHidden() {
        assertThat(job(null, null).isPubliclyVisibleOn(TODAY)).isFalse();
    }

    @Test
    @DisplayName("the no-argument form checks against the current date")
    void testIfNoArgumentVisibilityChecksAgainstToday() {
        assertThat(job(JobStatus.OPEN, null).isPubliclyVisible()).isTrue();
        assertThat(job(JobStatus.OPEN, LocalDate.now().minusDays(1)).isPubliclyVisible()).isFalse();
    }
}
