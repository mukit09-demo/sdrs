package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * {@code Stat} in {@code packages/shared/types/content.ts}, both directions.
 * {@code unit} is optional there, so an absent one omits the key.
 */
public record StatDto(
        @NotBlank @Size(max = 60) String value,
        @JsonInclude(JsonInclude.Include.NON_NULL) @Size(max = 40) String unit,
        @NotBlank @Size(max = 300) String label) {}
