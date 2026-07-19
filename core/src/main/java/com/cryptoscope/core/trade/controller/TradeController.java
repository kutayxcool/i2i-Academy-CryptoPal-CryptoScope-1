package com.cryptoscope.core.trade.controller;

import com.cryptoscope.core.config.OpenApiConfig;
import com.cryptoscope.core.trade.dto.TradeRequest;
import com.cryptoscope.core.trade.dto.TradeResponse;
import com.cryptoscope.core.trade.service.TradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trades")
@Tag(
        name = "Trades",
        description = "Cryptocurrency buy and sell operations"
)
@SecurityRequirement(
        name = OpenApiConfig.BEARER_AUTH
)
public class TradeController {

    private final TradeService tradeService;

    public TradeController(
            TradeService tradeService
    ) {
        this.tradeService = tradeService;
    }

    @Operation(
            summary = "Buy cryptocurrency",
            description = """
                    Purchases cryptocurrency using the authenticated
                    user's available virtual cash balance.
                    """
    )
    @PostMapping("/buy")
    public TradeResponse buy(
            @Valid @RequestBody TradeRequest request
    ) {
        return tradeService.buy(request);
    }

    @Operation(
            summary = "Sell cryptocurrency",
            description = """
                    Sells cryptocurrency from the authenticated
                    user's current holdings.
                    """
    )
    @PostMapping("/sell")
    public TradeResponse sell(
            @Valid @RequestBody TradeRequest request
    ) {
        return tradeService.sell(request);
    }
}