package com.banyan.lab.sdrs.service;

import com.banyan.lab.sdrs.config.CacheNames;
import com.banyan.lab.sdrs.dto.MarketRequest;
import com.banyan.lab.sdrs.dto.MarketResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.MarketMapper;
import com.banyan.lab.sdrs.repository.MarketRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads and writes for markets.
 *
 * <p>A delete also evicts the service and project caches: {@code service_market}
 * and {@code project_market} cascade, so removing a market changes what those
 * return.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketService {

    private static final String RESOURCE = "market";

    /** Insertion order, which is the order the mock repository's store keeps. */
    private static final Sort ORDER = Sort.by("id");

    private final MarketRepository repository;
    private final MarketMapper mapper;

    @Cacheable(cacheNames = CacheNames.MARKETS, key = "'all'")
    public List<MarketResponse> list() {
        return mapper.toResponses(repository.findAll(ORDER));
    }

    @Cacheable(cacheNames = CacheNames.MARKET, key = "#slug")
    public MarketResponse get(String slug) {
        return mapper.toResponse(require(slug));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MARKETS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MARKET, allEntries = true)
    })
    public MarketResponse create(MarketRequest request) {
        if (repository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException(RESOURCE, request.slug());
        }

        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    /** The body's slug must match the path — see {@link NewsService#update}. */
    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MARKETS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MARKET, allEntries = true)
    })
    public MarketResponse update(String slug, MarketRequest request) {
        References.requireSameSlug(slug, request.slug());

        Market existing = require(slug);
        mapper.update(request, existing);
        return mapper.toResponse(existing);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.MARKETS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.MARKET, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.SERVICES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.SERVICE, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECTS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECT, allEntries = true)
    })
    public void delete(String slug) {
        repository.delete(require(slug));
    }

    private Market require(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE, slug));
    }
}
