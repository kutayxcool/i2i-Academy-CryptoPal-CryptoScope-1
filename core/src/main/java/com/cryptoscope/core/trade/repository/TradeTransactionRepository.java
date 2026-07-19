package com.cryptoscope.core.trade.repository;

import com.cryptoscope.core.trade.entity.TradeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TradeTransactionRepository
        extends JpaRepository<TradeTransaction, UUID> {

    List<TradeTransaction>
    findAllByUserIdOrderByExecutedAtAsc(
            UUID userId
    );

    List<TradeTransaction>
    findAllByUserIdOrderByExecutedAtDesc(
            UUID userId
    );

    List<TradeTransaction>
    findTop10ByUserIdOrderByExecutedAtDesc(
            UUID userId
    );
}