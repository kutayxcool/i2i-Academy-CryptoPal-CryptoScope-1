package com.cryptoscope.core.common.exception;

public class InvalidTradeAmountException
        extends RuntimeException {

    public InvalidTradeAmountException(String message) {
        super(message);
    }
}