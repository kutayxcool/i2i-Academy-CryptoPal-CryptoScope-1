package com.cryptoscope.core.market.service;

import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.entity.PriceHistory;
import com.cryptoscope.core.market.repository.PriceHistoryRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class PriceHistoryService {

    private final PriceHistoryRepository priceHistoryRepository;

    public PriceHistoryService(
            PriceHistoryRepository priceHistoryRepository
    ) {
        this.priceHistoryRepository =
                priceHistoryRepository;
    }

    @Transactional
    public void storeSnapshot(
            List<MarketPriceResponse> prices
    ) {
        if (prices == null || prices.isEmpty()) {
            throw new IllegalArgumentException(
                    "No market prices were provided for history storage"
            );
        }

        List<PriceHistory> historyEntries = prices
                .stream()
                .map(this::toEntity)
                .toList();

        try {
            priceHistoryRepository.saveAll(
                    historyEntries
            );
        } catch (DataAccessException exception) {
            throw new IllegalStateException(
                    "Failed to store market price history in PostgreSQL",
                    exception
            );
        }
    }

    private PriceHistory toEntity(
            MarketPriceResponse response
    ) {
        String symbol = normalizeSymbol(
                response.symbol()
        );

        BigDecimal price = response.price();

        if (price == null
                || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Market price must be greater than zero for symbol "
                            + symbol
            );
        }

        if (response.updatedAt() == null) {
            throw new IllegalArgumentException(
                    "Market price timestamp is required for symbol "
                            + symbol
            );
        }

        return new PriceHistory(
                symbol,
                price,
                response.updatedAt()
        );
    }

    private String normalizeSymbol(
            String symbol
    ) {
        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException(
                    "Market symbol must not be blank"
            );
        }

        return symbol.trim()
                .toUpperCase(Locale.ROOT);
    }
}