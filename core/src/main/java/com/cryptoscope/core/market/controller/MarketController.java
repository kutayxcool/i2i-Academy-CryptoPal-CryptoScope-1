package com.cryptoscope.core.market.controller;

import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.service.MarketPriceCacheService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketPriceCacheService cacheService;

    public MarketController(
            MarketPriceCacheService cacheService
    ) {
        this.cacheService = cacheService;
    }

    @GetMapping("/prices")
    public List<MarketPriceResponse> getPrices() {
        return cacheService.getLatestPrices();
    }
}