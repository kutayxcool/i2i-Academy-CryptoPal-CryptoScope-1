package com.cryptoscope.core.common.exception;

public class InsufficientAssetBalanceException
        extends RuntimeException {

    public InsufficientAssetBalanceException(String symbol) {
        super(
                "Insufficient "
                        + symbol
                        + " balance to complete this sale"
        );
    }
}