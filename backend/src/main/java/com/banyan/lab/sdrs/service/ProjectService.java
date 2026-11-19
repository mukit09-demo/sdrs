package com.banyan.lab.sdrs.service;

import com.banyan.lab.sdrs.config.CacheNames;
import com.banyan.lab.sdrs.dto.ProjectRequest;
import com.banyan.lab.sdrs.dto.ProjectResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Project;
import com.banyan.lab.sdrs.entity.Service;
import com.banyan.lab.sdrs.exception.DuplicateResourceException;
import com.banyan.lab.sdrs.exception.ResourceNotFoundException;
import com.banyan.lab.sdrs.mapper.ProjectMapper;
import com.banyan.lab.sdrs.repository.MarketRepository;
import com.banyan.lab.sdrs.repository.ProjectRepository;
import com.banyan.lab.sdrs.repository.ServiceRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private static final String RESOURCE = "project";

    private static final Sort NEWEST_FIRST =
            Sort.by(Sort.Direction.DESC, "year").and(Sort.by(Sort.Direction.ASC, "slug"));

    private final ProjectRepository repository;
    private final MarketRepository markets;
    private final ServiceRepository services;
    private final ProjectMapper mapper;

    @Cacheable(cacheNames = CacheNames.PROJECTS, key = "{#marketSlug, #serviceSlug, #slugs, #limit}")
    public List<ProjectResponse> list(
            String marketSlug, String serviceSlug, List<String> slugs, Integer limit) {

        boolean limited = limit != null && limit > 0;

        if (slugs != null) {
            List<Project> ordered = slugs.isEmpty()
                    ? List.of()
                    : orderedBySlug(slugs, repository.findBySlugIn(slugs));
            return mapper.toResponses(limited ? ordered.stream().limit(limit).toList() : ordered);
        }

        Optional<Market> market = Optional.empty();
        if (StringUtils.hasText(marketSlug)) {
            market = markets.findBySlug(marketSlug);
            if (market.isEmpty()) {
                return List.of();
            }
        }
        Optional<Service> service = Optional.empty();
        if (StringUtils.hasText(serviceSlug)) {
            service = services.findBySlug(serviceSlug);
            if (service.isEmpty()) {
                return List.of();
            }
        }

        Specification<Project> specification = filter(market.orElse(null), service.orElse(null));
        List<Project> found = limited
                ? repository.findAll(specification, PageRequest.of(0, limit, NEWEST_FIRST)).getContent()
                : repository.findAll(specification, NEWEST_FIRST);

        return mapper.toResponses(found);
    }

    @Cacheable(cacheNames = CacheNames.PROJECT, key = "#slug")
    public ProjectResponse get(String slug) {
        return mapper.toResponse(require(slug));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.PROJECTS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECT, allEntries = true)
    })
    public ProjectResponse create(ProjectRequest request) {
        if (repository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException(RESOURCE, request.slug());
        }

        Project project = mapper.toEntity(request);
        project.getMarkets().addAll(marketsOf(request));
        project.getServices().addAll(servicesOf(request));
        return mapper.toResponse(repository.save(project));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.PROJECTS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECT, allEntries = true)
    })
    public ProjectResponse update(String slug, ProjectRequest request) {
        References.requireSameSlug(slug, request.slug());

        Project existing = require(slug);
        List<Market> resolvedMarkets = marketsOf(request);
        List<Service> resolvedServices = servicesOf(request);

        mapper.update(request, existing);

        boolean marketsChanged = !existing.getMarkets().equals(resolvedMarkets);
        boolean servicesChanged = !existing.getServices().equals(resolvedServices);
        if (marketsChanged) {
            existing.getMarkets().clear();
        }
        if (servicesChanged) {
            existing.getServices().clear();
        }
        if (marketsChanged || servicesChanged) {
            repository.flush();
        }
        if (marketsChanged) {
            existing.getMarkets().addAll(resolvedMarkets);
        }
        if (servicesChanged) {
            existing.getServices().addAll(resolvedServices);
        }
        return mapper.toResponse(existing);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.PROJECTS, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.PROJECT, allEntries = true)
    })
    public void delete(String slug) {
        repository.delete(require(slug));
    }

    private Project require(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE, slug));
    }

    private List<Market> marketsOf(ProjectRequest request) {
        return References.resolve(
                request.marketSlugs(), markets::findBySlugIn, Market::getSlug, "market");
    }

    private List<Service> servicesOf(ProjectRequest request) {
        return References.resolve(
                request.serviceSlugs(), services::findBySlugIn, Service::getSlug, "service");
    }

    private static List<Project> orderedBySlug(List<String> slugs, List<Project> found) {
        return slugs.stream()
                .distinct()
                .flatMap(slug -> found.stream().filter(project -> project.getSlug().equals(slug)))
                .toList();
    }

    private static Specification<Project> filter(Market market, Service service) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (market != null) {
                predicates.add(builder.isMember(market, root.<List<Market>>get("markets")));
            }
            if (service != null) {
                predicates.add(builder.isMember(service, root.<List<Service>>get("services")));
            }

            return predicates.isEmpty() ? null : builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
