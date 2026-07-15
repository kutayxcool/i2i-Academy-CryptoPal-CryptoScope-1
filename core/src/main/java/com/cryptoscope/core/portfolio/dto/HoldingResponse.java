package com.cryptoscope.core.portfolio.dto;

import java.math.BigDecimal;

public record HoldingResponse(
        String symbol,
        BigDecimal amount
) {
}