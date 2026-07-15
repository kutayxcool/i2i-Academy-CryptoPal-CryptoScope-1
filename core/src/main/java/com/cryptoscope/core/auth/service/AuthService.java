package com.cryptoscope.core.auth.service;

import com.cryptoscope.core.user.entity.User;
import com.cryptoscope.core.auth.dto.RegisterRequest;
import com.cryptoscope.core.auth.dto.RegisterResponse;
import com.cryptoscope.core.common.exception.UsernameAlreadyExistsException;
import com.cryptoscope.core.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    private static final double MIN_INITIAL_BALANCE = 10_000.00;
    private static final double MAX_INITIAL_BALANCE = 50_000.00;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String username = request.username().trim();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new UsernameAlreadyExistsException(username);
        }

        String passwordHash = passwordEncoder.encode(request.password());
        BigDecimal initialBalance = generateInitialBalance();

        User user = new User(
                username,
                passwordHash,
                initialBalance
        );

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getBalance()
        );
    }

    private BigDecimal generateInitialBalance() {
        double randomBalance = ThreadLocalRandom.current().nextDouble(
                MIN_INITIAL_BALANCE,
                MAX_INITIAL_BALANCE
        );

        return BigDecimal.valueOf(randomBalance)
                .setScale(2, RoundingMode.HALF_UP);
    }
}