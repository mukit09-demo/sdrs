package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum JobStatus implements Labelled {
    DRAFT("Draft"),

    OPEN("Open"),

    CLOSED("Closed");

    private final String label;

    JobStatus(String label) {
        this.label = label;
    }

    @Override
    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static JobStatus fromLabel(String raw) {
        return Labelled.fromLabel(JobStatus.class, raw);
    }
}
