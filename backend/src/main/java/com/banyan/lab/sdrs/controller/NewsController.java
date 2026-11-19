package com.banyan.lab.sdrs.controller;

import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.dto.ArticleSummaryResponse;
import com.banyan.lab.sdrs.service.NewsService;
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

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService service;

    @GetMapping
    public List<ArticleSummaryResponse> list(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @Positive Integer limit,
            @RequestParam(required = false) String exclude) {
        return service.list(tag, exclude, limit);
    }

    @GetMapping("/{slug}")
    public ArticleResponse get(@PathVariable String slug) {
        return service.get(slug);
    }

    @PostMapping
    public ResponseEntity<ArticleResponse> create(@Valid @RequestBody ArticleRequest request) {
        ArticleResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/articles/" + created.slug())).body(created);
    }

    @PutMapping("/{slug}")
    public ResponseEntity<Void> update(
            @PathVariable String slug, @Valid @RequestBody ArticleRequest request) {
        service.update(slug, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        service.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
