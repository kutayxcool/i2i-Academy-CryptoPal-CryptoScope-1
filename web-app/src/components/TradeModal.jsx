import {
    useEffect,
    useState,
} from "react";

import "./TradeModal.css";

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

    const [validationError, setValidationError] =
        useState("");

    useEffect(() => {
        if (isOpen) {
            setAmount("");
            setValidationError("");
        }
    }, [isOpen]);

    if (!isOpen || !crypto) {
        return null;
    }

    const numericAmount =
        Number(amount);

    const estimatedTotal =
        Number.isFinite(numericAmount)
            ? numericAmount * crypto.price
            : 0;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setValidationError("");

        if (
            !Number.isFinite(numericAmount)
            || numericAmount <= 0
        ) {
            setValidationError(
                "Please enter a valid amount."
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
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="trade-modal-header">
                    <div>
                        <h2>
                            {type === "buy"
                                ? "Buy"
                                : "Sell"}{" "}
                            {crypto.symbol}
                        </h2>

                        <p>
                            Current price: $
                            {crypto.price.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 8,
                                }
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close trade modal"
                    >
                        ×
                    </button>
                </div>

                {(validationError
                    || serverError) && (
                    <div className="modal-error">
                        {validationError
                            || serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="amount">
                        Amount
                    </label>

                    <input
                        id="amount"
                        type="number"
                        min="0.000000000001"
                        step="0.000000000001"
                        placeholder={
                            `Enter ${crypto.symbol} amount`
                        }
                        value={amount}
                        onChange={(event) =>
                            setAmount(
                                event.target.value
                            )
                        }
                        disabled={isSubmitting}
                    />

                    <div className="trade-total">
                        Estimated total:{" "}
                        <strong>
                            $
                            {estimatedTotal
                                .toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                        </strong>
                    </div>

                    <button
                        type="submit"
                        className="execute-order-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Processing..."
                            : "Execute Order"}
                    </button>
                </form>
            </section>
        </div>
    );
}

export default TradeModal;