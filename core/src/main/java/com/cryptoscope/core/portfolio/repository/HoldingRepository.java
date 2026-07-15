package com.cryptoscope.core.portfolio.repository;

import com.cryptoscope.core.portfolio.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HoldingRepository
        extends JpaRepository<Holding, UUID> {

    List<Holding> findAllByUserIdOrderBySymbolAsc(UUID userId);

    Optional<Holding> findByUserIdAndSymbolIgnoreCase(
            UUID userId,
            String symbol
    );
}