package com.cryptoscope.core.agenda.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AgendaNoteResponse(
        UUID id,
        LocalDate noteDate,
        String title,
        String content,
        Instant createdAt,
        Instant updatedAt
) {
}