package com.cryptoscope.core.portfolio.dto;

import java.math.BigDecimal;

public record HoldingResponse(
        String symbol,
        BigDecimal amount,
        BigDecimal averageBuyPrice,
        BigDecimal currentPrice,
        BigDecimal investedValue,
        BigDecimal currentValue,
        BigDecimal profitLossAmount,
        BigDecimal profitLossPercentage
) {
}