package com.cryptoscope.core.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@OpenAPIDefinition(
        info = @Info(
                title = "CryptoScope API",
                version = "1.0.0",
                description = """
                        REST API for CryptoScope.

                        The API provides authentication, live cryptocurrency
                        prices, virtual trading, portfolio management,
                        transaction history and AI-assisted portfolio analysis.
                        """
        ),
        servers = {
                @Server(
                        url = "http://localhost:8080",
                        description = "Local development server"
                )
        },
        tags = {
                @Tag(
                        name = "Authentication",
                        description = "User registration and login operations"
                ),
                @Tag(
                        name = "Market",
                        description = "Current cryptocurrency market prices"
                ),
                @Tag(
                        name = "Portfolio",
                        description = "Authenticated user portfolio operations"
                ),
                @Tag(
                        name = "Trades",
                        description = "Cryptocurrency buy and sell operations"
                ),
                @Tag(
                        name = "Transactions",
                        description = "Authenticated user transaction history"
                ),
                @Tag(
                        name = "AI Assistant",
                        description = "AI-assisted portfolio and market analysis"
                )
        }
)
@SecurityScheme(
        name = OpenApiConfig.BEARER_AUTH,
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "Session Token",
        description = """
                Enter the session token returned by POST /api/auth/login.

                Enter only the token value. Do not include the Bearer prefix.
                """
)
public class OpenApiConfig {

        public static final String BEARER_AUTH = "bearerAuth";
}