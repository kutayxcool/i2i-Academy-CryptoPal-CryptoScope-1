package com.cryptoscope.core.auth.security;

import com.cryptoscope.core.auth.session.SessionData;
import com.cryptoscope.core.auth.session.SessionService;
import com.cryptoscope.core.common.exception.SessionStorageException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private static final String SESSION_UNAVAILABLE_RESPONSE = """
            {
              "error": {
                "code": "SESSION_SERVICE_UNAVAILABLE",
                "message": "Session service is temporarily unavailable"
              }
            }
            """;

    private final SessionService sessionService;

    public SessionAuthenticationFilter(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<String> token = resolveBearerToken(request);

            if (token.isPresent()) {
                try {
                    sessionService.findSession(token.get())
                            .ifPresent(sessionData ->
                                    authenticateRequest(
                                            request,
                                            sessionData
                                    )
                            );
                } catch (SessionStorageException exception) {
                    writeSessionUnavailableResponse(response);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> resolveBearerToken(
            HttpServletRequest request
    ) {
        String authorizationHeader = request.getHeader(
                HttpHeaders.AUTHORIZATION
        );

        if (authorizationHeader == null
                || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return Optional.empty();
        }

        String token = authorizationHeader
                .substring(BEARER_PREFIX.length())
                .trim();

        if (token.isBlank()) {
            return Optional.empty();
        }

        return Optional.of(token);
    }

    private void authenticateRequest(
            HttpServletRequest request,
            SessionData sessionData
    ) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        sessionData,
                        null,
                        List.of()
                );

        authentication.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(request)
        );

        SecurityContext securityContext =
                SecurityContextHolder.createEmptyContext();

        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    private void writeSessionUnavailableResponse(
            HttpServletResponse response
    ) throws IOException {
        response.setStatus(
                HttpServletResponse.SC_SERVICE_UNAVAILABLE
        );
        response.setCharacterEncoding(
                StandardCharsets.UTF_8.name()
        );
        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );
        response.getWriter().write(
                SESSION_UNAVAILABLE_RESPONSE
        );
    }
}