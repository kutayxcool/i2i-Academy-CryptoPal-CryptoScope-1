package com.cryptoscope.core.ai;

import java.math.BigDecimal;

public class TransactionSummary {
    private String type;   // "BUY" veya "SELL"
    private String symbol;
    private BigDecimal amount;
    private BigDecimal price;

    public TransactionSummary(String type, String symbol, BigDecimal amount, BigDecimal price) {
        this.type = type;
        this.symbol = symbol;
        this.amount = amount;
        this.price = price;
    }

    @Override
    public String toString() {
        return type + " " + amount + " " + symbol + " @ " + price;
    }
}