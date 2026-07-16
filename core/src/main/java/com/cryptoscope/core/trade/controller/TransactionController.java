package com.cryptoscope.core.trade.controller;

import com.cryptoscope.core.trade.dto.TransactionResponse;
import com.cryptoscope.core.trade.service.TransactionHistoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionHistoryService transactionHistoryService;

    public TransactionController(
            TransactionHistoryService transactionHistoryService
    ) {
        this.transactionHistoryService =
                transactionHistoryService;
    }

    @GetMapping
    public List<TransactionResponse> getTransactions() {
        return transactionHistoryService
                .getCurrentUserTransactions();
    }
}