package com.cryptoscope.core.trade.entity;

import com.cryptoscope.core.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class TradeTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 4
    )
    private TransactionType type;

    @Column(
            nullable = false,
            length = 20
    )
    private String symbol;

    @Column(
            nullable = false,
            precision = 30,
            scale = 12
    )
    private BigDecimal amount;

    @Column(
            nullable = false,
            precision = 30,
            scale = 8
    )
    private BigDecimal price;

    @Column(
            name = "executed_at",
            nullable = false,
            updatable = false
    )
    private Instant executedAt;

    public TradeTransaction(
            User user,
            TransactionType type,
            String symbol,
            BigDecimal amount,
            BigDecimal price
    ) {
        this.user = user;
        this.type = type;
        this.symbol = symbol;
        this.amount = amount;
        this.price = price;
    }

    @PrePersist
    public void prePersist() {
        if (executedAt == null) {
            executedAt = Instant.now();
        }
    }
}