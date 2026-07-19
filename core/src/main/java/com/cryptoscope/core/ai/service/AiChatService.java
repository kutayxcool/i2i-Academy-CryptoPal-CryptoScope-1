package com.cryptoscope.core.ai.service;

import com.cryptoscope.core.ai.MarketInsightService;
import com.cryptoscope.core.ai.UserContext;
import com.cryptoscope.core.ai.dto.AiChatRequest;
import com.cryptoscope.core.ai.dto.AiChatResponse;
import com.cryptoscope.core.common.exception.AiServiceException;
import org.springframework.stereotype.Service;

@Service
public class AiChatService {

    private final AiContextService aiContextService;
    private final MarketInsightService marketInsightService;

    public AiChatService(
            AiContextService aiContextService,
            MarketInsightService marketInsightService
    ) {
        this.aiContextService = aiContextService;
        this.marketInsightService =
                marketInsightService;
    }

    public AiChatResponse chat(
            AiChatRequest request
    ) {
        UserContext context =
                aiContextService.buildCurrentUserContext();

        String answer =
                marketInsightService.generateInsight(
                        context,
                        request.question().trim()
                );

        if (answer == null || answer.isBlank()) {
            throw new AiServiceException(
                    "AI service returned an empty answer"
            );
        }

        return new AiChatResponse(answer);
    }
}