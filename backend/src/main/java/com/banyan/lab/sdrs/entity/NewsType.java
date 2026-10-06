package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * The newsroom taxonomy — the five chips under CATEGORY on {@code /news}, and
 * {@code ArticleCategory} in the shared TypeScript model.
 *
 * <p>Note Jackson 3 (Spring Boot 4) moved to {@code tools.jackson}, but
 * {@code jackson-annotations} deliberately kept the
 * {@code com.fasterxml.jackson.annotation} package — so these imports are
 * correct and not a leftover from Jackson 2.
 */
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
