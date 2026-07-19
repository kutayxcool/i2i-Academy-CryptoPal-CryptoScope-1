package com.cryptoscope.core.portfolio.controller;

import com.cryptoscope.core.config.OpenApiConfig;
import com.cryptoscope.core.portfolio.dto.PortfolioResponse;
import com.cryptoscope.core.portfolio.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@Tag(
        name = "Portfolio",
        description = "Authenticated user portfolio operations"
)
@SecurityRequirement(
        name = OpenApiConfig.BEARER_AUTH
)
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(
            PortfolioService portfolioService
    ) {
        this.portfolioService = portfolioService;
    }

    @Operation(
            summary = "Get current portfolio",
            description = """
                    Returns the authenticated user's cash balance
                    and cryptocurrency holdings.
                    """
    )
    @GetMapping
    public PortfolioResponse getPortfolio() {
        return portfolioService.getCurrentPortfolio();
    }
}