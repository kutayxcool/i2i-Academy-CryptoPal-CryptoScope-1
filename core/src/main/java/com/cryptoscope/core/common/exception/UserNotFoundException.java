package com.cryptoscope.core.common.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException() {
        super("User account was not found");
    }
}