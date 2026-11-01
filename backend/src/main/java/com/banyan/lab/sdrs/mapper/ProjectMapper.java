package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.dto.ProjectRequest;
import com.banyan.lab.sdrs.dto.ProjectResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Project;
import com.banyan.lab.sdrs.entity.Service;
import java.util.List;
import java.util.Objects;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Entity ↔ DTO for projects. Markets and services go rows → slugs here and
 * slugs → rows in the service, as in {@link ServiceMapper}.
 */
@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface ProjectMapper {

    @Mapping(target = "marketSlugs", source = "markets")
    @Mapping(target = "serviceSlugs", source = "services")
    ProjectResponse toResponse(Project entity);

    List<ProjectResponse> toResponses(List<Project> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "markets", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Project toEntity(ProjectRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "markets", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(ProjectRequest request, @MappingTarget Project entity);

    /** Nulls dropped for the reason on {@link ServiceMapper#marketSlugs}. */
    default List<String> marketSlugs(List<Market> markets) {
        return markets.stream().filter(Objects::nonNull).map(Market::getSlug).toList();
    }

    default List<String> serviceSlugs(List<Service> services) {
        return services.stream().filter(Objects::nonNull).map(Service::getSlug).toList();
    }
}
