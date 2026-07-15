package com.cryptoscope.core.auth.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LoginResponse(
        String token,
        UUID userId,
        String username,
        BigDecimal balance
) {
}