package com.banyan.lab.sdrs.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.banyan.lab.sdrs.dto.JobRequest;
import com.banyan.lab.sdrs.dto.JobResponse;
import com.banyan.lab.sdrs.entity.CareerLevel;
import com.banyan.lab.sdrs.entity.EmploymentType;
import com.banyan.lab.sdrs.entity.Job;
import com.banyan.lab.sdrs.entity.JobStatus;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.JobMapper;
import com.banyan.lab.sdrs.repository.JobRepository;
import com.banyan.lab.sdrs.support.CollectionTestData;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

/** The id is the database's: a client may not choose one, or move one. */
@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository repository;

    private JobService service;

    @BeforeEach
    void setUp() {
        service = new JobService(repository, Mappers.getMapper(JobMapper.class));
    }

    private static JobRequest request(Long id, JobStatus status) {
        return new JobRequest(
                id, "Senior Structural Engineer", "Structural engineering", "London, United Kingdom",
                EmploymentType.FULL_TIME, CareerLevel.SENIOR, status, LocalDate.of(2026, 9, 12), null);
    }

    @Test
    @DisplayName("a create carrying an id is refused")
    void testIfCreateRefusesClientSuppliedId() {
        assertThatThrownBy(() -> service.create(request(7L, JobStatus.OPEN)))
                .isInstanceOf(IllegalArgumentException.class);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("an update whose body id disagrees with the path is refused")
    void testIfUpdateRefusesBodyIdMismatch() {
        assertThatThrownBy(() -> service.update(1L, request(2L, JobStatus.OPEN)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not match");
    }

    @Test
    @DisplayName("update writes onto the managed job and keeps its id")
    void testIfUpdateReplacesTheJobInPlace() {
        Job existing = CollectionTestData.job();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.update(1L, request(null, JobStatus.CLOSED));

        assertThat(existing.getId()).isEqualTo(1L);
        assertThat(existing.getStatus()).isEqualTo(JobStatus.CLOSED);
        assertThat(existing.getTitle()).isEqualTo("Senior Structural Engineer");
    }

    @Test
    @DisplayName("openings ask for open jobs whose deadline has not passed today in UTC, in insertion order")
    void testIfOpeningsQueryOpenJobsAsOfTodayInUtc() {
        when(repository.findOpenings(eq(JobStatus.OPEN), any(LocalDate.class), any(Sort.class)))
                .thenReturn(List.of(CollectionTestData.job()));
        LocalDate before = LocalDate.now(ZoneOffset.UTC);

        List<JobResponse> openings = service.openings();

        LocalDate after = LocalDate.now(ZoneOffset.UTC);
        ArgumentCaptor<LocalDate> today = ArgumentCaptor.forClass(LocalDate.class);
        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findOpenings(eq(JobStatus.OPEN), today.capture(), sort.capture());
        // Bracketed, so the test does not flake across a UTC midnight.
        assertThat(today.getValue()).isBetween(before, after);
        assertThat(sort.getValue()).isEqualTo(Sort.by("id"));
        assertThat(openings).extracting(JobResponse::id).containsExactly(CollectionTestData.JOB_ID);
    }

    @Test
    @DisplayName("no openings is an empty list")
    void testIfOpeningsReturnEmptyWhenNoneAreOpen() {
        when(repository.findOpenings(eq(JobStatus.OPEN), any(LocalDate.class), any(Sort.class)))
                .thenReturn(List.of());

        assertThat(service.openings()).isEmpty();
    }

    @Test
    @DisplayName("the CMS list is every job, every status, in insertion order")
    void testIfListReturnsJobsOfEveryStatus() {
        Job closed = CollectionTestData.job();
        closed.setId(2L);
        closed.setStatus(JobStatus.CLOSED);
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(CollectionTestData.job(), closed));

        assertThat(service.list()).extracting(JobResponse::status)
                .containsExactly(JobStatus.OPEN, JobStatus.CLOSED);

        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(repository).findAll(sort.capture());
        assertThat(sort.getValue()).isEqualTo(Sort.by("id"));
    }

    @Test
    @DisplayName("get maps the job found at the id")
    void testIfGetFindsTheJob() {
        when(repository.findById(1L)).thenReturn(Optional.of(CollectionTestData.job()));

        JobResponse found = service.get(1L);

        assertThat(found.id()).isEqualTo(1L);
        assertThat(found.level()).isEqualTo(CareerLevel.SENIOR);
        assertThat(found.deadline()).isNull();
    }

    @Test
    @DisplayName("an id that does not exist is not found")
    void testIfGetThrowsNotFoundForUnknownId() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("job")
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("a create without an id is saved and comes back with the database's id")
    void testIfCreateWithoutIdSavesTheJob() {
        when(repository.save(any())).thenAnswer(invocation -> {
            Job saved = invocation.getArgument(0);
            saved.setId(42L);
            return saved;
        });

        JobResponse created = service.create(request(null, JobStatus.DRAFT));

        assertThat(created.id()).isEqualTo(42L);
        assertThat(created.status()).isEqualTo(JobStatus.DRAFT);
    }

    @Test
    @DisplayName("an update whose body id matches the path is accepted")
    void testIfUpdateAcceptsMatchingBodyId() {
        Job existing = CollectionTestData.job();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        JobResponse updated = service.update(1L, request(1L, JobStatus.CLOSED));

        assertThat(updated.id()).isEqualTo(1L);
        assertThat(updated.status()).isEqualTo(JobStatus.CLOSED);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("an update can clear the deadline and set one")
    void testIfUpdateClearsTheDeadline() {
        Job existing = CollectionTestData.job();
        existing.setDeadline(LocalDate.of(2026, 12, 1));
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.update(1L, request(null, JobStatus.OPEN));

        assertThat(existing.getDeadline()).isNull();
    }

    @Test
    @DisplayName("a refused id mismatch never reaches the repository")
    void testIfUpdateWithMismatchedIdSkipsTheLookup() {
        assertThatThrownBy(() -> service.update(1L, request(2L, JobStatus.OPEN)))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("updating something absent is a 404")
    void testIfUpdateThrowsNotFoundForUnknownId() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, request(null, JobStatus.OPEN)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("delete removes the job found at the id")
    void testIfDeleteRemovesTheJob() {
        Job existing = CollectionTestData.job();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.delete(1L);

        verify(repository).delete(existing);
    }

    @Test
    @DisplayName("deleting something absent is a 404, not a silent success")
    void testIfDeleteThrowsNotFoundForUnknownId() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).delete(any(Job.class));
    }
}
