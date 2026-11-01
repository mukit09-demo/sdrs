package com.banyan.lab.sdrs.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.dto.JobRequest;
import com.banyan.lab.sdrs.dto.JobResponse;
import com.banyan.lab.sdrs.entity.CareerLevel;
import com.banyan.lab.sdrs.entity.EmploymentType;
import com.banyan.lab.sdrs.entity.Job;
import com.banyan.lab.sdrs.entity.JobStatus;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/** The id is the database's, in both directions. */
class JobMapperTest {

    private final JobMapper mapper = Mappers.getMapper(JobMapper.class);

    private static JobRequest request(Long id, LocalDate deadline) {
        return new JobRequest(
                id, "Graduate Engineer", "Civil engineering", "Leeds, United Kingdom",
                EmploymentType.CONTRACT, CareerLevel.GRADUATE, JobStatus.DRAFT,
                LocalDate.of(2026, 10, 1), deadline);
    }

    @Test
    @DisplayName("maps every field, and an open-ended job keeps a null deadline")
    void testIfToResponseMapsEveryField() {
        JobResponse response = mapper.toResponse(CollectionTestData.job());

        assertThat(response.id()).isEqualTo(CollectionTestData.JOB_ID);
        assertThat(response.title()).isEqualTo("Senior Structural Engineer — Tall Buildings");
        assertThat(response.employmentType()).isEqualTo(EmploymentType.FULL_TIME);
        assertThat(response.level()).isEqualTo(CareerLevel.SENIOR);
        assertThat(response.status()).isEqualTo(JobStatus.OPEN);
        assertThat(response.postedAt()).isEqualTo(LocalDate.of(2026, 9, 12));
        assertThat(response.deadline()).isNull();
    }

    @Test
    @DisplayName("toEntity never takes the client's id")
    void testIfToEntityIgnoresClientId() {
        Job job = mapper.toEntity(request(99L, LocalDate.of(2026, 11, 30)));

        assertThat(job.getId()).isNull();
        assertThat(job.getCreatedAt()).isNull();
        assertThat(job.getTitle()).isEqualTo("Graduate Engineer");
        assertThat(job.getDeadline()).isEqualTo(LocalDate.of(2026, 11, 30));
    }

    @Test
    @DisplayName("update never moves the id, even when the body carries a different one")
    void testIfUpdateNeverChangesTheId() {
        Job existing = CollectionTestData.job();

        mapper.update(request(99L, null), existing);

        assertThat(existing.getId()).isEqualTo(CollectionTestData.JOB_ID);
        assertThat(existing.getStatus()).isEqualTo(JobStatus.DRAFT);
        assertThat(existing.getLevel()).isEqualTo(CareerLevel.GRADUATE);
    }

    @Test
    @DisplayName("update overwrites a deadline with null, reopening the job until filled")
    void testIfUpdateWithNullDeadlineClearsIt() {
        Job existing = CollectionTestData.job();
        existing.setDeadline(LocalDate.of(2026, 12, 1));

        mapper.update(request(null, null), existing);

        assertThat(existing.getDeadline()).isNull();
    }

    @Test
    @DisplayName("lists map element for element, and null maps to null")
    void testIfListsMapEachJobAndNullMapsToNull() {
        assertThat(mapper.toResponses(List.of(CollectionTestData.job()))).hasSize(1);
        assertThat(mapper.toResponses(List.of())).isEmpty();
        assertThat(mapper.toEntity(null)).isNull();
    }
}
