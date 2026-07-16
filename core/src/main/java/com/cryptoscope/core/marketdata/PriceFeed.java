package com.cryptoscope.core.marketdata;

import java.math.BigDecimal;
import java.util.Map;

public interface PriceFeed {
    BigDecimal getPrice(String symbol);
    Map<String, BigDecimal> getAllPrices();
}