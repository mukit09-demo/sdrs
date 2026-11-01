package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum JobStatus implements Labelled {
    /** Written, not yet advertised. Never publicly listed. */
    DRAFT("Draft"),

    /** Advertised — the only status the public list considers. */
    OPEN("Open"),

    /** Withdrawn or filled. Never publicly listed, whatever the deadline says. */
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
