package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Mirrors {@code MediaImage} in the shared domain model.
 *
 * <p>{@code url} and {@code seed} are nullable on purpose: while a URL is
 * absent the front end renders a deterministic gradient placeholder derived
 * from the seed. {@code alt} never is — a placeholder still needs an accessible
 * description.
 */
@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaImage {

    @Size(max = 600)
    @Column(name = "image_url", length = 600)
    private String url;

    @NotBlank
    @Size(max = 300)
    @Column(name = "image_alt", length = 300, nullable = false)
    private String alt;

    @Size(max = 160)
    @Column(name = "image_seed", length = 160)
    private String seed;
}
