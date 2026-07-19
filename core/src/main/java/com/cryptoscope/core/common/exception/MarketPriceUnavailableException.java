package com.cryptoscope.core.common.exception;

public class MarketPriceUnavailableException
        extends RuntimeException {

    public MarketPriceUnavailableException(String message) {
        super(message);
    }

    public MarketPriceUnavailableException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}