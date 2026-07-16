package com.cryptoscope.core.market.repository;

import com.cryptoscope.core.market.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PriceHistoryRepository
        extends JpaRepository<PriceHistory, UUID> {
}