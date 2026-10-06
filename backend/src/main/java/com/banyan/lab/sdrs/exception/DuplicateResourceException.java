package com.banyan.lab.sdrs.exception;

/**
 * Something already exists at that id.
 *
 * <p>Becomes a 409. This matters more than it looks: {@code upsert()} in
 * {@code packages/shared/content/http.repository.ts} asks whether an id is
 * taken and then chooses POST or PUT. If POST quietly replaced an existing
 * article, a race between two editors would lose one of them silently.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String resource, String id) {
        super("A %s with id \"%s\" already exists".formatted(resource, id));
    }
}
