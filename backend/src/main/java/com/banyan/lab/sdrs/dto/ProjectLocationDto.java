package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectLocationDto(
        @JsonInclude(JsonInclude.Include.NON_NULL) @Size(max = 160) String city,
        @NotBlank @Size(max = 160) String country) {}
