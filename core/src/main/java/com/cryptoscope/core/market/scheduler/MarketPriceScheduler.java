package com.cryptoscope.core.market.scheduler;

import com.cryptoscope.core.market.service.MarketPriceCacheService;
import com.cryptoscope.core.marketdata.PriceFeed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.market.scheduling.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class MarketPriceScheduler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    MarketPriceScheduler.class
            );

    private final PriceFeed priceFeed;
    private final MarketPriceCacheService cacheService;

    public MarketPriceScheduler(
            PriceFeed priceFeed,
            MarketPriceCacheService cacheService
    ) {
        this.priceFeed = priceFeed;
        this.cacheService = cacheService;
    }

    @Scheduled(
            fixedDelayString =
                    "${app.market.refresh-interval-ms:15000}",
            initialDelayString =
                    "${app.market.initial-delay-ms:1000}"
    )
    public void refreshMarketPrices() {
        try {
            cacheService.storeLatestPrices(
                    priceFeed.getAllPrices()
            );

            LOGGER.info(
                    "Market prices were successfully refreshed"
            );

        } catch (RuntimeException exception) {
            LOGGER.warn(
                    "Failed to refresh market prices: {}",
                    exception.getMessage()
            );
        }
    }
}