package com.banyan.lab.sdrs.controller;

import com.banyan.lab.sdrs.dto.ProjectRequest;
import com.banyan.lab.sdrs.dto.ProjectResponse;
import com.banyan.lab.sdrs.service.ProjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code /api/projects} — the endpoints {@code http.repository.ts} calls for projects.
 * The query parameter names ({@code market}, {@code service}, {@code slugs},
 * {@code limit}) come from there. Access rules are in {@code config/SecurityConfig.java}, not here.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService service;

    /**
     * {@code slugs} arrives comma-separated ({@code ?slugs=a,b}), which Spring
     * splits into the list.
     */
    @GetMapping
    public List<ProjectResponse> list(
            @RequestParam(name = "market", required = false) String marketSlug,
            @RequestParam(name = "service", required = false) String serviceSlug,
            @RequestParam(required = false) List<String> slugs,
            @RequestParam(required = false) @Positive Integer limit) {
        return service.list(marketSlug, serviceSlug, slugs, limit);
    }

    @GetMapping("/{slug}")
    public ProjectResponse get(@PathVariable String slug) {
        return service.get(slug);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/projects/" + created.slug())).body(created);
    }

    /** 204, as on {@code NewsController.update}. */
    @PutMapping("/{slug}")
    public ResponseEntity<Void> update(
            @PathVariable String slug, @Valid @RequestBody ProjectRequest request) {
        service.update(slug, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        service.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
