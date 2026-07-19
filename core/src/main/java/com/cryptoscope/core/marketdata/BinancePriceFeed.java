package com.cryptoscope.core.marketdata;

import com.cryptoscope.core.common.exception.MarketDataProviderException;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class BinancePriceFeed implements PriceFeed {

    private static final String PRICE_URL =
            "https://api.binance.com/api/v3/ticker/price";

    private static final Duration REQUEST_TIMEOUT =
            Duration.ofSeconds(5);

    private final JsonMapper jsonMapper;
    private final HttpClient httpClient;

    public BinancePriceFeed(
            JsonMapper jsonMapper
    ) {
        this.jsonMapper = jsonMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
    }

    @Override
    public BigDecimal getPrice(
            String symbol
    ) {
        SupportedAsset asset =
                SupportedAsset.findBySymbol(symbol)
                        .orElseThrow(
                                () ->
                                        new MarketDataProviderException(
                                                "Unsupported market symbol: "
                                                        + normalizeForMessage(
                                                        symbol
                                                )
                                        )
                        );

        Map<String, BigDecimal> prices =
                fetchPrices(List.of(asset));

        BigDecimal price =
                prices.get(asset.getSymbol());

        if (price == null) {
            throw new MarketDataProviderException(
                    "Price was not returned for symbol "
                            + asset.getSymbol()
            );
        }

        return price;
    }

    @Override
    public Map<String, BigDecimal> getAllPrices() {
        return fetchPrices(
                Arrays.asList(
                        SupportedAsset.values()
                )
        );
    }

    private Map<String, BigDecimal> fetchPrices(
            Collection<SupportedAsset> assets
    ) {
        if (assets == null || assets.isEmpty()) {
            throw new MarketDataProviderException(
                    "At least one market symbol is required"
            );
        }

        URI requestUri =
                createRequestUri(assets);

        HttpRequest request =
                HttpRequest.newBuilder()
                        .uri(requestUri)
                        .timeout(REQUEST_TIMEOUT)
                        .header(
                                "Accept",
                                "application/json"
                        )
                        .GET()
                        .build();

        try {
            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers
                                    .ofString()
                    );

            validateResponseStatus(response);

            return parsePrices(
                    response.body(),
                    assets
            );

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new MarketDataProviderException(
                    "Binance price request was interrupted",
                    exception
            );

        } catch (IOException exception) {
            throw new MarketDataProviderException(
                    "Failed to retrieve prices from Binance",
                    exception
            );
        }
    }

    private URI createRequestUri(
            Collection<SupportedAsset> assets
    ) {
        List<String> binanceSymbols =
                assets.stream()
                        .map(
                                SupportedAsset
                                        ::getBinanceSymbol
                        )
                        .toList();

        try {
            String symbolsJson =
                    jsonMapper.writeValueAsString(
                            binanceSymbols
                    );

            String encodedSymbols =
                    URLEncoder.encode(
                            symbolsJson,
                            StandardCharsets.UTF_8
                    );

            return URI.create(
                    PRICE_URL
                            + "?symbols="
                            + encodedSymbols
            );

        } catch (JacksonException exception) {
            throw new MarketDataProviderException(
                    "Failed to create the Binance price request",
                    exception
            );
        }
    }

    private void validateResponseStatus(
            HttpResponse<String> response
    ) {
        if (
                response.statusCode() < 200
                        || response.statusCode() >= 300
        ) {
            throw new MarketDataProviderException(
                    "Binance returned HTTP status "
                            + response.statusCode()
            );
        }
    }

    private Map<String, BigDecimal> parsePrices(
            String responseBody,
            Collection<SupportedAsset> expectedAssets
    ) {
        try {
            JsonNode root =
                    jsonMapper.readTree(
                            responseBody
                    );

            if (!root.isArray()) {
                throw new MarketDataProviderException(
                        "Binance price response must be an array"
                );
            }

            Map<String, BigDecimal> prices =
                    new LinkedHashMap<>();

            for (JsonNode priceNode : root) {
                String binanceSymbol =
                        priceNode
                                .path("symbol")
                                .asText();

                String priceText =
                        priceNode
                                .path("price")
                                .asText();

                SupportedAsset
                        .findByBinanceSymbol(
                                binanceSymbol
                        )
                        .ifPresent(asset -> {
                            if (
                                    priceText == null
                                            || priceText.isBlank()
                            ) {
                                throw new MarketDataProviderException(
                                        "Price was not returned for symbol "
                                                + asset.getSymbol()
                                );
                            }

                            BigDecimal price =
                                    new BigDecimal(
                                            priceText
                                    );

                            if (
                                    price.compareTo(
                                            BigDecimal.ZERO
                                    ) <= 0
                            ) {
                                throw new MarketDataProviderException(
                                        "Market price must be greater than zero for symbol "
                                                + asset.getSymbol()
                                );
                            }

                            prices.put(
                                    asset.getSymbol(),
                                    price
                            );
                        });
            }

            validateMissingPrices(
                    prices,
                    expectedAssets
            );

            return prices;

        } catch (JacksonException exception) {
            throw new MarketDataProviderException(
                    "Failed to parse the Binance price response",
                    exception
            );

        } catch (NumberFormatException exception) {
            throw new MarketDataProviderException(
                    "Binance returned an invalid market price",
                    exception
            );
        }
    }

    private void validateMissingPrices(
            Map<String, BigDecimal> prices,
            Collection<SupportedAsset> expectedAssets
    ) {
        List<String> missingSymbols =
                expectedAssets.stream()
                        .map(
                                SupportedAsset::getSymbol
                        )
                        .filter(
                                symbol ->
                                        !prices.containsKey(
                                                symbol
                                        )
                        )
                        .toList();

        if (!missingSymbols.isEmpty()) {
            throw new MarketDataProviderException(
                    "Binance did not return prices for symbols: "
                            + missingSymbols.stream()
                            .collect(
                                    Collectors.joining(", ")
                            )
            );
        }
    }

    private String normalizeForMessage(
            String symbol
    ) {
        if (symbol == null) {
            return "null";
        }

        return symbol.trim()
                .toUpperCase();
    }
}