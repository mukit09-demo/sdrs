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

/** Mirrors {@code Author} in the shared domain model: a name and a role. */
@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Author {

    @NotBlank
    @Size(max = 160)
    @Column(name = "author_name", length = 160, nullable = false)
    private String name;

    @NotBlank
    @Size(max = 200)
    @Column(name = "author_role", length = 200, nullable = false)
    private String role;
}
