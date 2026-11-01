package com.banyan.lab.sdrs.controller;

import com.banyan.lab.sdrs.dto.MarketRequest;
import com.banyan.lab.sdrs.dto.MarketResponse;
import com.banyan.lab.sdrs.service.MarketService;
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
 * {@code /api/markets} — the endpoints {@code http.repository.ts} calls for markets.
 * Access rules are in {@code config/SecurityConfig.java}, not here.
 */
@RestController
@RequestMapping("/api/markets")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService service;

    @GetMapping
    public List<MarketResponse> list() {
        return service.list();
    }

    @GetMapping("/{slug}")
    public MarketResponse get(@PathVariable String slug) {
        return service.get(slug);
    }

    @PostMapping
    public ResponseEntity<MarketResponse> create(@Valid @RequestBody MarketRequest request) {
        MarketResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/markets/" + created.slug())).body(created);
    }

    /** 204, as on {@code NewsController.update}. */
    @PutMapping("/{slug}")
    public ResponseEntity<Void> update(
            @PathVariable String slug, @Valid @RequestBody MarketRequest request) {
        service.update(slug, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        service.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
