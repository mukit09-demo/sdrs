package com.banyan.lab.sdrs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Wire shape of {@code Author}: {@code { name, role }}. */
public record AuthorDto(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 200) String role) {}
