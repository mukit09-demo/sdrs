package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EmploymentType implements Labelled {
    FULL_TIME("Full time"),
    PART_TIME("Part time"),
    CONTRACT("Contract");

    private final String label;

    EmploymentType(String label) {
        this.label = label;
    }

    @Override
    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static EmploymentType fromLabel(String raw) {
        return Labelled.fromLabel(EmploymentType.class, raw);
    }
}
