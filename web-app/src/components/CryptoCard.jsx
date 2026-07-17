import "./CryptoCard.css";

function CryptoCard({ crypto, onBuy, onSell }) {
  const isPositive = crypto.change >= 0;

  return (
    <article className="crypto-card">
      <div className="crypto-card-header">
        <div>
          <h2>{crypto.symbol}</h2>
          <p>{crypto.name}</p>
        </div>

        <span
          className={
            isPositive
              ? "crypto-change positive"
              : "crypto-change negative"
          }
        >
          {isPositive ? "+" : ""}
          {crypto.change}%
        </span>
      </div>

      <div className="crypto-price">
        $
        {crypto.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      <div className="crypto-actions">
        <button
          type="button"
          className="buy-button"
          onClick={() => onBuy(crypto)}
        >
          Buy
        </button>

        <button
          type="button"
          className="sell-button"
          onClick={() => onSell(crypto)}
        >
          Sell
        </button>
      </div>
    </article>
  );
}

export default CryptoCard;