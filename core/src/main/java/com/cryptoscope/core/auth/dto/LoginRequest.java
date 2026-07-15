package com.cryptoscope.core.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "Username")
        String username,

        @NotBlank(message = "Password")
        String password

) {
}