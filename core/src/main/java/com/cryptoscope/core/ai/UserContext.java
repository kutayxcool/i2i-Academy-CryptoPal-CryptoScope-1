package com.cryptoscope.core.ai;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class UserContext {
    private String username;
    private BigDecimal balance;
    private Map<String, BigDecimal> holdings;
    private List<TransactionSummary> recentTransactions;
    private Map<String, BigDecimal> currentPrices;

    public UserContext(String username, BigDecimal balance, Map<String, BigDecimal> holdings,
                        List<TransactionSummary> recentTransactions, Map<String, BigDecimal> currentPrices) {
        this.username = username;
        this.balance = balance;
        this.holdings = holdings;
        this.recentTransactions = recentTransactions;
        this.currentPrices = currentPrices;
    }

    public String getUsername() { return username; }
    public BigDecimal getBalance() { return balance; }
    public Map<String, BigDecimal> getHoldings() { return holdings; }
    public List<TransactionSummary> getRecentTransactions() { return recentTransactions; }
    public Map<String, BigDecimal> getCurrentPrices() { return currentPrices; }
}