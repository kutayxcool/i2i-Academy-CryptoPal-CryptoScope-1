package com.cryptoscope.core.auth.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RegisterResponse(
        UUID userId,
        String firstName,
        String lastName,
        String username,
        BigDecimal balance
) {
}