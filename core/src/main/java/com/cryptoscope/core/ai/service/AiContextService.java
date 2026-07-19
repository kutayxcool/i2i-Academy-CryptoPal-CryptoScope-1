package com.cryptoscope.core.ai.service;

import com.cryptoscope.core.ai.TransactionSummary;
import com.cryptoscope.core.ai.UserContext;
import com.cryptoscope.core.auth.security.CurrentUserProvider;
import com.cryptoscope.core.common.exception.UserNotFoundException;
import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.service.MarketPriceCacheService;
import com.cryptoscope.core.portfolio.entity.Holding;
import com.cryptoscope.core.portfolio.repository.HoldingRepository;
import com.cryptoscope.core.trade.entity.TradeTransaction;
import com.cryptoscope.core.trade.repository.TradeTransactionRepository;
import com.cryptoscope.core.user.entity.User;
import com.cryptoscope.core.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AiContextService {

    private final CurrentUserProvider currentUserProvider;
    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final TradeTransactionRepository transactionRepository;
    private final MarketPriceCacheService marketPriceCacheService;

    public AiContextService(
            CurrentUserProvider currentUserProvider,
            UserRepository userRepository,
            HoldingRepository holdingRepository,
            TradeTransactionRepository transactionRepository,
            MarketPriceCacheService marketPriceCacheService
    ) {
        this.currentUserProvider = currentUserProvider;
        this.userRepository = userRepository;
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.marketPriceCacheService =
                marketPriceCacheService;
    }

    @Transactional(readOnly = true)
    public UserContext buildCurrentUserContext() {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Map<String, BigDecimal> holdings =
                getHoldings(userId);

        List<TransactionSummary> recentTransactions =
                getRecentTransactions(userId);

        Map<String, BigDecimal> currentPrices =
                getCurrentPrices();

        return new UserContext(
                user.getUsername(),
                user.getBalance(),
                holdings,
                recentTransactions,
                currentPrices
        );
    }

    private Map<String, BigDecimal> getHoldings(
            UUID userId
    ) {
        return holdingRepository
                .findAllByUserIdOrderBySymbolAsc(userId)
                .stream()
                .collect(
                        Collectors.toMap(
                                Holding::getSymbol,
                                Holding::getAmount,
                                (first, second) -> first,
                                LinkedHashMap::new
                        )
                );
    }

    private List<TransactionSummary> getRecentTransactions(
            UUID userId
    ) {
        return transactionRepository
                .findTop10ByUserIdOrderByExecutedAtDesc(
                        userId
                )
                .stream()
                .map(this::toTransactionSummary)
                .toList();
    }

    private TransactionSummary toTransactionSummary(
            TradeTransaction transaction
    ) {
        return new TransactionSummary(
                transaction.getType().name(),
                transaction.getSymbol(),
                transaction.getAmount(),
                transaction.getPrice()
        );
    }

    private Map<String, BigDecimal> getCurrentPrices() {
        return marketPriceCacheService
                .getLatestPrices()
                .stream()
                .collect(
                        Collectors.toMap(
                                MarketPriceResponse::symbol,
                                MarketPriceResponse::price,
                                (first, second) -> first,
                                LinkedHashMap::new
                        )
                );
    }
}