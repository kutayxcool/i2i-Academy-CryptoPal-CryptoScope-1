package com.cryptoscope.core.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AgendaNoteRequest(

        @NotNull(
                message = "Note date must not be null"
        )
        LocalDate noteDate,

        @NotBlank(
                message = "Note title must not be blank"
        )
        @Size(
                max = 120,
                message = "Note title must not exceed 120 characters"
        )
        String title,

        @NotBlank(
                message = "Note content must not be blank"
        )
        @Size(
                max = 5000,
                message = "Note content must not exceed 5000 characters"
        )
        String content
) {
}