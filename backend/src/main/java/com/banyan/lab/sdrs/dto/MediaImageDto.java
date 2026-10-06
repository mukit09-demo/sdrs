package com.banyan.lab.sdrs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Wire shape of {@code MediaImage}: {@code { url?, alt, seed? }}.
 *
 * <p>{@code NON_NULL} so an image with no URL serialises as
 * {@code {"alt":"…","seed":"…"}} rather than {@code {"url":null,…}} — matching
 * the optional fields in the TypeScript interface, and letting the front end's
 * gradient placeholder kick in on a plain absence.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MediaImageDto(
        @Size(max = 600) String url,
        @NotBlank @Size(max = 300) String alt,
        @Size(max = 160) String seed) {}
