package com.banyan.lab.sdrs.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Where a job is in its lifecycle — the editorial half of whether it is
 * advertised.
 *
 * <p>It is only half, because {@link Job#getDeadline()} is the other. A job is
 * publicly visible when it is {@code OPEN} <em>and</em> its deadline has not
 * passed; see {@link Job#isPubliclyVisible()}. Nothing flips {@code OPEN} to
 * {@code CLOSED} when a deadline expires, deliberately — that would need a
 * scheduled sweep, and between the deadline and the sweep the database would be
 * advertising a role nobody can apply for. Deriving it in the query is never
 * stale and needs no scheduler.
 *
 * <p>So {@code CLOSED} means "we took it down", not "the date passed".
 */
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
