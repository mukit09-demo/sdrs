package com.banyan.lab.sdrs.dto;

import com.banyan.lab.sdrs.entity.CareerLevel;
import com.banyan.lab.sdrs.entity.EmploymentType;
import com.banyan.lab.sdrs.entity.JobStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * {@code JobOpeningDraft} in {@code packages/shared/types/content.ts}.
 *
 * <p>{@code id} is accepted because the CMS sends the draft whole, but it is
 * the backend's to assign: a POST carrying one and a PUT whose id disagrees with
 * the path are both refused by the service.
 */
public record JobRequest(
        Long id,

        @NotBlank @Size(max = 300) String title,

        @NotBlank @Size(max = 160) String discipline,

        @NotBlank @Size(max = 160) String location,

        @NotNull EmploymentType employmentType,

        @NotNull CareerLevel level,

        @NotNull JobStatus status,

        @NotNull
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate postedAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate deadline) {}
