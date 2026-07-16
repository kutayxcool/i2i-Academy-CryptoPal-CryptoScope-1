package com.cryptoscope.core.common.exception;

public class UnsupportedAssetException
        extends RuntimeException {

    public UnsupportedAssetException(String symbol) {
        super("Unsupported market symbol: " + symbol);
    }
}