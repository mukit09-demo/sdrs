package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Seniority of a vacancy — drives the level filter on {@code /careers}.
 *
 * <p>Stored as the constant, served as the label — see {@link Labelled}.
 */
public enum CareerLevel implements Labelled {
    GRADUATE("Graduate"),
    EXPERIENCED("Experienced"),
    SENIOR("Senior"),
    LEADERSHIP("Leadership");

    private final String label;

    CareerLevel(String label) {
        this.label = label;
    }

    @Override
    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static CareerLevel fromLabel(String raw) {
        return Labelled.fromLabel(CareerLevel.class, raw);
    }
}
