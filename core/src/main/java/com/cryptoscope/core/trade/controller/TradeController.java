package com.cryptoscope.core.trade.controller;

import com.cryptoscope.core.trade.dto.TradeRequest;
import com.cryptoscope.core.trade.dto.TradeResponse;
import com.cryptoscope.core.trade.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(
            TradeService tradeService
    ) {
        this.tradeService = tradeService;
    }

    @PostMapping("/buy")
    public TradeResponse buy(
            @Valid @RequestBody TradeRequest request
    ) {
        return tradeService.buy(request);
    }
    @PostMapping("/sell")
    public TradeResponse sell(
            @Valid @RequestBody TradeRequest request
    ) {
        return tradeService.sell(request);
    }
}