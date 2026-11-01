package com.banyan.lab.sdrs.mapper;

import com.banyan.lab.sdrs.dto.JobRequest;
import com.banyan.lab.sdrs.dto.JobResponse;
import com.banyan.lab.sdrs.entity.Job;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/** Entity ↔ DTO for jobs. The id is the database's, in both directions. */
@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface JobMapper {

    JobResponse toResponse(Job entity);

    List<JobResponse> toResponses(List<Job> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Job toEntity(JobRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void update(JobRequest request, @MappingTarget Job entity);
}
