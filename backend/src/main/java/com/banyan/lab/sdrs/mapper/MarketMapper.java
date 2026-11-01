package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.dto.MarketRequest;
import com.banyan.lab.sdrs.dto.MarketResponse;
import com.banyan.lab.sdrs.entity.Market;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Entity ↔ DTO for markets, on the same terms as {@link NewsMapper}.
 *
 * <p>{@code update} writes onto the managed instance rather than building a new
 * one: MapStruct clears and refills the existing collections, which is what
 * Hibernate needs to track them. The slug is left alone — the service has
 * already checked it matches.
 */
@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface MarketMapper {

    MarketResponse toResponse(Market entity);

    List<MarketResponse> toResponses(List<Market> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Market toEntity(MarketRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(MarketRequest request, @MappingTarget Market entity);
}
