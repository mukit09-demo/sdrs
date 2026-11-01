package com.banyan.lab.sdrs.controller;

import com.banyan.lab.sdrs.dto.JobRequest;
import com.banyan.lab.sdrs.dto.JobResponse;
import com.banyan.lab.sdrs.service.JobService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Jobs, at two read paths.
 *
 * <p>{@code GET /api/jobs} is the candidate-facing list — openings only — and
 * public. Every-status reads are under {@code /api/admin/jobs}, because
 * {@code SecurityConfig} makes every other {@code GET /api/**} public and a
 * draft vacancy should not be readable by anyone. As with the enquiry inbox,
 * the prefix is the authorisation; {@code JobControllerTest} holds it there.
 */
@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService service;

    @GetMapping("/api/jobs")
    public List<JobResponse> openings() {
        return service.openings();
    }

    @GetMapping("/api/admin/jobs")
    public List<JobResponse> list() {
        return service.list();
    }

    @GetMapping("/api/admin/jobs/{id}")
    public JobResponse get(@PathVariable long id) {
        return service.get(id);
    }

    /** 201 with the saved job: the CMS needs the id the database assigned. */
    @PostMapping("/api/jobs")
    public ResponseEntity<JobResponse> create(@Valid @RequestBody JobRequest request) {
        JobResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/admin/jobs/" + created.id())).body(created);
    }

    @PutMapping("/api/jobs/{id}")
    public ResponseEntity<Void> update(@PathVariable long id, @Valid @RequestBody JobRequest request) {
        service.update(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/jobs/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
