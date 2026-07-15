package com.cryptoscope.core.auth.session;

import java.util.UUID;

public record SessionData(
        UUID userId,
        String username
) {
}