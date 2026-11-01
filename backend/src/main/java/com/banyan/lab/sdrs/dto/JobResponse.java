package com.banyan.lab.sdrs.dto;

import com.banyan.lab.sdrs.entity.CareerLevel;
import com.banyan.lab.sdrs.entity.EmploymentType;
import com.banyan.lab.sdrs.entity.JobStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;

/**
 * Field for field {@code JobOpening} in {@code packages/shared/types/content.ts}.
 *
 * <p>{@code deadline} is {@code NON_NULL}: absent means "open until filled",
 * which {@code isOpening} tests with {@code === undefined}, so a {@code null}
 * would read as a deadline that had already passed.
 */
public record JobResponse(
        long id,
        String title,
        String discipline,
        String location,
        EmploymentType employmentType,
        CareerLevel level,
        JobStatus status,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") LocalDate postedAt,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate deadline) {}
