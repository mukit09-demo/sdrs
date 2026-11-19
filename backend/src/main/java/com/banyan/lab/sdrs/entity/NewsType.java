package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NewsType implements Labelled {
    PRESS_RELEASE("Press release"),
    INSIGHT("Insight"),
    AWARD("Award"),
    REPORT("Report"),
    EVENT("Event");

    private final String label;

    NewsType(String label) {
        this.label = label;
    }

    @Override
    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static NewsType fromLabel(String raw) {
        return Labelled.fromLabel(NewsType.class, raw);
    }
}
