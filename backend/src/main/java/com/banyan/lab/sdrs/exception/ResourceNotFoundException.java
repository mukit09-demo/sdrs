package com.banyan.lab.sdrs.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String id) {
        super("No %s with id \"%s\"".formatted(resource, id));
    }
}
