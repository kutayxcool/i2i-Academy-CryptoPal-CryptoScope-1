package com.cryptoscope.core.trade.service;

import com.cryptoscope.core.auth.security.CurrentUserProvider;
import com.cryptoscope.core.trade.dto.TransactionResponse;
import com.cryptoscope.core.trade.entity.TradeTransaction;
import com.cryptoscope.core.trade.repository.TradeTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionHistoryService {

    private static final int MONEY_SCALE = 2;

    private final CurrentUserProvider currentUserProvider;
    private final TradeTransactionRepository transactionRepository;

    public TransactionHistoryService(
            CurrentUserProvider currentUserProvider,
            TradeTransactionRepository transactionRepository
    ) {
        this.currentUserProvider = currentUserProvider;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getCurrentUserTransactions() {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        return transactionRepository
                .findAllByUserIdOrderByExecutedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TransactionResponse toResponse(
            TradeTransaction transaction
    ) {
        BigDecimal total = transaction.getPrice()
                .multiply(transaction.getAmount())
                .setScale(
                        MONEY_SCALE,
                        RoundingMode.HALF_UP
                );

        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getSymbol(),
                transaction.getAmount(),
                transaction.getPrice(),
                total,
                transaction.getExecutedAt()
        );
    }
}