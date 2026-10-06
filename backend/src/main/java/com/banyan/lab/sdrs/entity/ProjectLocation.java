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

/** Where a project is. {@code city} is optional — some are national programmes. */
@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectLocation {

    @Size(max = 160)
    @Column(name = "location_city", length = 160)
    private String city;

    @NotBlank
    @Size(max = 160)
    @Column(name = "location_country", length = 160, nullable = false)
    private String country;
}
