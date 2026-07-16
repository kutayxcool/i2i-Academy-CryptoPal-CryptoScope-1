package com.cryptoscope.core.marketdata;

import com.cryptoscope.core.common.exception.MarketDataProviderException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class BinancePriceFeed implements PriceFeed {

    private static final String BASE_URL =
            "https://api.binance.com/api/v3/ticker/price?symbol=";

    private static final Pattern PRICE_PATTERN =
            Pattern.compile("\"price\":\"([0-9.]+)\"");

    private static final Map<String, String> SYMBOL_MAP =
            Map.of(
                    "BTC", "BTCUSDT",
                    "ETH", "ETHUSDT"
            );

    private final HttpClient httpClient;

    public BinancePriceFeed() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public BigDecimal getPrice(String symbol) {
        String normalizedSymbol = normalizeSymbol(symbol);
        String binanceSymbol = SYMBOL_MAP.get(normalizedSymbol);

        if (binanceSymbol == null) {
            throw new MarketDataProviderException(
                    "Unsupported market symbol: "
                            + normalizedSymbol
            );
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + binanceSymbol))
                .timeout(Duration.ofSeconds(5))
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {
                throw new MarketDataProviderException(
                        "Binance returned HTTP status "
                                + response.statusCode()
                                + " for symbol "
                                + normalizedSymbol
                );
            }

            Matcher matcher =
                    PRICE_PATTERN.matcher(response.body());

            if (!matcher.find()) {
                throw new MarketDataProviderException(
                        "Price was not found in the Binance response for symbol "
                                + normalizedSymbol
                );
            }

            return new BigDecimal(matcher.group(1));

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new MarketDataProviderException(
                    "Binance price request was interrupted for symbol "
                            + normalizedSymbol,
                    exception
            );

        } catch (IOException exception) {
            throw new MarketDataProviderException(
                    "Failed to retrieve the Binance price for symbol "
                            + normalizedSymbol,
                    exception
            );
        }
    }

    @Override
    public Map<String, BigDecimal> getAllPrices() {
        Map<String, BigDecimal> prices =
                new LinkedHashMap<>();

        prices.put("BTC", getPrice("BTC"));
        prices.put("ETH", getPrice("ETH"));

        return prices;
    }

    private String normalizeSymbol(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new MarketDataProviderException(
                    "Market symbol must not be blank"
            );
        }

        return symbol.trim()
                .toUpperCase(Locale.ROOT);
    }
}