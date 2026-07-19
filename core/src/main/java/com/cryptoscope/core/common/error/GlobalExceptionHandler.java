package com.cryptoscope.core.common.error;

import com.cryptoscope.core.common.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.cryptoscope.core.common.exception.MarketPriceUnavailableException;
import com.cryptoscope.core.common.exception.InsufficientBalanceException;
import com.cryptoscope.core.common.exception.InvalidTradeAmountException;
import com.cryptoscope.core.common.exception.UnsupportedAssetException;
import com.cryptoscope.core.common.exception.InsufficientAssetBalanceException;
import com.cryptoscope.core.common.exception.AiServiceException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleUsernameAlreadyExists(
            UsernameAlreadyExistsException exception
    ) {
        return ApiErrorResponse.of(
                "USERNAME_ALREADY_EXISTS",
                exception.getMessage()
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiErrorResponse handleInvalidCredentials(
            InvalidCredentialsException exception
    ) {
        return ApiErrorResponse.of(
                "INVALID_CREDENTIALS",
                exception.getMessage()
        );
    }

    @ExceptionHandler(SessionStorageException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ApiErrorResponse handleSessionStorage(
            SessionStorageException exception
    ) {
        return ApiErrorResponse.of(
                "SESSION_SERVICE_UNAVAILABLE",
                "Session service is temporarily unavailable"
        );
    }
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleUserNotFound(
            UserNotFoundException exception
    ) {
        return ApiErrorResponse.of(
                "USER_NOT_FOUND",
                exception.getMessage()
        );
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleValidation(
            MethodArgumentNotValidException exception
    ) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(fieldError -> fieldError.getDefaultMessage())
                .orElse("Invalid request");

        return ApiErrorResponse.of(
                "VALIDATION_ERROR",
                message
        );
    }
    @ExceptionHandler(MarketPriceUnavailableException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ApiErrorResponse handleMarketPriceUnavailable(
            MarketPriceUnavailableException exception
    ) {
        return ApiErrorResponse.of(
                "MARKET_PRICES_UNAVAILABLE",
                exception.getMessage()
        );
    }
    @ExceptionHandler(InsufficientBalanceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleInsufficientBalance(
            InsufficientBalanceException exception
    ) {
        return ApiErrorResponse.of(
                "INSUFFICIENT_BALANCE",
                exception.getMessage()
        );
    }

    @ExceptionHandler(UnsupportedAssetException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleUnsupportedAsset(
            UnsupportedAssetException exception
    ) {
        return ApiErrorResponse.of(
                "UNSUPPORTED_ASSET",
                exception.getMessage()
        );
    }

    @ExceptionHandler(InvalidTradeAmountException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleInvalidTradeAmount(
            InvalidTradeAmountException exception
    ) {
        return ApiErrorResponse.of(
                "INVALID_TRADE_AMOUNT",
                exception.getMessage()
        );
    }
    @ExceptionHandler(InsufficientAssetBalanceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleInsufficientAssetBalance(
            InsufficientAssetBalanceException exception
    ) {
        return ApiErrorResponse.of(
                "INSUFFICIENT_ASSET_BALANCE",
                exception.getMessage()
        );
    }
    @ExceptionHandler(AiServiceException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ApiErrorResponse handleAiService(
            AiServiceException exception
    ) {
        return ApiErrorResponse.of(
                "AI_SERVICE_UNAVAILABLE",
                "AI service is temporarily unavailable"
        );
    }
}