package com.cryptoscope.core.ai;

import com.cryptoscope.core.common.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiMarketInsightService
        implements MarketInsightService {

    private static final String GENERATE_CONTENT_URL =
            "https://generativelanguage.googleapis.com/"
                    + "v1beta/models/%s:generateContent";

    private final JsonMapper jsonMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final Duration requestTimeout;

    public GeminiMarketInsightService(
            JsonMapper jsonMapper,

            @Value("${app.ai.gemini.api-key:}")
            String apiKey,

            @Value("${app.ai.gemini.model:gemini-3.5-flash}")
            String model,

            @Value("${app.ai.gemini.timeout-seconds:15}")
            long timeoutSeconds
    ) {
        if (timeoutSeconds <= 0) {
            throw new IllegalArgumentException(
                    "Gemini timeout must be greater than zero"
            );
        }

        this.jsonMapper = jsonMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.requestTimeout =
                Duration.ofSeconds(timeoutSeconds);

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(requestTimeout)
                .build();
    }

    @Override
    public String generateInsight(
            UserContext context,
            String userQuestion
    ) {
        validateConfiguration();

        String prompt = buildPrompt(
                context,
                userQuestion
        );

        String requestBody =
                createRequestBody(prompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(createEndpointUri())
                .timeout(requestTimeout)
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .header(
                        "x-goog-api-key",
                        apiKey
                )
                .POST(
                        HttpRequest.BodyPublishers
                                .ofString(requestBody)
                )
                .build();

        try {
            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            validateResponseStatus(response);

            return extractAnswer(
                    response.body()
            );

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new AiServiceException(
                    "Gemini request was interrupted",
                    exception
            );

        } catch (IOException exception) {
            throw new AiServiceException(
                    "Failed to connect to the Gemini service",
                    exception
            );
        }
    }

    private void validateConfiguration() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiServiceException(
                    "Gemini API key is not configured"
            );
        }

        if (model == null || model.isBlank()) {
            throw new AiServiceException(
                    "Gemini model is not configured"
            );
        }
    }

    private URI createEndpointUri() {
        return URI.create(
                GENERATE_CONTENT_URL.formatted(
                        model.trim()
                )
        );
    }

    private String createRequestBody(
            String prompt
    ) {
        Map<String, Object> requestBody = Map.of(
                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                prompt
                                        )
                                )
                        )
                )
        );

        try {
            return jsonMapper.writeValueAsString(
                    requestBody
            );

        } catch (JacksonException exception) {
            throw new AiServiceException(
                    "Failed to create the Gemini request",
                    exception
            );
        }
    }

    private void validateResponseStatus(
            HttpResponse<String> response
    ) {
        if (response.statusCode() < 200
                || response.statusCode() >= 300) {
            throw new AiServiceException(
                    "Gemini service returned an unsuccessful response"
            );
        }
    }

    private String extractAnswer(
            String responseBody
    ) {
        try {
            JsonNode root =
                    jsonMapper.readTree(responseBody);

            JsonNode textNode = root
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode()
                    || textNode.asText().isBlank()) {
                throw new AiServiceException(
                        "Gemini response did not contain an answer"
                );
            }

            return textNode.asText().trim();

        } catch (JacksonException exception) {
            throw new AiServiceException(
                    "Failed to parse the Gemini response",
                    exception
            );
        }
    }

    private String buildPrompt(
            UserContext context,
            String userQuestion
    ) {
        if (context == null) {
            throw new AiServiceException(
                    "User context is required"
            );
        }

        if (userQuestion == null
                || userQuestion.isBlank()) {
            throw new AiServiceException(
                    "User question must not be blank"
            );
        }

        return """
                You are the AI assistant of the CryptoScope application.

                Use only the supplied account and market information.
                Answer clearly and briefly.
                Answer in the same language as the user's question.
                Do not claim that future market movements are certain.
                Do not invent balances, holdings, transactions or prices.
                Do not expose implementation details or secret values.

                Username: %s
                Available USD balance: %s
                Holdings: %s
                Recent transactions: %s
                Current market prices: %s

                User question: %s
                """.formatted(
                context.getUsername(),
                context.getBalance(),
                context.getHoldings(),
                context.getRecentTransactions(),
                context.getCurrentPrices(),
                userQuestion.trim()
        );
    }
}