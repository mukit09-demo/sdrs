package com.banyan.lab.sdrs.service;

import com.banyan.lab.sdrs.config.CacheNames;
import com.banyan.lab.sdrs.dto.ServiceRequest;
import com.banyan.lab.sdrs.dto.ServiceResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.ServiceMapper;
import com.banyan.lab.sdrs.repository.MarketRepository;
import com.banyan.lab.sdrs.repository.ServiceRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads and writes for services — the collection, hence the name.
 *
 * <p>The stereotype is spelled out because the entity is called {@link Service}.
 * A delete evicts the project caches too, since {@code project_service}
 * cascades.
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceService {

    private static final String RESOURCE = "service";

    /** Insertion order, which is the order the mock repository's store keeps. */
    private static final Sort ORDER = Sort.by("id");

    private final ServiceRepository repository;
    private final MarketRepository markets;
    private final ServiceMapper mapper;

    @Cacheable(cacheNames = CacheNames.SERVICES, key = "'all'")
    public List<ServiceResponse> list() {
        return mapper.toResponses(repository.findAll(ORDER));
    }

    @Cacheable(cacheNames = CacheNames.SERVICE, key = "#slug")
    public ServiceResponse get(String slug) {
        return mapper.toResponse(require(slug));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.SERVICES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.SERVICE, allEntries = true)
    })
    public ServiceResponse create(ServiceRequest request) {
        if (repository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException(RESOURCE, request.slug());
        }

        Service service = mapper.toEntity(request);
        service.getRelatedMarkets().addAll(relatedMarkets(request));
        return mapper.toResponse(repository.save(service));
    }

    /** The body's slug must match the path — see {@link NewsService#update}. */
    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.SERVICES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.SERVICE, allEntries = true)
    })
    public ServiceResponse update(String slug, ServiceRequest request) {
        References.requireSameSlug(slug, request.slug());

        Service existing = require(slug);
        List<Market> related = relatedMarkets(request);
        mapper.update(request, existing);
        existing.getRelatedMarkets().clear();
        existing.getRelatedMarkets().addAll(related);
        return mapper.toResponse(existing);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.SERVICES, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.SERVICE, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECTS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECT, allEntries = true)
    })
    public void delete(String slug) {
        repository.delete(require(slug));
    }

    private Service require(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE, slug));
    }

    private List<Market> relatedMarkets(ServiceRequest request) {
        return References.resolve(
                request.relatedMarketSlugs(), markets::findBySlugIn, Market::getSlug, "market");
    }
}
