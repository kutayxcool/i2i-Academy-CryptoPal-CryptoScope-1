package com.cryptoscope.core.user.repository;

import com.cryptoscope.core.user.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository
        extends JpaRepository<User, UUID> {

    boolean existsByUsernameIgnoreCase(
            String username
    );

    Optional<User> findByUsernameIgnoreCase(
            String username
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select user
            from User user
            where user.id = :userId
            """)
    Optional<User> findByIdForUpdate(
            @Param("userId") UUID userId
    );
}