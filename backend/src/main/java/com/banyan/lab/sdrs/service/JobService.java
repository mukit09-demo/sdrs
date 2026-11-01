package com.banyan.lab.sdrs.service;

import com.banyan.lab.sdrs.config.CacheNames;
import com.banyan.lab.sdrs.dto.JobRequest;
import com.banyan.lab.sdrs.dto.JobResponse;
import com.banyan.lab.sdrs.entity.Job;
import com.banyan.lab.sdrs.entity.JobStatus;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.JobMapper;
import com.banyan.lab.sdrs.repository.JobRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads and writes for jobs.
 *
 * <p>Two reads: {@link #openings} for candidates, filtered and cached, and
 * {@link #list} / {@link #get} for the CMS, every status and uncached — an
 * editor saving a draft should see it at once.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobService {

    private static final String RESOURCE = "job";

    /** Insertion order, which is the order the mock repository's store keeps. */
    private static final Sort ORDER = Sort.by("id");

    private final JobRepository repository;
    private final JobMapper mapper;

    /**
     * Today in UTC, matching {@code todayIso()} in {@code jobs.ts}, so the two
     * sources agree on which day a deadline falls.
     */
    @Cacheable(cacheNames = CacheNames.OPENINGS, key = "'all'")
    public List<JobResponse> openings() {
        return mapper.toResponses(
                repository.findOpenings(JobStatus.OPEN, LocalDate.now(ZoneOffset.UTC), ORDER));
    }

    public List<JobResponse> list() {
        return mapper.toResponses(repository.findAll(ORDER));
    }

    public JobResponse get(long id) {
        return mapper.toResponse(require(id));
    }

    @Transactional
    @CacheEvict(cacheNames = CacheNames.OPENINGS, allEntries = true)
    public JobResponse create(JobRequest request) {
        if (request.id() != null) {
            throw new IllegalArgumentException("A new job must not carry an id; the server assigns it");
        }

        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    /** An id in the body is optional, but must match the path if present. */
    @Transactional
    @CacheEvict(cacheNames = CacheNames.OPENINGS, allEntries = true)
    public JobResponse update(long id, JobRequest request) {
        if (request.id() != null && request.id() != id) {
            throw new IllegalArgumentException(
                    "Path id %d does not match body id %d".formatted(id, request.id()));
        }

        Job existing = require(id);
        mapper.update(request, existing);
        return mapper.toResponse(existing);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheNames.OPENINGS, allEntries = true)
    public void delete(long id) {
        repository.delete(require(id));
    }

    private Job require(long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE, String.valueOf(id)));
    }
}
