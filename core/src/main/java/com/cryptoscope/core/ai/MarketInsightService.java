package com.cryptoscope.core.ai;

public interface MarketInsightService {
    String generateInsight(UserContext context, String userQuestion);
}