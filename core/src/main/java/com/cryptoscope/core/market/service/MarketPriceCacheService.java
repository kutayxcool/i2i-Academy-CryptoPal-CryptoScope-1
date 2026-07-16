package com.cryptoscope.core.market.service;

import com.cryptoscope.core.common.exception.MarketPriceUnavailableException;
import com.cryptoscope.core.market.dto.MarketPriceResponse;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class MarketPriceCacheService {

    private static final String MARKET_PRICES_KEY =
            "market:prices";

    private static final String VALUE_SEPARATOR = "|";

    private final HashOperations<String, String, String>
            hashOperations;

    public MarketPriceCacheService(
            StringRedisTemplate redisTemplate
    ) {
        this.hashOperations =
                redisTemplate.opsForHash();
    }

    public void storeLatestPrices(
            Map<String, BigDecimal> prices
    ) {
        if (prices == null || prices.isEmpty()) {
            throw new MarketPriceUnavailableException(
                    "No market prices were provided for caching"
            );
        }

        Instant updatedAt = Instant.now();

        try {
            prices.forEach((symbol, price) -> {
                validatePrice(symbol, price);

                String normalizedSymbol =
                        normalizeSymbol(symbol);

                String cachedValue = serializeValue(
                        price,
                        updatedAt
                );

                hashOperations.put(
                        MARKET_PRICES_KEY,
                        normalizedSymbol,
                        cachedValue
                );
            });

        } catch (DataAccessException exception) {
            throw new MarketPriceUnavailableException(
                    "Failed to store market prices in Redis",
                    exception
            );
        }
    }

    public List<MarketPriceResponse> getLatestPrices() {
        Map<String, String> cachedValues;

        try {
            cachedValues = hashOperations.entries(
                    MARKET_PRICES_KEY
            );
        } catch (DataAccessException exception) {
            throw new MarketPriceUnavailableException(
                    "Failed to retrieve market prices from Redis",
                    exception
            );
        }

        if (cachedValues == null || cachedValues.isEmpty()) {
            throw new MarketPriceUnavailableException(
                    "Current market prices are not available"
            );
        }

        return cachedValues.entrySet()
                .stream()
                .map(entry -> deserializeValue(
                        entry.getKey(),
                        entry.getValue()
                ))
                .sorted(
                        Comparator.comparing(
                                MarketPriceResponse::symbol
                        )
                )
                .toList();
    }

    public MarketPriceResponse getLatestPrice(
            String symbol
    ) {
        String normalizedSymbol =
                normalizeSymbol(symbol);

        String cachedValue;

        try {
            cachedValue = hashOperations.get(
                    MARKET_PRICES_KEY,
                    normalizedSymbol
            );
        } catch (DataAccessException exception) {
            throw new MarketPriceUnavailableException(
                    "Failed to retrieve the market price from Redis",
                    exception
            );
        }

        if (cachedValue == null || cachedValue.isBlank()) {
            throw new MarketPriceUnavailableException(
                    "Current market price is not available for symbol "
                            + normalizedSymbol
            );
        }

        return deserializeValue(
                normalizedSymbol,
                cachedValue
        );
    }

    private void validatePrice(
            String symbol,
            BigDecimal price
    ) {
        String normalizedSymbol =
                normalizeSymbol(symbol);

        if (price == null
                || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new MarketPriceUnavailableException(
                    "Market price must be greater than zero for symbol "
                            + normalizedSymbol
            );
        }
    }

    private String normalizeSymbol(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new MarketPriceUnavailableException(
                    "Market symbol must not be blank"
            );
        }

        return symbol.trim()
                .toUpperCase(Locale.ROOT);
    }

    private String serializeValue(
            BigDecimal price,
            Instant updatedAt
    ) {
        return price.toPlainString()
                + VALUE_SEPARATOR
                + updatedAt;
    }

    private MarketPriceResponse deserializeValue(
            String symbol,
            String cachedValue
    ) {
        String[] parts = cachedValue.split(
                "\\|",
                2
        );

        if (parts.length != 2) {
            throw new MarketPriceUnavailableException(
                    "Invalid cached market price format for symbol "
                            + symbol
            );
        }

        try {
            return new MarketPriceResponse(
                    symbol,
                    new BigDecimal(parts[0]),
                    Instant.parse(parts[1])
            );

        } catch (
                NumberFormatException
                | DateTimeParseException exception
        ) {
            throw new MarketPriceUnavailableException(
                    "Invalid cached market price value for symbol "
                            + symbol,
                    exception
            );
        }
    }
}