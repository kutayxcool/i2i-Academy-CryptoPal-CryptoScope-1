import { useEffect, useState } from "react";
import "./TradeModal.css";

function TradeModal({ isOpen, type, crypto, onClose, onConfirm }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !crypto) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    onConfirm({
      type,
      crypto,
      amount: numericAmount,
      total: numericAmount * crypto.price,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="trade-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="trade-modal-header">
          <div>
            <h2>
              {type === "buy" ? "Buy" : "Sell"} {crypto.symbol}
            </h2>
            <p>Current price: ${crypto.price.toLocaleString()}</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="amount">Amount</label>

          <input
            id="amount"
            type="number"
            min="0"
            step="0.0001"
            placeholder={`Enter ${crypto.symbol} amount`}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <div className="trade-total">
            Estimated total:{" "}
            <strong>
              $
              {amount
                ? (Number(amount) * crypto.price).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )
                : "0.00"}
            </strong>
          </div>

          <button type="submit" className="execute-order-button">
            Execute Order
          </button>
        </form>
      </section>
    </div>
  );
}

export default TradeModal;