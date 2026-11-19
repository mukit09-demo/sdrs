package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ServiceCategory implements Labelled {
    ADVISORY("Advisory"),
    DESIGN_AND_ENGINEERING("Design & Engineering"),
    DIGITAL("Digital"),
    PLANNING_AND_SUSTAINABILITY("Planning & Sustainability"),
    RESEARCH_AND_INNOVATION("Research & Innovation");

    private final String label;

    ServiceCategory(String label) {
        this.label = label;
    }

    @Override
    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ServiceCategory fromLabel(String raw) {
        return Labelled.fromLabel(ServiceCategory.class, raw);
    }
}
