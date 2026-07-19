package com.cryptoscope.core.auth.security;

import com.cryptoscope.core.auth.session.SessionData;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUserProvider {

    public SessionData getCurrentSession() {
        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal()
                instanceof SessionData sessionData)) {
            throw new IllegalStateException(
                    "Authenticated session is not available"
            );
        }

        return sessionData;
    }

    public UUID getCurrentUserId() {
        return getCurrentSession().userId();
    }

    public String getCurrentUsername() {
        return getCurrentSession().username();
    }
}