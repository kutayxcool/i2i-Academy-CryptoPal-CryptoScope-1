package com.cryptoscope.core.portfolio.service;

import com.cryptoscope.core.auth.security.CurrentUserProvider;
import com.cryptoscope.core.common.exception.UserNotFoundException;
import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.service.MarketPriceCacheService;
import com.cryptoscope.core.portfolio.dto.HoldingResponse;
import com.cryptoscope.core.portfolio.dto.PortfolioResponse;
import com.cryptoscope.core.portfolio.entity.Holding;
import com.cryptoscope.core.portfolio.repository.HoldingRepository;
import com.cryptoscope.core.trade.entity.TradeTransaction;
import com.cryptoscope.core.trade.entity.TransactionType;
import com.cryptoscope.core.trade.repository.TradeTransactionRepository;
import com.cryptoscope.core.user.entity.User;
import com.cryptoscope.core.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class PortfolioService {

    private static final int MONEY_SCALE = 2;
    private static final int PRICE_SCALE = 8;
    private static final int PERCENTAGE_SCALE = 4;
    private static final int INTERNAL_SCALE = 16;

    private static final BigDecimal HUNDRED =
            new BigDecimal("100");

    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final TradeTransactionRepository transactionRepository;
    private final MarketPriceCacheService marketPriceCacheService;
    private final CurrentUserProvider currentUserProvider;

    public PortfolioService(
            UserRepository userRepository,
            HoldingRepository holdingRepository,
            TradeTransactionRepository transactionRepository,
            MarketPriceCacheService marketPriceCacheService,
            CurrentUserProvider currentUserProvider
    ) {
        this.userRepository = userRepository;
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
        this.marketPriceCacheService = marketPriceCacheService;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getCurrentPortfolio() {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        List<TradeTransaction> transactions =
                transactionRepository
                        .findAllByUserIdOrderByExecutedAtAsc(
                                userId
                        );

        Map<String, CostPosition> costPositions =
                calculateCostPositions(transactions);

        List<HoldingResponse> holdings =
                holdingRepository
                        .findAllByUserIdOrderBySymbolAsc(
                                userId
                        )
                        .stream()
                        .map(holding ->
                                createHoldingResponse(
                                        holding,
                                        costPositions
                                )
                        )
                        .toList();

        BigDecimal cryptoInvestedValue =
                holdings.stream()
                        .map(HoldingResponse::investedValue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                MONEY_SCALE,
                                RoundingMode.HALF_UP
                        );

        BigDecimal cryptoCurrentValue =
                holdings.stream()
                        .map(HoldingResponse::currentValue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                MONEY_SCALE,
                                RoundingMode.HALF_UP
                        );

        BigDecimal cryptoProfitLossAmount =
                cryptoCurrentValue
                        .subtract(cryptoInvestedValue)
                        .setScale(
                                MONEY_SCALE,
                                RoundingMode.HALF_UP
                        );

        BigDecimal cryptoProfitLossPercentage =
                calculatePercentage(
                        cryptoProfitLossAmount,
                        cryptoInvestedValue
                );

        return new PortfolioResponse(
                user.getBalance(),
                cryptoInvestedValue,
                cryptoCurrentValue,
                cryptoProfitLossAmount,
                cryptoProfitLossPercentage,
                holdings
        );
    }

    private HoldingResponse createHoldingResponse(
            Holding holding,
            Map<String, CostPosition> costPositions
    ) {
        String symbol =
                normalizeSymbol(
                        holding.getSymbol()
                );

        BigDecimal amount =
                holding.getAmount();

        CostPosition costPosition =
                costPositions.get(symbol);

        BigDecimal averageBuyPrice =
                costPosition == null
                        ? zeroWithScale(PRICE_SCALE)
                        : costPosition
                        .getAverageBuyPrice();

        BigDecimal investedValue =
                toMoney(
                        amount.multiply(
                                averageBuyPrice
                        )
                );

        MarketPriceResponse marketPrice =
                marketPriceCacheService
                        .getLatestPrice(symbol);

        BigDecimal currentPrice =
                marketPrice.price()
                        .setScale(
                                PRICE_SCALE,
                                RoundingMode.HALF_UP
                        );

        BigDecimal currentValue =
                toMoney(
                        amount.multiply(
                                currentPrice
                        )
                );

        boolean hasCostBasis =
                investedValue.compareTo(
                        BigDecimal.ZERO
                ) > 0;

        BigDecimal profitLossAmount =
                hasCostBasis
                        ? currentValue
                        .subtract(investedValue)
                        .setScale(
                                MONEY_SCALE,
                                RoundingMode.HALF_UP
                        )
                        : zeroWithScale(MONEY_SCALE);

        BigDecimal profitLossPercentage =
                hasCostBasis
                        ? calculatePercentage(
                        profitLossAmount,
                        investedValue
                )
                        : zeroWithScale(
                        PERCENTAGE_SCALE
                );

        return new HoldingResponse(
                symbol,
                amount,
                averageBuyPrice,
                currentPrice,
                investedValue,
                currentValue,
                profitLossAmount,
                profitLossPercentage
        );
    }

    private Map<String, CostPosition>
    calculateCostPositions(
            List<TradeTransaction> transactions
    ) {
        Map<String, CostPosition> positions =
                new HashMap<>();

        for (TradeTransaction transaction
                : transactions) {

            String symbol =
                    normalizeSymbol(
                            transaction.getSymbol()
                    );

            CostPosition position =
                    positions.computeIfAbsent(
                            symbol,
                            ignored ->
                                    new CostPosition()
                    );

            if (transaction.getType()
                    == TransactionType.BUY) {

                position.applyBuy(
                        transaction.getAmount(),
                        transaction.getPrice()
                );

            } else if (transaction.getType()
                    == TransactionType.SELL) {

                position.applySell(
                        transaction.getAmount()
                );
            }
        }

        return positions;
    }

    private BigDecimal calculatePercentage(
            BigDecimal difference,
            BigDecimal baseValue
    ) {
        if (baseValue == null
                || baseValue.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            return zeroWithScale(
                    PERCENTAGE_SCALE
            );
        }

        return difference
                .multiply(HUNDRED)
                .divide(
                        baseValue,
                        PERCENTAGE_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    private BigDecimal toMoney(
            BigDecimal value
    ) {
        return value.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal zeroWithScale(
            int scale
    ) {
        return BigDecimal.ZERO
                .setScale(scale);
    }

    private String normalizeSymbol(
            String symbol
    ) {
        return symbol.trim()
                .toUpperCase(Locale.ROOT);
    }

    private static final class CostPosition {

        private BigDecimal amount =
                BigDecimal.ZERO;

        private BigDecimal costBasis =
                BigDecimal.ZERO;

        private void applyBuy(
                BigDecimal purchasedAmount,
                BigDecimal purchasePrice
        ) {
            if (purchasedAmount == null
                    || purchasePrice == null
                    || purchasedAmount.compareTo(
                    BigDecimal.ZERO
            ) <= 0
                    || purchasePrice.compareTo(
                    BigDecimal.ZERO
            ) <= 0) {
                return;
            }

            BigDecimal purchaseCost =
                    purchasedAmount.multiply(
                            purchasePrice
                    );

            amount = amount.add(
                    purchasedAmount
            );

            costBasis = costBasis.add(
                    purchaseCost
            );
        }

        private void applySell(
                BigDecimal soldAmount
        ) {
            if (soldAmount == null
                    || soldAmount.compareTo(
                    BigDecimal.ZERO
            ) <= 0
                    || amount.compareTo(
                    BigDecimal.ZERO
            ) <= 0) {
                return;
            }

            BigDecimal removableAmount =
                    soldAmount.min(amount);

            BigDecimal averageBuyPrice =
                    costBasis.divide(
                            amount,
                            INTERNAL_SCALE,
                            RoundingMode.HALF_UP
                    );

            BigDecimal removedCost =
                    averageBuyPrice.multiply(
                            removableAmount
                    );

            amount = amount.subtract(
                    removableAmount
            );

            costBasis = costBasis.subtract(
                    removedCost
            );

            if (amount.compareTo(
                    BigDecimal.ZERO
            ) == 0) {
                amount = BigDecimal.ZERO;
                costBasis = BigDecimal.ZERO;
            } else if (costBasis.compareTo(
                    BigDecimal.ZERO
            ) < 0) {
                costBasis = BigDecimal.ZERO;
            }
        }

        private BigDecimal getAverageBuyPrice() {
            if (amount.compareTo(
                    BigDecimal.ZERO
            ) <= 0
                    || costBasis.compareTo(
                    BigDecimal.ZERO
            ) <= 0) {
                return BigDecimal.ZERO
                        .setScale(PRICE_SCALE);
            }

            return costBasis.divide(
                    amount,
                    PRICE_SCALE,
                    RoundingMode.HALF_UP
            );
        }
    }
}