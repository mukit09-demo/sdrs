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
