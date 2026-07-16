package com.cryptoscope.core.market.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "price_history",
        indexes = {
                @Index(
                        name = "idx_price_history_symbol_recorded_at",
                        columnList = "symbol, recorded_at"
                )
        }
)
@Getter
@NoArgsConstructor
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            nullable = false,
            length = 20
    )
    private String symbol;

    @Column(
            nullable = false,
            precision = 30,
            scale = 8
    )
    private BigDecimal price;

    @Column(
            name = "recorded_at",
            nullable = false,
            updatable = false
    )
    private Instant recordedAt;

    public PriceHistory(
            String symbol,
            BigDecimal price,
            Instant recordedAt
    ) {
        this.symbol = symbol;
        this.price = price;
        this.recordedAt = recordedAt;
    }
}