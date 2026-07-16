package com.cryptoscope.core.trade.service;

import com.cryptoscope.core.auth.security.CurrentUserProvider;
import com.cryptoscope.core.common.exception.*;
import com.cryptoscope.core.market.dto.MarketPriceResponse;
import com.cryptoscope.core.market.service.MarketPriceCacheService;
import com.cryptoscope.core.portfolio.entity.Holding;
import com.cryptoscope.core.portfolio.repository.HoldingRepository;
import com.cryptoscope.core.trade.dto.TradeRequest;
import com.cryptoscope.core.trade.dto.TradeResponse;
import com.cryptoscope.core.trade.entity.TradeTransaction;
import com.cryptoscope.core.trade.entity.TransactionType;
import com.cryptoscope.core.trade.repository.TradeTransactionRepository;
import com.cryptoscope.core.user.entity.User;
import com.cryptoscope.core.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cryptoscope.core.common.exception.InsufficientAssetBalanceException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class TradeService {

    private static final Set<String> SUPPORTED_SYMBOLS =
            Set.of("BTC", "ETH");

    private static final int BALANCE_SCALE = 2;

    private final CurrentUserProvider currentUserProvider;
    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final TradeTransactionRepository transactionRepository;
    private final MarketPriceCacheService marketPriceCacheService;

    public TradeService(
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
        this.marketPriceCacheService = marketPriceCacheService;
    }

    @Transactional
    public TradeResponse buy(TradeRequest request) {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        String symbol =
                normalizeAndValidateSymbol(request.symbol());

        BigDecimal amount =
                validateAmount(request.amount());

        /*
         * The latest price is read from Redis.
         * Binance is not called directly during a trade.
         */
        MarketPriceResponse marketPrice =
                marketPriceCacheService.getLatestPrice(symbol);

        BigDecimal price = marketPrice.price();

        BigDecimal totalCost = price
                .multiply(amount)
                .setScale(
                        BALANCE_SCALE,
                        RoundingMode.HALF_UP
                );

        if (totalCost.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTradeAmountException(
                    "Trade total must be greater than zero"
            );
        }

        /*
         * PESSIMISTIC_WRITE prevents simultaneous operations
         * from spending the same balance.
         */
        User user = userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(UserNotFoundException::new);

        if (user.getBalance().compareTo(totalCost) < 0) {
            throw new InsufficientBalanceException();
        }

        BigDecimal newBalance = user.getBalance()
                .subtract(totalCost)
                .setScale(
                        BALANCE_SCALE,
                        RoundingMode.HALF_UP
                );

        user.setBalance(newBalance);

        Holding holding = holdingRepository
                .findByUserIdAndSymbolIgnoreCase(
                        userId,
                        symbol
                )
                .orElseGet(() -> new Holding(
                        user,
                        symbol,
                        BigDecimal.ZERO
                ));

        holding.setAmount(
                holding.getAmount().add(amount)
        );

        holdingRepository.save(holding);

        TradeTransaction transaction =
                transactionRepository.save(
                        new TradeTransaction(
                                user,
                                TransactionType.BUY,
                                symbol,
                                amount,
                                price
                        )
                );

        return new TradeResponse(
                transaction.getId(),
                symbol,
                amount,
                price,
                newBalance
        );
    }

    @Transactional
    public TradeResponse sell(TradeRequest request) {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        String symbol =
                normalizeAndValidateSymbol(request.symbol());

        BigDecimal amount =
                validateAmount(request.amount());

        /*
         * The latest market price is read from Redis.
         * Binance is not called directly during the sale.
         */
        MarketPriceResponse marketPrice =
                marketPriceCacheService.getLatestPrice(symbol);

        BigDecimal price = marketPrice.price();

        /*
         * The user row is locked before balance
         * and holding values are updated.
         */
        User user = userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(UserNotFoundException::new);

        Holding holding = holdingRepository
                .findByUserIdAndSymbolIgnoreCase(
                        userId,
                        symbol
                )
                .orElseThrow(
                        () -> new InsufficientAssetBalanceException(
                                symbol
                        )
                );

        if (holding.getAmount().compareTo(amount) < 0) {
            throw new InsufficientAssetBalanceException(
                    symbol
            );
        }

        BigDecimal totalProceeds = price
                .multiply(amount)
                .setScale(
                        BALANCE_SCALE,
                        RoundingMode.HALF_UP
                );

        if (totalProceeds.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTradeAmountException(
                    "Trade total must be greater than zero"
            );
        }

        BigDecimal newBalance = user.getBalance()
                .add(totalProceeds)
                .setScale(
                        BALANCE_SCALE,
                        RoundingMode.HALF_UP
                );

        user.setBalance(newBalance);

        BigDecimal remainingAmount =
                holding.getAmount().subtract(amount);

        if (remainingAmount.compareTo(BigDecimal.ZERO) == 0) {
            holdingRepository.delete(holding);
        } else {
            holding.setAmount(remainingAmount);
            holdingRepository.save(holding);
        }

        TradeTransaction transaction =
                transactionRepository.save(
                        new TradeTransaction(
                                user,
                                TransactionType.SELL,
                                symbol,
                                amount,
                                price
                        )
                );

        return new TradeResponse(
                transaction.getId(),
                symbol,
                amount,
                price,
                newBalance
        );
    }
    private String normalizeAndValidateSymbol(
            String symbol
    ) {
        String normalizedSymbol = symbol
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!SUPPORTED_SYMBOLS.contains(normalizedSymbol)) {
            throw new UnsupportedAssetException(
                    normalizedSymbol
            );
        }

        return normalizedSymbol;
    }

    private BigDecimal validateAmount(
            BigDecimal amount
    ) {
        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTradeAmountException(
                    "Trade amount must be greater than zero"
            );
        }

        return amount;
    }
}