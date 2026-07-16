package com.cryptoscope.core.market.scheduler;

import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.service.MarketPriceCacheService;
import com.cryptoscope.core.market.service.PriceHistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(
        name = "app.market.history.scheduling.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class PriceHistoryScheduler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    PriceHistoryScheduler.class
            );

    private final MarketPriceCacheService cacheService;
    private final PriceHistoryService priceHistoryService;

    public PriceHistoryScheduler(
            MarketPriceCacheService cacheService,
            PriceHistoryService priceHistoryService
    ) {
        this.cacheService = cacheService;
        this.priceHistoryService = priceHistoryService;

        LOGGER.info(
                "Price history scheduler was initialized"
        );
    }

    @Scheduled(
            fixedDelayString =
                    "${app.market.history.interval-ms:60000}",
            initialDelayString =
                    "${app.market.history.initial-delay-ms:5000}"
    )
    public void storePriceHistorySnapshot() {
        try {
            List<MarketPriceResponse> prices =
                    cacheService.getLatestPrices();

            priceHistoryService.storeSnapshot(
                    prices
            );

            LOGGER.info(
                    "Market price history snapshot was successfully stored"
            );

        } catch (RuntimeException exception) {
            LOGGER.warn(
                    "Failed to store market price history: {}",
                    exception.getMessage()
            );
        }
    }
}