package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.dto.ServiceRequest;
import com.banyan.lab.sdrs.dto.ServiceResponse;
import com.banyan.lab.sdrs.entity.Market;
import com.banyan.lab.sdrs.entity.Service;
import java.util.List;
import java.util.Objects;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface ServiceMapper {

    @Mapping(target = "relatedMarketSlugs", source = "relatedMarkets")
    ServiceResponse toResponse(Service entity);

    List<ServiceResponse> toResponses(List<Service> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "relatedMarkets", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Service toEntity(ServiceRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "relatedMarkets", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(ServiceRequest request, @MappingTarget Service entity);

    default List<String> marketSlugs(List<Market> markets) {
        return markets.stream().filter(Objects::nonNull).map(Market::getSlug).toList();
    }
}
