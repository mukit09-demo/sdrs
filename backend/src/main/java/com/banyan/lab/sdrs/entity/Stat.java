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
 * A headline figure — {@code { value: "714", unit: "MW", label: "…" }}.
 *
 * <p>{@code value} is a string, not a number: the content says "714", "1,200+"
 * and "Top 3", and the UI renders it verbatim. Making it numeric here would mean
 * the CMS could not express two of those three.
 *
 * <p>Used from {@code @ElementCollection}, so the column names are unqualified
 * and the owning table supplies the context. {@code stat_value} rather than
 * {@code value} because {@code VALUE} is a reserved word in standard SQL.
 */
@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
