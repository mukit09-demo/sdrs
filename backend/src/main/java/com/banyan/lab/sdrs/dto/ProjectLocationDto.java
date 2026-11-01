package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** {@code ProjectLocation} in the shared model; {@code city} is optional there. */
public record ProjectLocationDto(
        @JsonInclude(JsonInclude.Include.NON_NULL) @Size(max = 160) String city,
        @NotBlank @Size(max = 160) String country) {}
