package com.cryptoscope.core.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiChatRequest(

        @NotBlank(message = "Question is required")
        @Size(
                max = 1000,
                message = "Question must not exceed 1000 characters"
        )
        String question
) {
}