package com.cryptoscope.core.portfolio.dto;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioResponse(
        BigDecimal balance,
        BigDecimal cryptoInvestedValue,
        BigDecimal cryptoCurrentValue,
        BigDecimal cryptoProfitLossAmount,
        BigDecimal cryptoProfitLossPercentage,
        List<HoldingResponse> holdings
) {
}