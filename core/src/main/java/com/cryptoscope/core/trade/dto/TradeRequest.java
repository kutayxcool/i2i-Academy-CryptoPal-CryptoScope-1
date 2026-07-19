package com.cryptoscope.core.trade.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TradeRequest(

        @NotBlank(message = "Symbol is required")
        String symbol,

        @NotNull(message = "Amount is required")
        @DecimalMin(
                value = "0.000000000001",
                inclusive = true,
                message = "Amount must be greater than zero"
        )
        @Digits(
                integer = 18,
                fraction = 12,
                message = "Amount must have at most 18 integer digits and 12 decimal places"
        )
        BigDecimal amount
) {
}