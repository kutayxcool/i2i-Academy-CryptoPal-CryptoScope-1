import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import CryptoCard from "../components/CryptoCard";
import TradeModal from "../components/TradeModal";

import {
    getAssetName,
    getAssetOrder,
} from "../constants/assetCatalog";

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

function normalizeMarketPrices(prices) {
    if (!Array.isArray(prices)) {
        throw new Error(
            "Market price response is invalid"
        );
    }

    return prices
        .map((marketPrice) => ({
            symbol:
                marketPrice.symbol,

            name:
                getAssetName(
                    marketPrice.symbol
                ),

            price:
                Number(
                    marketPrice.price
                ),

            updatedAt:
                marketPrice.updatedAt,
        }))
        .filter(
            (marketPrice) =>
                marketPrice.symbol
                && Number.isFinite(
                    marketPrice.price
                )
        )
        .sort(
            (
                firstAsset,
                secondAsset
            ) =>
                getAssetOrder(
                    firstAsset.symbol
                )
                - getAssetOrder(
                    secondAsset.symbol
                )
        );
}

function findLatestUpdateTime(prices) {
    const timestamps =
        prices
            .map((price) =>
                new Date(
                    price.updatedAt
                ).getTime()
            )
            .filter(Number.isFinite);

    if (timestamps.length === 0) {
        return null;
    }

    return new Date(
        Math.max(...timestamps)
    );
}

function formatUpdateTime(date) {
    if (
        !date
        || Number.isNaN(
            date.getTime()
        )
    ) {
        return "Waiting for market data";
    }

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }
    );
}

function DashboardPage() {
    const {
        user,
        updateBalance,
    } = useAuth();

    const [
        cryptos,
        setCryptos,
    ] = useState([]);

    const [
        lastUpdated,
        setLastUpdated,
    ] = useState(null);

    const [
        selectedCrypto,
        setSelectedCrypto,
    ] = useState(null);

    const [
        tradeType,
        setTradeType,
    ] = useState("buy");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        marketError,
        setMarketError,
    ] = useState("");

    const [
        tradeError,
        setTradeError,
    ] = useState("");

    const [
        isLoadingPrices,
        setIsLoadingPrices,
    ] = useState(true);

    const [
        isSubmittingTrade,
        setIsSubmittingTrade,
    ] = useState(false);

    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");

    const [
        sortBy,
        setSortBy,
    ] = useState("catalog");

    const displayName =
        user.firstName
        || user.fullName
        || user.username;

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

                setCryptos(
                    normalizedPrices
                );

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
        const initialLoadTimer =
            window.setTimeout(
                () => {
                    void loadPrices(true);
                },
                0
            );

        const intervalId =
            window.setInterval(
                () => {
                    void loadPrices(false);
                },
                15000
            );

        return () => {
            window.clearTimeout(
                initialLoadTimer
            );

            window.clearInterval(
                intervalId
            );
        };
    }, [loadPrices]);

    const visibleCryptos =
        useMemo(
            () => {
                const normalizedSearch =
                    searchTerm
                        .trim()
                        .toLowerCase();

                const filteredCryptos =
                    cryptos.filter(
                        (crypto) =>
                            !normalizedSearch
                            || crypto.symbol
                                .toLowerCase()
                                .includes(
                                    normalizedSearch
                                )
                            || crypto.name
                                .toLowerCase()
                                .includes(
                                    normalizedSearch
                                )
                    );

                return [
                    ...filteredCryptos,
                ].sort(
                    (
                        firstCrypto,
                        secondCrypto
                    ) => {
                        if (
                            sortBy
                            === "price-high"
                        ) {
                            return (
                                secondCrypto.price
                                - firstCrypto.price
                            );
                        }

                        if (
                            sortBy
                            === "price-low"
                        ) {
                            return (
                                firstCrypto.price
                                - secondCrypto.price
                            );
                        }

                        if (
                            sortBy
                            === "name"
                        ) {
                            return firstCrypto.name
                                .localeCompare(
                                    secondCrypto.name
                                );
                        }

                        return (
                            getAssetOrder(
                                firstCrypto.symbol
                            )
                            - getAssetOrder(
                                secondCrypto.symbol
                            )
                        );
                    }
                );
            },
            [
                cryptos,
                searchTerm,
                sortBy,
            ]
        );

    const highestPricedAsset =
        useMemo(
            () => {
                if (cryptos.length === 0) {
                    return null;
                }

                return cryptos.reduce(
                    (
                        highestAsset,
                        currentAsset
                    ) =>
                        currentAsset.price
                        > highestAsset.price
                            ? currentAsset
                            : highestAsset
                );
            },
            [cryptos]
        );

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
            symbol:
                order.crypto.symbol,

            amount:
                order.amount,
        };

        try {
            const request =
                order.type === "buy"
                    ? buyCrypto
                    : sellCrypto;

            const response =
                await request(
                    tradeRequest
                );

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
                    <div className="dashboard-welcome-panel">
                        <span className="dashboard-eyebrow">
                            Market workspace
                        </span>

                        <h1>
                            Welcome back,
                            <span>
                                {" "}
                                {displayName}
                            </span>
                        </h1>

                        <p>
                            Monitor current cryptocurrency
                            prices, execute virtual trades
                            and manage your portfolio from
                            one workspace.
                        </p>

                        <div className="dashboard-quick-links">
                            <Link to="/portfolio">
                                View portfolio
                            </Link>

                            <Link
                                to="/ai-chat"
                                className="secondary"
                            >
                                Ask AI assistant
                            </Link>
                        </div>
                    </div>

                    <div className="dashboard-balance-card">
                        <div className="dashboard-balance-header">
                            <span>
                                Available balance
                            </span>

                            <span className="dashboard-balance-status">
                                Ready to trade
                            </span>
                        </div>

                        <strong>
                            $
                            {formatCurrency(
                                user.balance
                            )}
                        </strong>

                        <p>
                            Your virtual cash balance
                            available for buy orders.
                        </p>

                        <div className="dashboard-balance-decoration">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </section>

                <section className="dashboard-stat-grid">
                    <article className="dashboard-stat-card">
                        <span>Market assets</span>

                        <strong>
                            {cryptos.length}
                        </strong>

                        <small>
                            Currently available
                        </small>
                    </article>

                    <article className="dashboard-stat-card">
                        <span>
                            Highest market price
                        </span>

                        <strong>
                            {highestPricedAsset
                                ? highestPricedAsset.symbol
                                : "—"}
                        </strong>

                        <small>
                            {highestPricedAsset
                                ? `$${formatCurrency(
                                    highestPricedAsset.price
                                )}`
                                : "Waiting for prices"}
                        </small>
                    </article>

                    <article className="dashboard-stat-card">
                        <span>
                            Last market refresh
                        </span>

                        <strong className="time">
                            {formatUpdateTime(
                                lastUpdated
                            )}
                        </strong>

                        <small>
                            Refreshes every 15 seconds
                        </small>
                    </article>
                </section>

                <section className="market-section">
                    <div className="market-section-heading">
                        <div>
                            <span className="dashboard-eyebrow">
                                Live prices
                            </span>

                            <h2>
                                Explore the market
                            </h2>

                            <p>
                                Search, compare and trade
                                supported digital assets.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="market-refresh-button"
                            onClick={() =>
                                void loadPrices(true)
                            }
                            disabled={isLoadingPrices}
                        >
                            <svg
                                className={
                                    isLoadingPrices
                                        ? "spinning"
                                        : ""
                                }
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    d="M16.2 7.2A6.7 6.7 0 104.6 14M16.2 7.2V3.5M16.2 7.2H12.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.7"
                                />
                            </svg>

                            {isLoadingPrices
                                ? "Refreshing"
                                : "Refresh"}
                        </button>
                    </div>

                    <div className="market-toolbar">
                        <label className="market-search">
                            <svg
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="8.7"
                                    cy="8.7"
                                    r="5.2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                />

                                <path
                                    d="M12.5 12.5L17 17"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="1.6"
                                />
                            </svg>

                            <input
                                type="search"
                                placeholder="Search by coin name or symbol"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />
                        </label>

                        <label className="market-sort">
                            <span>Sort by</span>

                            <select
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="catalog">
                                    Default order
                                </option>

                                <option value="name">
                                    Name
                                </option>

                                <option value="price-high">
                                    Price: high to low
                                </option>

                                <option value="price-low">
                                    Price: low to high
                                </option>
                            </select>
                        </label>
                    </div>

                    {successMessage && (
                        <div className="dashboard-message">
                            <span>✓</span>
                            {successMessage}
                        </div>
                    )}

                    {marketError && (
                        <div className="dashboard-error">
                            <span>!</span>
                            {marketError}
                        </div>
                    )}

                    {isLoadingPrices
                        && cryptos.length === 0 && (
                        <div className="market-state">
                            <span className="market-loader" />

                            <strong>
                                Loading live market prices
                            </strong>

                            <p>
                                Connecting to the market
                                data service.
                            </p>
                        </div>
                    )}

                    {!isLoadingPrices
                        && !marketError
                        && visibleCryptos.length
                        === 0 && (
                        <div className="market-state">
                            <strong>
                                No matching assets
                            </strong>

                            <p>
                                Try a different name or
                                symbol.
                            </p>
                        </div>
                    )}

                    {visibleCryptos.length > 0 && (
                        <div className="crypto-grid">
                            {visibleCryptos.map(
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
                key={
                    selectedCrypto
                        ? `${tradeType}-${selectedCrypto.symbol}`
                        : "closed-trade-modal"
                }
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