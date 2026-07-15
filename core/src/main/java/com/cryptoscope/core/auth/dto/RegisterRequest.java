package com.cryptoscope.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Kullanıcı adı")
        @Size(
                min = 3,
                max = 50,
                message = "Kullanıcı adı 3 ile 50 karakter arasında olmalıdır"
        )
        String username,

        @NotBlank(message = "Şifre")
        @Size(
                min = 8,
                max = 100,
                message = "Şifre en az 8 karakter olmalıdır"
        )
        String password
) {
}