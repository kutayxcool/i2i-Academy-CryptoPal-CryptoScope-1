package com.cryptoscope.core.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "first_name",
            nullable = false,
            length = 60
    )
    private String firstName;

    @Column(
            name = "last_name",
            nullable = false,
            length = 60
    )
    private String lastName;

    @Column(
            nullable = false,
            unique = true,
            length = 50
    )
    private String username;

    @Column(
            name = "password_hash",
            nullable = false,
            length = 255
    )
    private String passwordHash;

    @Column(
            nullable = false,
            precision = 18,
            scale = 2
    )
    private BigDecimal balance;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    public User(
            String firstName,
            String lastName,
            String username,
            String passwordHash,
            BigDecimal balance
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.passwordHash = passwordHash;
        this.balance = balance;
    }

    /*
     * Kept for compatibility with older tests or code.
     */
    public User(
            String username,
            String passwordHash,
            BigDecimal balance
    ) {
        this(
                username,
                "Member",
                username,
                passwordHash,
                balance
        );
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}