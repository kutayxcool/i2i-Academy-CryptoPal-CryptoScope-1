import {
    getAssetIcon,
} from "../constants/assetCatalog";

import "./CryptoCard.css";

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

function formatUpdatedAt(updatedAt) {
    const date =
        new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
        return "Latest cached market price";
    }

    return `Updated ${date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    )}`;
}

function CryptoCard({
    crypto,
    onBuy,
    onSell,
}) {
    return (
        <article className="crypto-card">
            <div className="crypto-card-top">
                <div className="crypto-identity">
                    <span className="crypto-card-icon">
                        {getAssetIcon(
                            crypto.symbol
                        )}
                    </span>

                    <div>
                        <h3>{crypto.name}</h3>
                        <p>{crypto.symbol}/USD</p>
                    </div>
                </div>

                <span className="crypto-live">
                    <span />
                    Live
                </span>
            </div>

            <div className="crypto-card-price">
                <span>Current price</span>

                <strong>
                    $
                    {formatPrice(
                        crypto.price
                    )}
                </strong>
            </div>

            <div className="crypto-card-meta">
                <span>
                    Market source
                    <strong>Binance</strong>
                </span>

                <span>
                    Status
                    <strong className="online">
                        Available
                    </strong>
                </span>
            </div>

            <div className="crypto-card-footer">
                <small>
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
            </div>
        </article>
    );
}

export default CryptoCard;