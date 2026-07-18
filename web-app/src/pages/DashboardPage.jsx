import {
    useCallback,
    useEffect,
    useState,
} from "react";

import Navbar from "../components/Navbar";
import CryptoCard from "../components/CryptoCard";
import TradeModal from "../components/TradeModal";

import {
    getMarketPrices,
} from "../services/marketService";

import {
    buyCrypto,
    sellCrypto,
} from "../services/tradeService";

import {
    useAuth,
} from "../context/AuthContext";

import "../styles/Dashboard.css";

const ASSET_NAMES = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
};

const ASSET_ORDER = {
    BTC: 1,
    ETH: 2,
};

function getApiErrorMessage(
    requestError,
    fallbackMessage
) {
    return requestError.response?.data
        ?.error?.message
        || requestError.message
        || fallbackMessage;
}

function formatCurrency(value) {
    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}

function normalizeMarketPrices(prices) {
    if (!Array.isArray(prices)) {
        throw new Error(
            "Market price response is invalid"
        );
    }

    return prices
        .map((marketPrice) => ({
            symbol: marketPrice.symbol,
            name:
                ASSET_NAMES[marketPrice.symbol]
                || marketPrice.symbol,
            price: Number(marketPrice.price),
            updatedAt: marketPrice.updatedAt,
        }))
        .sort(
            (firstAsset, secondAsset) =>
                (ASSET_ORDER[firstAsset.symbol] || 99)
                - (ASSET_ORDER[secondAsset.symbol] || 99)
        );
}

function findLatestUpdateTime(prices) {
    const timestamps = prices
        .map((price) =>
            new Date(price.updatedAt).getTime()
        )
        .filter(Number.isFinite);

    if (timestamps.length === 0) {
        return new Date();
    }

    return new Date(
        Math.max(...timestamps)
    );
}

function DashboardPage() {
    const {
        user,
        updateBalance,
    } = useAuth();

    const [cryptos, setCryptos] = useState([]);
    const [lastUpdated, setLastUpdated] =
        useState(null);

    const [
        selectedCrypto,
        setSelectedCrypto,
    ] = useState(null);

    const [tradeType, setTradeType] =
        useState("buy");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [marketError, setMarketError] =
        useState("");

    const [tradeError, setTradeError] =
        useState("");

    const [
        isLoadingPrices,
        setIsLoadingPrices,
    ] = useState(true);

    const [
        isSubmittingTrade,
        setIsSubmittingTrade,
    ] = useState(false);

    const loadPrices = useCallback(
        async (showLoading = true) => {
            if (showLoading) {
                setIsLoadingPrices(true);
            }

            setMarketError("");

            try {
                const response =
                    await getMarketPrices();

                const normalizedPrices =
                    normalizeMarketPrices(
                        response.data
                    );

                setCryptos(normalizedPrices);

                setLastUpdated(
                    findLatestUpdateTime(
                        normalizedPrices
                    )
                );
            } catch (requestError) {
                setMarketError(
                    getApiErrorMessage(
                        requestError,
                        "Unable to load market prices"
                    )
                );
            } finally {
                if (showLoading) {
                    setIsLoadingPrices(false);
                }
            }
        },
        []
    );

    useEffect(() => {
        loadPrices(true);

        const intervalId = window.setInterval(
            () => {
                loadPrices(false);
            },
            15000
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [loadPrices]);

    const openTradeModal = (
        crypto,
        type
    ) => {
        setSelectedCrypto(crypto);
        setTradeType(type);
        setTradeError("");
        setSuccessMessage("");
    };

    const closeTradeModal = () => {
        if (isSubmittingTrade) {
            return;
        }

        setSelectedCrypto(null);
        setTradeError("");
    };

    const handleConfirmTrade = async (
        order
    ) => {
        setTradeError("");
        setIsSubmittingTrade(true);

        const tradeRequest = {
            symbol: order.crypto.symbol,
            amount: order.amount,
        };

        try {
            const request =
                order.type === "buy"
                    ? buyCrypto
                    : sellCrypto;

            const response =
                await request(tradeRequest);

            const completedTrade =
                response.data;

            updateBalance(
                completedTrade.newBalance
            );

            const operationName =
                order.type === "buy"
                    ? "Purchase"
                    : "Sale";

            setSuccessMessage(
                `${operationName} completed: `
                + `${completedTrade.amount} `
                + `${completedTrade.symbol} at $`
                + `${formatCurrency(
                    completedTrade.price
                )}.`
            );

            setSelectedCrypto(null);
        } catch (requestError) {
            setTradeError(
                getApiErrorMessage(
                    requestError,
                    "Trade could not be completed"
                )
            );
        } finally {
            setIsSubmittingTrade(false);
        }
    };

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-content">
                <section className="dashboard-hero">
                    <div>
                        <p className="dashboard-eyebrow">
                            Market overview
                        </p>

                        <h1>
                            Welcome back,{" "}
                            {user.username}
                        </h1>

                        <p>
                            Track live prices and
                            manage your crypto
                            portfolio.
                        </p>
                    </div>

                    <div className="wallet-card">
                        <span>
                            Wallet Balance
                        </span>

                        <strong>
                            $
                            {formatCurrency(
                                user.balance
                            )}
                        </strong>

                        <small>
                            Available for trading
                        </small>
                    </div>
                </section>

                <section className="market-section">
                    <div className="market-header">
                        <div>
                            <h2>Live Market</h2>

                            <p>
                                Last updated:{" "}
                                {lastUpdated
                                    ? lastUpdated
                                        .toLocaleTimeString()
                                    : "Waiting for prices"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                loadPrices(true)
                            }
                            disabled={isLoadingPrices}
                        >
                            {isLoadingPrices
                                ? "Refreshing..."
                                : "Refresh Prices"}
                        </button>
                    </div>

                    {successMessage && (
                        <div className="dashboard-message">
                            {successMessage}
                        </div>
                    )}

                    {marketError && (
                        <div className="dashboard-error">
                            {marketError}
                        </div>
                    )}

                    {isLoadingPrices
                        && cryptos.length === 0 && (
                            <div className="market-state">
                                Loading live market
                                prices...
                            </div>
                        )}

                    {!isLoadingPrices
                        && !marketError
                        && cryptos.length === 0 && (
                            <div className="market-state">
                                No market prices are
                                currently available.
                            </div>
                        )}

                    {cryptos.length > 0 && (
                        <div className="crypto-grid">
                            {cryptos.map(
                                (crypto) => (
                                    <CryptoCard
                                        key={
                                            crypto.symbol
                                        }
                                        crypto={
                                            crypto
                                        }
                                        onBuy={() =>
                                            openTradeModal(
                                                crypto,
                                                "buy"
                                            )
                                        }
                                        onSell={() =>
                                            openTradeModal(
                                                crypto,
                                                "sell"
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>
            </main>

            <TradeModal
                isOpen={Boolean(selectedCrypto)}
                type={tradeType}
                crypto={selectedCrypto}
                onClose={closeTradeModal}
                onConfirm={handleConfirmTrade}
                isSubmitting={isSubmittingTrade}
                serverError={tradeError}
            />
        </div>
    );
}

export default DashboardPage;