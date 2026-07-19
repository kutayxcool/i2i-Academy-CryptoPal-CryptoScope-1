package com.cryptoscope.core.common.exception;

public class InsufficientBalanceException
        extends RuntimeException {

    public InsufficientBalanceException() {
        super("Insufficient balance to complete this purchase");
    }
}