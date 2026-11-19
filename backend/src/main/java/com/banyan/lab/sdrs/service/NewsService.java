package com.banyan.lab.sdrs.service;

import com.banyan.lab.sdrs.config.CacheNames;
import com.banyan.lab.sdrs.dto.ArticleRequest;
import com.banyan.lab.sdrs.dto.ArticleResponse;
import com.banyan.lab.sdrs.dto.ArticleSummaryResponse;
import com.banyan.lab.sdrs.entity.NewsArticle;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.NewsMapper;
import com.banyan.lab.sdrs.repository.NewsRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsService {

    private static final String RESOURCE = "article";

    private static final Sort NEWEST_FIRST =
            Sort.by(Sort.Direction.DESC, "publishedAt").and(Sort.by(Sort.Direction.ASC, "slug"));

    private final NewsRepository repository;
    private final NewsMapper mapper;

    @Cacheable(cacheNames = CacheNames.ARTICLES, key = "{#tag, #excludeSlug, #limit}")
    public List<ArticleSummaryResponse> list(String tag, String excludeSlug, Integer limit) {
        Specification<NewsArticle> specification = filter(tag, excludeSlug);

        List<NewsArticle> found = (limit == null || limit <= 0)
                ? repository.findAll(specification, NEWEST_FIRST)
                : repository.findAll(specification, PageRequest.of(0, limit, NEWEST_FIRST)).getContent();

        return mapper.toSummaries(found);
    }

    @Cacheable(cacheNames = CacheNames.ARTICLE, key = "#slug")
    public ArticleResponse get(String slug) {
        return mapper.toResponse(require(slug));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.ARTICLES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.ARTICLE, allEntries = true)
    })
    public ArticleResponse create(ArticleRequest request) {
        if (repository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException(RESOURCE, request.slug());
        }

        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.ARTICLES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.ARTICLE, allEntries = true)
    })
    public ArticleResponse update(String slug, ArticleRequest request) {
        if (!slug.equals(request.slug())) {
            throw new IllegalArgumentException(
                    "Path slug \"%s\" does not match body slug \"%s\"".formatted(slug, request.slug()));
        }

        NewsArticle existing = require(slug);
        existing.replaceWith(mapper.toEntity(request));
        return mapper.toResponse(existing);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.ARTICLES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.ARTICLE, allEntries = true)
    })
    public void delete(String slug) {
        repository.delete(require(slug));
    }

    private NewsArticle require(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE, slug));
    }

    private static Specification<NewsArticle> filter(String tag, String excludeSlug) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(tag)) {
                predicates.add(builder.isMember(tag, root.<List<String>>get("tags")));
            }
            if (StringUtils.hasText(excludeSlug)) {
                predicates.add(builder.notEqual(root.get("slug"), excludeSlug));
            }

            return predicates.isEmpty() ? null : builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
