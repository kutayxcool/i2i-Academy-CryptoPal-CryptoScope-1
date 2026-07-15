package com.cryptoscope.core.common.exception;

public class UsernameAlreadyExistsException extends RuntimeException {

    public UsernameAlreadyExistsException(String username) {
        super("'" + username + "' Username already exists!");
    }
}