package com.cryptoscope.core.auth.session;

import com.cryptoscope.core.common.exception.SessionStorageException;
import com.cryptoscope.core.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_ID_FIELD = "userId";
    private static final String USERNAME_FIELD = "username";

    private final StringRedisTemplate redisTemplate;
    private final Duration sessionTtl;

    public SessionService(
            StringRedisTemplate redisTemplate,
            @Value("${app.session.ttl-seconds:86400}") long sessionTtlSeconds
    ) {
        if (sessionTtlSeconds <= 0) {
            throw new IllegalArgumentException(
                    "Session TTL must be greater than zero"
            );
        }

        this.redisTemplate = redisTemplate;
        this.sessionTtl = Duration.ofSeconds(sessionTtlSeconds);
    }

    public String createSession(User user) {
        String token = UUID.randomUUID().toString();
        String key = buildSessionKey(token);

        Map<String, String> sessionValues = Map.of(
                USER_ID_FIELD, user.getId().toString(),
                USERNAME_FIELD, user.getUsername()
        );

        try {
            redisTemplate.opsForHash().putAll(key, sessionValues);

            Boolean expirationConfigured = redisTemplate.expire(
                    key,
                    sessionTtl
            );

            if (!Boolean.TRUE.equals(expirationConfigured)) {
                redisTemplate.delete(key);

                throw new SessionStorageException(
                        "Failed to configure session expiration",
                        null
                );
            }

            return token;
        } catch (DataAccessException exception) {
            throw new SessionStorageException(
                    "Failed to create user session",
                    exception
            );
        }
    }

    public Optional<SessionData> findSession(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        String key = buildSessionKey(token);

        try {
            Object userIdValue = redisTemplate.opsForHash()
                    .get(key, USER_ID_FIELD);

            Object usernameValue = redisTemplate.opsForHash()
                    .get(key, USERNAME_FIELD);

            if (userIdValue == null || usernameValue == null) {
                return Optional.empty();
            }

            UUID userId = UUID.fromString(userIdValue.toString());

            return Optional.of(
                    new SessionData(
                            userId,
                            usernameValue.toString()
                    )
            );
        } catch (IllegalArgumentException exception) {
            redisTemplate.delete(key);
            return Optional.empty();
        } catch (DataAccessException exception) {
            throw new SessionStorageException(
                    "Failed to retrieve user session",
                    exception
            );
        }
    }

    public void deleteSession(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        try {
            redisTemplate.delete(buildSessionKey(token));
        } catch (DataAccessException exception) {
            throw new SessionStorageException(
                    "Failed to delete user session",
                    exception
            );
        }
    }

    private String buildSessionKey(String token) {
        return SESSION_KEY_PREFIX + token;
    }
}