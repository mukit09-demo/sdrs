package com.banyan.lab.sdrs.entity;

import java.util.Arrays;

public interface Labelled {

    String getLabel();

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
