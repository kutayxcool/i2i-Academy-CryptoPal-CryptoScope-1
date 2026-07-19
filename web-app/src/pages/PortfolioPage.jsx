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

import {
    getAssetIcon,
    getAssetName,
    getAssetOrder,
} from "../constants/assetCatalog";

import {
    getPortfolio,
    getTransactions,
} from "../services/portfolioService";

import {
    getMarketPrices,
} from "../services/marketService";

import {
    useAuth,
} from "../context/AuthContext";

import "../styles/Portfolio.css";

function getApiErrorMessage(
    requestError,
    fallbackMessage
) {
    return requestError.response?.data
        ?.error?.message
        || requestError.message
        || fallbackMessage;
}

function toFiniteNumber(value) {
    if (
        value === null
        || value === undefined
        || value === ""
    ) {
        return null;
    }

    const numericValue =
        Number(value);

    return Number.isFinite(numericValue)
        ? numericValue
        : null;
}

function formatCurrency(value) {
    const numericValue =
        toFiniteNumber(value);

    if (numericValue === null) {
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

function formatPrice(value) {
    const numericValue =
        toFiniteNumber(value);

    if (numericValue === null) {
        return "Unavailable";
    }

    let maximumFractionDigits = 2;

    if (Math.abs(numericValue) < 1) {
        maximumFractionDigits = 8;
    } else if (Math.abs(numericValue) < 100) {
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

function formatAmount(value) {
    const numericValue =
        toFiniteNumber(value);

    if (numericValue === null) {
        return "0";
    }

    return numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 12,
        }
    );
}

function formatSignedCurrency(value) {
    const numericValue =
        toFiniteNumber(value);

    if (numericValue === null) {
        return "$0.00";
    }

    const sign =
        numericValue > 0
            ? "+"
            : numericValue < 0
                ? "-"
                : "";

    return `${sign}$${formatCurrency(
        Math.abs(numericValue)
    )}`;
}

function formatSignedPercentage(value) {
    const numericValue =
        toFiniteNumber(value);

    if (numericValue === null) {
        return "0.00%";
    }

    const sign =
        numericValue > 0
            ? "+"
            : numericValue < 0
                ? "-"
                : "";

    return `${sign}${Math.abs(
        numericValue
    ).toFixed(2)}%`;
}

function getPerformanceClass(value) {
    const numericValue =
        toFiniteNumber(value);

    if (
        numericValue !== null
        && numericValue > 0
    ) {
        return "positive";
    }

    if (
        numericValue !== null
        && numericValue < 0
    ) {
        return "negative";
    }

    return "neutral";
}

function formatTransactionDate(executedAt) {
    const date =
        new Date(executedAt);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

function formatUpdateTime(date) {
    if (
        !date
        || Number.isNaN(date.getTime())
    ) {
        return "Waiting for market prices";
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

function createPriceMap(marketPrices) {
    if (!Array.isArray(marketPrices)) {
        return new Map();
    }

    return new Map(
        marketPrices.map(
            (marketPrice) => [
                marketPrice.symbol,
                {
                    price:
                        toFiniteNumber(
                            marketPrice.price
                        ),

                    updatedAt:
                        marketPrice.updatedAt,
                },
            ]
        )
    );
}

function findLatestMarketUpdate(
    marketPrices
) {
    if (!Array.isArray(marketPrices)) {
        return null;
    }

    const timestamps =
        marketPrices
            .map((marketPrice) =>
                new Date(
                    marketPrice.updatedAt
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

function getTransactionTotal(transaction) {
    const providedTotal =
        toFiniteNumber(
            transaction.total
        );

    if (providedTotal !== null) {
        return providedTotal;
    }

    const amount =
        toFiniteNumber(
            transaction.amount
        );

    const price =
        toFiniteNumber(
            transaction.price
        );

    if (
        amount === null
        || price === null
    ) {
        return 0;
    }

    return amount * price;
}

function PortfolioPage() {
    const {
        user,
    } = useAuth();

    const [
        balance,
        setBalance,
    ] = useState(
        toFiniteNumber(
            user?.balance
        ) ?? 0
    );

    const [
        holdings,
        setHoldings,
    ] = useState([]);

    const [
        transactions,
        setTransactions,
    ] = useState([]);

    const [
        priceMap,
        setPriceMap,
    ] = useState(new Map());

    const [
        lastUpdated,
        setLastUpdated,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState("");

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);

    const [
        transactionFilter,
        setTransactionFilter,
    ] = useState("ALL");

    const displayName =
        user?.firstName
        || user?.fullName
        || user?.username
        || "Trader";

    const loadPortfolioData =
        useCallback(
            async (
                showInitialLoading = false
            ) => {
                if (showInitialLoading) {
                    setIsLoading(true);
                } else {
                    setIsRefreshing(true);
                }

                setError("");

                try {
                    const [
                        portfolioResponse,
                        transactionsResponse,
                        marketResponse,
                    ] = await Promise.all([
                        getPortfolio(),
                        getTransactions(),
                        getMarketPrices(),
                    ]);

                    const portfolioData =
                        portfolioResponse.data;

                    const transactionData =
                        transactionsResponse.data;

                    const marketData =
                        marketResponse.data;

                    setBalance(
                        toFiniteNumber(
                            portfolioData.balance
                        ) ?? 0
                    );

                    setHoldings(
                        Array.isArray(
                            portfolioData.holdings
                        )
                            ? portfolioData.holdings
                            : []
                    );

                    setTransactions(
                        Array.isArray(
                            transactionData
                        )
                            ? transactionData
                            : []
                    );

                    setPriceMap(
                        createPriceMap(
                            marketData
                        )
                    );

                    setLastUpdated(
                        findLatestMarketUpdate(
                            marketData
                        )
                    );
                } catch (requestError) {
                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Unable to load portfolio information"
                        )
                    );
                } finally {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            },
            []
        );

    useEffect(() => {
        const initialLoadTimer =
            window.setTimeout(
                () => {
                    void loadPortfolioData(
                        true
                    );
                },
                0
            );

        return () => {
            window.clearTimeout(
                initialLoadTimer
            );
        };
    }, [loadPortfolioData]);

    const portfolioAssets =
        useMemo(
            () =>
                holdings
                    .map((holding) => {
                        const symbol =
                            String(
                                holding.symbol
                                || ""
                            ).toUpperCase();

                        const marketPrice =
                            priceMap.get(symbol);

                        const amount =
                            toFiniteNumber(
                                holding.amount
                            ) ?? 0;

                        const backendCurrentPrice =
                            toFiniteNumber(
                                holding.currentPrice
                            );

                        const cachedCurrentPrice =
                            toFiniteNumber(
                                marketPrice?.price
                            );

                        const currentPrice =
                            backendCurrentPrice
                            ?? cachedCurrentPrice;

                        const averageBuyPrice =
                            toFiniteNumber(
                                holding.averageBuyPrice
                            ) ?? 0;

                        const backendInvestedValue =
                            toFiniteNumber(
                                holding.investedValue
                            );

                        const investedValue =
                            backendInvestedValue
                            ?? (
                                amount
                                * averageBuyPrice
                            );

                        const backendCurrentValue =
                            toFiniteNumber(
                                holding.currentValue
                            );

                        const currentValue =
                            backendCurrentValue
                            ?? (
                                currentPrice !== null
                                    ? amount
                                    * currentPrice
                                    : 0
                            );

                        const backendProfitLossAmount =
                            toFiniteNumber(
                                holding.profitLossAmount
                            );

                        const profitLossAmount =
                            backendProfitLossAmount
                            ?? (
                                investedValue > 0
                                    ? currentValue
                                    - investedValue
                                    : 0
                            );

                        const backendProfitLossPercentage =
                            toFiniteNumber(
                                holding
                                    .profitLossPercentage
                            );

                        const profitLossPercentage =
                            backendProfitLossPercentage
                            ?? (
                                investedValue > 0
                                    ? (
                                        profitLossAmount
                                        / investedValue
                                    ) * 100
                                    : 0
                            );

                        return {
                            symbol,

                            name:
                                getAssetName(
                                    symbol
                                ),

                            icon:
                                getAssetIcon(
                                    symbol
                                ),

                            amount,

                            price:
                                currentPrice,

                            averageBuyPrice,

                            investedValue,

                            currentValue,

                            profitLossAmount,

                            profitLossPercentage,

                            updatedAt:
                                marketPrice
                                    ?.updatedAt
                                || null,
                        };
                    })
                    .sort(
                        (
                            firstAsset,
                            secondAsset
                        ) => {
                            const valueDifference =
                                secondAsset.currentValue
                                - firstAsset.currentValue;

                            if (
                                valueDifference
                                !== 0
                            ) {
                                return valueDifference;
                            }

                            return (
                                getAssetOrder(
                                    firstAsset.symbol
                                )
                                - getAssetOrder(
                                    secondAsset.symbol
                                )
                            );
                        }
                    ),
            [
                holdings,
                priceMap,
            ]
        );

    const cryptoValue =
        useMemo(
            () =>
                portfolioAssets.reduce(
                    (
                        totalValue,
                        asset
                    ) =>
                        totalValue
                        + asset.currentValue,
                    0
                ),
            [portfolioAssets]
        );

    const cryptoInvestedValue =
        useMemo(
            () =>
                portfolioAssets.reduce(
                    (
                        totalValue,
                        asset
                    ) =>
                        totalValue
                        + asset.investedValue,
                    0
                ),
            [portfolioAssets]
        );

    const totalProfitLossAmount =
        cryptoValue
        - cryptoInvestedValue;

    const totalProfitLossPercentage =
        cryptoInvestedValue > 0
            ? (
                totalProfitLossAmount
                / cryptoInvestedValue
            ) * 100
            : 0;

    const totalPortfolioValue =
        balance + cryptoValue;

    const portfolioAssetsWithAllocation =
        useMemo(
            () =>
                portfolioAssets.map(
                    (asset) => ({
                        ...asset,

                        allocation:
                            cryptoValue > 0
                                ? (
                                    asset.currentValue
                                    / cryptoValue
                                ) * 100
                                : 0,
                    })
                ),
            [
                portfolioAssets,
                cryptoValue,
            ]
        );

    const largestPosition =
        portfolioAssetsWithAllocation[0]
        || null;

    const filteredTransactions =
        useMemo(
            () => {
                if (
                    transactionFilter
                    === "ALL"
                ) {
                    return transactions;
                }

                return transactions.filter(
                    (transaction) =>
                        transaction.type
                        === transactionFilter
                );
            },
            [
                transactions,
                transactionFilter,
            ]
        );

    return (
        <div className="portfolio-page">
            <Navbar />

            <main className="portfolio-content">
                <section className="portfolio-hero">
                    <div className="portfolio-hero-copy">
                        <span className="portfolio-eyebrow">
                            Portfolio workspace
                        </span>

                        <h1>
                            Your financial overview,
                            <span>
                                {" "}
                                {displayName}
                            </span>
                        </h1>

                        <p>
                            Review your virtual cash
                            balance, cryptocurrency
                            positions, investment
                            performance and complete
                            transaction history.
                        </p>
                    </div>

                    <div className="portfolio-hero-actions">
                        <div className="portfolio-update-status">
                            <span className="portfolio-status-dot" />

                            <div>
                                <span>
                                    Latest market update
                                </span>

                                <strong>
                                    {formatUpdateTime(
                                        lastUpdated
                                    )}
                                </strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="portfolio-refresh-button"
                            onClick={() =>
                                void loadPortfolioData(
                                    false
                                )
                            }
                            disabled={isRefreshing}
                        >
                            <svg
                                className={
                                    isRefreshing
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

                            {isRefreshing
                                ? "Refreshing"
                                : "Refresh portfolio"}
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="portfolio-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <section className="portfolio-loading">
                        <span className="portfolio-loader" />

                        <strong>
                            Loading your portfolio
                        </strong>

                        <p>
                            Retrieving balances,
                            holdings, cost basis and
                            current market prices.
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="portfolio-summary-grid">
                            <article className="portfolio-summary-card">
                                <div className="portfolio-summary-label">
                                    <span>
                                        Cash balance
                                    </span>

                                    <span className="portfolio-summary-icon cash">
                                        $
                                    </span>
                                </div>

                                <strong>
                                    $
                                    {formatCurrency(
                                        balance
                                    )}
                                </strong>

                                <small>
                                    Available for new
                                    market orders
                                </small>
                            </article>

                            <article className="portfolio-summary-card">
                                <div className="portfolio-summary-label">
                                    <span>
                                        Crypto value
                                    </span>

                                    <span className="portfolio-summary-icon crypto">
                                        ₿
                                    </span>
                                </div>

                                <strong>
                                    $
                                    {formatCurrency(
                                        cryptoValue
                                    )}
                                </strong>

                                <small>
                                    Current value of all
                                    positions
                                </small>
                            </article>

                            <article className="portfolio-summary-card featured">
                                <div className="portfolio-summary-label">
                                    <span>
                                        Total portfolio
                                    </span>

                                    <span className="portfolio-summary-icon total">
                                        ◆
                                    </span>
                                </div>

                                <strong>
                                    $
                                    {formatCurrency(
                                        totalPortfolioValue
                                    )}
                                </strong>

                                <small>
                                    Combined cash and
                                    digital assets
                                </small>
                            </article>

                            <article
                                className={
                                    `portfolio-summary-card performance ${
                                        getPerformanceClass(
                                            totalProfitLossAmount
                                        )
                                    }`
                                }
                            >
                                <div className="portfolio-summary-label">
                                    <span>
                                        Unrealized P/L
                                    </span>

                                    <span className="portfolio-summary-icon performance">
                                        %
                                    </span>
                                </div>

                                <strong
                                    className={
                                        `portfolio-performance-value ${
                                            getPerformanceClass(
                                                totalProfitLossAmount
                                            )
                                        }`
                                    }
                                >
                                    {formatSignedCurrency(
                                        totalProfitLossAmount
                                    )}
                                </strong>

                                <small>
                                    {formatSignedPercentage(
                                        totalProfitLossPercentage
                                    )}
                                    {" "}
                                    across
                                    {" "}
                                    {portfolioAssets.length}
                                    {" "}
                                    open positions
                                </small>
                            </article>
                        </section>

                        <section className="portfolio-workspace-grid">
                            <article className="portfolio-allocation-panel">
                                <div className="portfolio-panel-heading">
                                    <div>
                                        <span className="portfolio-eyebrow">
                                            Distribution
                                        </span>

                                        <h2>
                                            Asset allocation
                                        </h2>
                                    </div>
                                </div>

                                <div className="portfolio-allocation-total">
                                    <span>
                                        Crypto holdings
                                    </span>

                                    <strong>
                                        $
                                        {formatCurrency(
                                            cryptoValue
                                        )}
                                    </strong>
                                </div>

                                {portfolioAssetsWithAllocation
                                    .length === 0 ? (
                                    <div className="portfolio-empty compact">
                                        <strong>
                                            No crypto
                                            positions
                                        </strong>

                                        <p>
                                            Purchased assets
                                            will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="portfolio-allocation-list">
                                        {portfolioAssetsWithAllocation.map(
                                            (asset) => (
                                                <div
                                                    className="portfolio-allocation-item"
                                                    key={asset.symbol}
                                                >
                                                    <div className="portfolio-allocation-copy">
                                                        <span className="portfolio-asset-icon small">
                                                            {asset.icon}
                                                        </span>

                                                        <div>
                                                            <strong>
                                                                {asset.symbol}
                                                            </strong>

                                                            <span>
                                                                {asset.allocation
                                                                    .toFixed(
                                                                        1
                                                                    )}
                                                                %
                                                            </span>
                                                        </div>

                                                        <small>
                                                            $
                                                            {formatCurrency(
                                                                asset.currentValue
                                                            )}
                                                        </small>
                                                    </div>

                                                    <div className="portfolio-allocation-track">
                                                        <span
                                                            style={{
                                                                width:
                                                                    `${Math.max(
                                                                        asset.allocation,
                                                                        2
                                                                    )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {largestPosition && (
                                    <div className="portfolio-largest-position">
                                        <span>
                                            Largest position
                                        </span>

                                        <strong>
                                            {largestPosition.name}
                                        </strong>

                                        <small>
                                            {largestPosition
                                                .allocation
                                                .toFixed(
                                                    1
                                                )}
                                            % of crypto
                                            holdings
                                        </small>
                                    </div>
                                )}
                            </article>

                            <article className="portfolio-assets-panel">
                                <div className="portfolio-panel-heading">
                                    <div>
                                        <span className="portfolio-eyebrow">
                                            Current positions
                                        </span>

                                        <h2>
                                            Your assets
                                        </h2>

                                        <p>
                                            Profit and loss
                                            compares your
                                            weighted average
                                            purchase price with
                                            the latest cached
                                            market price.
                                        </p>
                                    </div>

                                    <Link
                                        to="/dashboard"
                                        className="portfolio-market-link"
                                    >
                                        Explore market
                                    </Link>
                                </div>

                                {portfolioAssetsWithAllocation
                                    .length === 0 ? (
                                    <div className="portfolio-empty">
                                        <span>
                                            ◇
                                        </span>

                                        <strong>
                                            Your portfolio
                                            is empty
                                        </strong>

                                        <p>
                                            Visit the market
                                            to complete your
                                            first virtual
                                            trade.
                                        </p>

                                        <Link to="/dashboard">
                                            Go to market
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="portfolio-assets-table">
                                        <div className="portfolio-assets-table-header">
                                            <span>
                                                Asset
                                            </span>

                                            <span>
                                                Quantity
                                            </span>

                                            <span>
                                                Average buy
                                            </span>

                                            <span>
                                                Current price
                                            </span>

                                            <span>
                                                Cost basis
                                            </span>

                                            <span>
                                                Current value
                                            </span>

                                            <span>
                                                Profit / Loss
                                            </span>
                                        </div>

                                        {portfolioAssetsWithAllocation.map(
                                            (asset) => {
                                                const performanceClass =
                                                    getPerformanceClass(
                                                        asset
                                                            .profitLossAmount
                                                    );

                                                return (
                                                    <div
                                                        className="portfolio-asset-row"
                                                        key={asset.symbol}
                                                    >
                                                        <div className="portfolio-asset-identity">
                                                            <span className="portfolio-asset-icon">
                                                                {asset.icon}
                                                            </span>

                                                            <div>
                                                                <strong>
                                                                    {asset.name}
                                                                </strong>

                                                                <span>
                                                                    {asset.symbol}
                                                                    /USD
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="portfolio-table-value">
                                                            <span>
                                                                Quantity
                                                            </span>

                                                            <strong>
                                                                {formatAmount(
                                                                    asset.amount
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="portfolio-table-value">
                                                            <span>
                                                                Average buy
                                                            </span>

                                                            <strong>
                                                                $
                                                                {formatPrice(
                                                                    asset.averageBuyPrice
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="portfolio-table-value">
                                                            <span>
                                                                Current price
                                                            </span>

                                                            <strong>
                                                                {asset.price
                                                                    !== null
                                                                    ? `$${formatPrice(
                                                                        asset.price
                                                                    )}`
                                                                    : "Unavailable"}
                                                            </strong>
                                                        </div>

                                                        <div className="portfolio-table-value">
                                                            <span>
                                                                Cost basis
                                                            </span>

                                                            <strong>
                                                                $
                                                                {formatCurrency(
                                                                    asset.investedValue
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="portfolio-table-value">
                                                            <span>
                                                                Current value
                                                            </span>

                                                            <strong className="emphasized">
                                                                $
                                                                {formatCurrency(
                                                                    asset.currentValue
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="portfolio-table-value">
                                                            <span>
                                                                Profit / Loss
                                                            </span>

                                                            <strong
                                                                className={
                                                                    `portfolio-profit-loss ${
                                                                        performanceClass
                                                                    }`
                                                                }
                                                            >
                                                                {formatSignedCurrency(
                                                                    asset
                                                                        .profitLossAmount
                                                                )}
                                                            </strong>

                                                            <small
                                                                className={
                                                                    `portfolio-profit-loss ${
                                                                        performanceClass
                                                                    }`
                                                                }
                                                            >
                                                                {formatSignedPercentage(
                                                                    asset
                                                                        .profitLossPercentage
                                                                )}
                                                            </small>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </article>
                        </section>

                        <section className="portfolio-transactions-panel">
                            <div className="portfolio-panel-heading transaction-heading">
                                <div>
                                    <span className="portfolio-eyebrow">
                                        Activity
                                    </span>

                                    <h2>
                                        Recent transactions
                                    </h2>

                                    <p>
                                        Your completed buy
                                        and sell orders.
                                    </p>
                                </div>

                                <div className="transaction-filters">
                                    {[
                                        "ALL",
                                        "BUY",
                                        "SELL",
                                    ].map(
                                        (filter) => (
                                            <button
                                                type="button"
                                                key={filter}
                                                className={
                                                    transactionFilter
                                                        === filter
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setTransactionFilter(
                                                        filter
                                                    )
                                                }
                                            >
                                                {filter}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {filteredTransactions
                                .length === 0 ? (
                                <div className="portfolio-empty transaction-empty">
                                    <strong>
                                        No matching
                                        transactions
                                    </strong>

                                    <p>
                                        Completed orders
                                        will be displayed
                                        in this section.
                                    </p>
                                </div>
                            ) : (
                                <div className="transactions-table-wrapper">
                                    <table className="transactions-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Order
                                                </th>

                                                <th>
                                                    Asset
                                                </th>

                                                <th>
                                                    Amount
                                                </th>

                                                <th>
                                                    Execution price
                                                </th>

                                                <th>
                                                    Total
                                                </th>

                                                <th>
                                                    Executed at
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredTransactions.map(
                                                (transaction) => (
                                                    <tr
                                                        key={
                                                            transaction.id
                                                        }
                                                    >
                                                        <td>
                                                            <span
                                                                className={
                                                                    transaction.type
                                                                        === "BUY"
                                                                        ? "transaction-badge buy"
                                                                        : "transaction-badge sell"
                                                                }
                                                            >
                                                                <span />

                                                                {
                                                                    transaction.type
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="transaction-asset">
                                                                <span className="portfolio-asset-icon tiny">
                                                                    {getAssetIcon(
                                                                        transaction.symbol
                                                                    )}
                                                                </span>

                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            transaction.symbol
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {getAssetName(
                                                                            transaction.symbol
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {formatAmount(
                                                                transaction.amount
                                                            )}
                                                        </td>

                                                        <td>
                                                            $
                                                            {formatPrice(
                                                                transaction.price
                                                            )}
                                                        </td>

                                                        <td className="transaction-total">
                                                            $
                                                            {formatCurrency(
                                                                getTransactionTotal(
                                                                    transaction
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="transaction-date">
                                                            {formatTransactionDate(
                                                                transaction.executedAt
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default PortfolioPage;