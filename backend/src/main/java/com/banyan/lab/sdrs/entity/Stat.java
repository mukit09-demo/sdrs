package com.banyan.lab.sdrs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class Stat {

    @NotBlank
    @Size(max = 60)
    @Column(name = "stat_value", length = 60, nullable = false)
    private String value;

    @Size(max = 40)
    @Column(name = "unit", length = 40)
    private String unit;

    @NotBlank
    @Size(max = 300)
    @Column(name = "label", length = 300, nullable = false)
    private String label;
}
