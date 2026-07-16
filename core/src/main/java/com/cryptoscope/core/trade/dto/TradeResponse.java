package com.cryptoscope.core.trade.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TradeResponse(
        UUID transactionId,
        String symbol,
        BigDecimal amount,
        BigDecimal price,
        BigDecimal newBalance
) {
}