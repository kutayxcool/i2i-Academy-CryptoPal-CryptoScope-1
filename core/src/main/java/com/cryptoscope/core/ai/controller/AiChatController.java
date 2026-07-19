package com.cryptoscope.core.ai.controller;

import com.cryptoscope.core.ai.dto.AiChatRequest;
import com.cryptoscope.core.ai.dto.AiChatResponse;
import com.cryptoscope.core.ai.service.AiChatService;
import com.cryptoscope.core.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@Tag(
        name = "AI Assistant",
        description = "AI-assisted portfolio and market analysis"
)
@SecurityRequirement(
        name = OpenApiConfig.BEARER_AUTH
)
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(
            AiChatService aiChatService
    ) {
        this.aiChatService = aiChatService;
    }

    @Operation(
            summary = "Ask the AI assistant",
            description = """
                    Sends a question to the AI assistant using the
                    authenticated user's portfolio, cash balance,
                    transactions and current market prices.
                    """
    )
    @PostMapping("/chat")
    public AiChatResponse chat(
            @Valid @RequestBody AiChatRequest request
    ) {
        return aiChatService.chat(request);
    }
}