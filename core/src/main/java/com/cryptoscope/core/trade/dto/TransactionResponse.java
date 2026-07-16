package com.cryptoscope.core.trade.dto;

import com.cryptoscope.core.trade.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        TransactionType type,
        String symbol,
        BigDecimal amount,
        BigDecimal price,
        BigDecimal total,
        Instant executedAt
) {
}