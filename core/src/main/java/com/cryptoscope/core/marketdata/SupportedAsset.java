package com.cryptoscope.core.marketdata;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public enum SupportedAsset {

    BTC("BTCUSDT"),
    ETH("ETHUSDT"),
    BNB("BNBUSDT"),
    SOL("SOLUSDT"),
    XRP("XRPUSDT"),
    ADA("ADAUSDT"),
    DOGE("DOGEUSDT"),
    AVAX("AVAXUSDT"),
    DOT("DOTUSDT"),
    LINK("LINKUSDT");

    private final String binanceSymbol;

    SupportedAsset(String binanceSymbol) {
        this.binanceSymbol = binanceSymbol;
    }

    public String getSymbol() {
        return name();
    }

    public String getBinanceSymbol() {
        return binanceSymbol;
    }

    public static boolean isSupported(
            String symbol
    ) {
        return findBySymbol(symbol).isPresent();
    }

    public static Optional<SupportedAsset> findBySymbol(
            String symbol
    ) {
        if (symbol == null || symbol.isBlank()) {
            return Optional.empty();
        }

        String normalizedSymbol = symbol
                .trim()
                .toUpperCase(Locale.ROOT);

        return Arrays.stream(values())
                .filter(asset ->
                        asset.getSymbol()
                                .equals(normalizedSymbol)
                )
                .findFirst();
    }

    public static Optional<SupportedAsset> findByBinanceSymbol(
            String binanceSymbol
    ) {
        if (
                binanceSymbol == null
                        || binanceSymbol.isBlank()
        ) {
            return Optional.empty();
        }

        String normalizedSymbol = binanceSymbol
                .trim()
                .toUpperCase(Locale.ROOT);

        return Arrays.stream(values())
                .filter(asset ->
                        asset.getBinanceSymbol()
                                .equals(normalizedSymbol)
                )
                .findFirst();
    }

    public static List<String> getSymbols() {
        return Arrays.stream(values())
                .map(SupportedAsset::getSymbol)
                .toList();
    }

    public static List<String> getBinanceSymbols() {
        return Arrays.stream(values())
                .map(
                        SupportedAsset::getBinanceSymbol
                )
                .toList();
    }
}