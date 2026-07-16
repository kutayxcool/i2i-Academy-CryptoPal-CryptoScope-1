package com.cryptoscope.core.marketdata;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BinancePriceFeed implements PriceFeed {

    private static final String BASE_URL = "https://api.binance.com/api/v3/ticker/price?symbol=";
    private final HttpClient client = HttpClient.newHttpClient();

    private static final Map<String, String> SYMBOL_MAP = Map.of(
            "BTC", "BTCUSDT",
            "ETH", "ETHUSDT"
    );

    @Override
    public BigDecimal getPrice(String symbol) {
        String binanceSymbol = SYMBOL_MAP.get(symbol.toUpperCase());
        if (binanceSymbol == null) {
            throw new IllegalArgumentException("Desteklenmeyen sembol: " + symbol);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + binanceSymbol))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            Pattern pattern = Pattern.compile("\"price\":\"([0-9.]+)\"");
            Matcher matcher = pattern.matcher(response.body());

            if (matcher.find()) {
                return new BigDecimal(matcher.group(1));
            } else {
                throw new RuntimeException("Fiyat bulunamadı, gelen yanıt: " + response.body());
            }
        } catch (Exception e) {
            throw new RuntimeException("Binance'ten fiyat alınamadı: " + symbol, e);
        }
    }

    @Override
    public Map<String, BigDecimal> getAllPrices() {
        Map<String, BigDecimal> prices = new HashMap<>();
        for (String symbol : SYMBOL_MAP.keySet()) {
            prices.put(symbol, getPrice(symbol));
        }
        return prices;
    }
}