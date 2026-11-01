package com.banyan.lab.sdrs.controller;

import com.banyan.lab.sdrs.dto.ServiceRequest;
import com.banyan.lab.sdrs.dto.ServiceResponse;
import com.banyan.lab.sdrs.service.ServiceService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code /api/services} — the endpoints {@code http.repository.ts} calls for services.
 * Access rules are in {@code config/SecurityConfig.java}, not here.
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService service;

    @GetMapping
    public List<ServiceResponse> list() {
        return service.list();
    }

    @GetMapping("/{slug}")
    public ServiceResponse get(@PathVariable String slug) {
        return service.get(slug);
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {
        ServiceResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/services/" + created.slug())).body(created);
    }

    /** 204, as on {@code NewsController.update}. */
    @PutMapping("/{slug}")
    public ResponseEntity<Void> update(
            @PathVariable String slug, @Valid @RequestBody ServiceRequest request) {
        service.update(slug, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        service.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
