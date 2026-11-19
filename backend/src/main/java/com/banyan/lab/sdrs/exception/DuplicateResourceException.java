package com.banyan.lab.sdrs.exception;

public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String resource, String id) {
        super("A %s with id \"%s\" already exists".formatted(resource, id));
    }
}
