package com.banyan.lab.sdrs.entity;

import java.util.Arrays;

/**
 * An enum whose wire format is a human-readable label rather than its constant.
 *
 * <p>The TypeScript domain model types these as string unions — {@code "Press
 * release"}, {@code "Design & Engineering"}, {@code "Middle East and Africa"} —
 * and renders them directly. So the label is the contract, while the constant is
 * what goes in the column: {@code PRESS_RELEASE} stored, {@code "Press release"}
 * served.
 *
 * <p>Each implementation adds {@code @JsonValue} on {@link #getLabel()} and a
 * {@code @JsonCreator} delegating to {@link #fromLabel}, which is the only part
 * worth sharing — nine copies of the same lookup loop is nine places for the
 * error message to drift.
 */
public interface Labelled {

    String getLabel();

    /**
     * Accepts the label ({@code "Press release"}) or the constant
     * ({@code "PRESS_RELEASE"}), so a hand-written curl is not a puzzle.
     *
     * <p>An unrecognised value throws rather than defaulting, and the message
     * lists what would have worked — {@code ApiExceptionHandler} surfaces it as
     * a 400 naming the valid labels.
     */
    static <E extends Enum<E> & Labelled> E fromLabel(Class<E> type, String raw) {
        String candidate = raw == null ? "" : raw.trim();

        return Arrays.stream(type.getEnumConstants())
                .filter(value -> value.getLabel().equalsIgnoreCase(candidate)
                        || value.name().equalsIgnoreCase(candidate))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown %s \"%s\". Expected one of: %s"
                                .formatted(type.getSimpleName(), raw, labels(type))));
    }

    static <E extends Enum<E> & Labelled> String labels(Class<E> type) {
        return String.join(", ",
                Arrays.stream(type.getEnumConstants()).map(Labelled::getLabel).toList());
    }
}
