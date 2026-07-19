package com.cryptoscope.core.auth.controller;

import com.cryptoscope.core.auth.dto.LoginRequest;
import com.cryptoscope.core.auth.dto.LoginResponse;
import com.cryptoscope.core.auth.dto.RegisterRequest;
import com.cryptoscope.core.auth.dto.RegisterResponse;
import com.cryptoscope.core.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(
        name = "Authentication",
        description = "User registration and login operations"
)
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

    @Operation(
            summary = "Register a new user",
            description = """
                    Creates a new CryptoScope account and assigns
                    a random virtual starting balance.
                    """
    )
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @Operation(
            summary = "Log in",
            description = """
                    Validates the supplied credentials and returns
                    a Redis-backed session token.
                    """
    )
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }
}