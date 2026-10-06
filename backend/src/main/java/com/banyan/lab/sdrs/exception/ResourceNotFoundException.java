package com.banyan.lab.sdrs.exception;

/**
 * Nothing exists at that id.
 *
 * <p>Becomes a 404, which the front end's {@code apiRequestOrNull} turns into
 * {@code null} so a detail page can call {@code notFound()}. A missing resource
 * is a routing concern, not an error to surface.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String id) {
        super("No %s with id \"%s\"".formatted(resource, id));
    }
}
