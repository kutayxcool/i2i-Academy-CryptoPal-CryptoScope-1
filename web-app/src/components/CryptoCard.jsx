import "./CryptoCard.css";

function formatUpdatedAt(updatedAt) {
    const date = new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
        return "Latest cached price";
    }

    return `Updated at ${date.toLocaleTimeString()}`;
}

function CryptoCard({
    crypto,
    onBuy,
    onSell,
}) {
    return (
        <article className="crypto-card">
            <div className="crypto-card-header">
                <div>
                    <h2>{crypto.symbol}</h2>
                    <p>{crypto.name}</p>
                </div>

                <span className="crypto-live">
                    Live
                </span>
            </div>

            <div className="crypto-price">
                $
                {crypto.price.toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                    }
                )}
            </div>

            <small className="crypto-updated">
                {formatUpdatedAt(
                    crypto.updatedAt
                )}
            </small>

            <div className="crypto-actions">
                <button
                    type="button"
                    className="buy-button"
                    onClick={onBuy}
                >
                    Buy
                </button>

                <button
                    type="button"
                    className="sell-button"
                    onClick={onSell}
                >
                    Sell
                </button>
            </div>
        </article>
    );
}

export default CryptoCard;