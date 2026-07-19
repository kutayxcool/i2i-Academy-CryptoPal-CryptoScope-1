import {
    useState,
} from "react";

import {
    getAssetIcon,
    getAssetName,
} from "../constants/assetCatalog";

import "./TradeModal.css";

function formatPrice(value) {
    const numericValue =
        Number(value);

    if (!Number.isFinite(numericValue)) {
        return "Unavailable";
    }

    let maximumFractionDigits = 2;

    if (numericValue < 1) {
        maximumFractionDigits = 8;
    } else if (numericValue < 100) {
        maximumFractionDigits = 4;
    }

    return numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits,
        }
    );
}

function formatCurrency(value) {
    const numericValue =
        Number(value);

    if (!Number.isFinite(numericValue)) {
        return "0.00";
    }

    return numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}

function TradeModal({
    isOpen,
    type,
    crypto,
    onClose,
    onConfirm,
    isSubmitting,
    serverError,
}) {
    const [amount, setAmount] =
        useState("");

    const [
        validationError,
        setValidationError,
    ] = useState("");

    if (!isOpen || !crypto) {
        return null;
    }

    const isBuy =
        type === "buy";

    const numericAmount =
        Number(amount);

    const hasValidAmount =
        Number.isFinite(numericAmount)
        && numericAmount > 0;

    const estimatedTotal =
        hasValidAmount
            ? numericAmount
                * Number(crypto.price)
            : 0;

    const handleAmountChange = (
        event
    ) => {
        setAmount(
            event.target.value
        );

        if (validationError) {
            setValidationError("");
        }
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();
        setValidationError("");

        if (!hasValidAmount) {
            setValidationError(
                "Please enter a valid amount greater than zero."
            );
            return;
        }

        await onConfirm({
            type,
            crypto,
            amount: numericAmount,
        });
    };

    const handleBackdropClick = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <div
            className="modal-backdrop"
            onClick={handleBackdropClick}
        >
            <section
                className="trade-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trade-modal-title"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="trade-modal-accent" />

                <header className="trade-modal-header">
                    <div className="trade-modal-identity">
                        <span className="trade-modal-coin-icon">
                            {getAssetIcon(
                                crypto.symbol
                            )}
                        </span>

                        <div>
                            <span
                                className={
                                    isBuy
                                        ? "trade-modal-side buy"
                                        : "trade-modal-side sell"
                                }
                            >
                                {isBuy
                                    ? "Buy order"
                                    : "Sell order"}
                            </span>

                            <h2 id="trade-modal-title">
                                {isBuy
                                    ? "Buy"
                                    : "Sell"}{" "}
                                {getAssetName(
                                    crypto.symbol
                                )}
                            </h2>

                            <p>
                                {crypto.symbol}/USD
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close trade modal"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                d="M5 5L15 15M15 5L5 15"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="1.8"
                            />
                        </svg>
                    </button>
                </header>

                <div className="trade-market-summary">
                    <div>
                        <span>Current market price</span>

                        <strong>
                            $
                            {formatPrice(
                                crypto.price
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Market source</span>

                        <strong>
                            Binance
                        </strong>
                    </div>

                    <div>
                        <span>Status</span>

                        <strong className="trade-market-online">
                            <span />
                            Live
                        </strong>
                    </div>
                </div>

                {(validationError
                    || serverError) && (
                    <div
                        className="modal-error"
                        role="alert"
                    >
                        <span>!</span>

                        <p>
                            {validationError
                                || serverError}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="trade-form-field">
                        <div className="trade-form-label">
                            <label htmlFor="amount">
                                Asset amount
                            </label>

                            <span>
                                Enter the quantity
                                to{" "}
                                {isBuy
                                    ? "purchase"
                                    : "sell"}
                            </span>
                        </div>

                        <div className="trade-amount-input">
                            <input
                                id="amount"
                                type="number"
                                min="0.000000000001"
                                step="0.000000000001"
                                placeholder="0.00"
                                value={amount}
                                onChange={
                                    handleAmountChange
                                }
                                disabled={
                                    isSubmitting
                                }
                                autoFocus
                            />

                            <span>
                                {crypto.symbol}
                            </span>
                        </div>
                    </div>

                    <div className="trade-order-summary">
                        <div>
                            <span>
                                {isBuy
                                    ? "Estimated cost"
                                    : "Estimated proceeds"}
                            </span>

                            <strong>
                                $
                                {formatCurrency(
                                    estimatedTotal
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Order type
                            </span>

                            <strong>
                                Market order
                            </strong>
                        </div>
                    </div>

                    <div className="trade-information">
                        <span>
                            <svg
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="10"
                                    cy="10"
                                    r="7"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />

                                <path
                                    d="M10 8V13M10 5.8V6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="1.7"
                                />
                            </svg>
                        </span>

                        <p>
                            The transaction will use
                            the latest price available
                            in the market cache. The
                            final value may differ
                            slightly if the price is
                            refreshed.
                        </p>
                    </div>

                    <div className="trade-modal-actions">
                        <button
                            type="button"
                            className="trade-cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={
                                isBuy
                                    ? "execute-order-button buy"
                                    : "execute-order-button sell"
                            }
                            disabled={
                                isSubmitting
                            }
                        >
                            {isSubmitting && (
                                <span className="trade-spinner" />
                            )}

                            {isSubmitting
                                ? "Processing order..."
                                : isBuy
                                    ? `Buy ${crypto.symbol}`
                                    : `Sell ${crypto.symbol}`}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default TradeModal;