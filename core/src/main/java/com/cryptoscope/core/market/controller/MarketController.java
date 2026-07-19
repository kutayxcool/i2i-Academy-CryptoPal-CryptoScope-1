package com.cryptoscope.core.market.controller;

import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.service.MarketPriceCacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@Tag(
        name = "Market",
        description = "Current cryptocurrency market prices"
)
public class MarketController {

    private final MarketPriceCacheService cacheService;

    public MarketController(
            MarketPriceCacheService cacheService
    ) {
        this.cacheService = cacheService;
    }

    @Operation(
            summary = "Get current market prices",
            description = """
                    Returns the latest cached prices for all
                    supported cryptocurrency assets.
                    """
    )
    @GetMapping("/prices")
    public List<MarketPriceResponse> getPrices() {
        return cacheService.getLatestPrices();
    }
}