import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

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

function formatCurrency(value) {
    const numericValue = Number(value);

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

function formatPrice(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "Unavailable";
    }

    return numericValue.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        }
    );
}

function formatAmount(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
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

function formatTransactionDate(executedAt) {
    const date = new Date(executedAt);

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

function createPriceMap(marketPrices) {
    if (!Array.isArray(marketPrices)) {
        return new Map();
    }

    return new Map(
        marketPrices.map((marketPrice) => [
            marketPrice.symbol,
            {
                price: Number(marketPrice.price),
                updatedAt: marketPrice.updatedAt,
            },
        ])
    );
}

function findLatestMarketUpdate(marketPrices) {
    if (!Array.isArray(marketPrices)) {
        return null;
    }

    const timestamps = marketPrices
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

function PortfolioPage() {
    const { user } = useAuth();

    const [balance, setBalance] = useState(
        Number(user.balance) || 0
    );

    const [holdings, setHoldings] =
        useState([]);

    const [transactions, setTransactions] =
        useState([]);

    const [priceMap, setPriceMap] =
        useState(new Map());

    const [lastUpdated, setLastUpdated] =
        useState(null);

    const [error, setError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [isRefreshing, setIsRefreshing] =
        useState(false);

    const loadPortfolioData = useCallback(
        async (showInitialLoading = false) => {
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
                    Number(
                        portfolioData.balance
                    )
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
        loadPortfolioData(true);
    }, [loadPortfolioData]);

    const portfolioAssets = useMemo(
        () =>
            holdings
                .map((holding) => {
                    const marketPrice =
                        priceMap.get(
                            holding.symbol
                        );

                    const amount =
                        Number(
                            holding.amount
                        );

                    const price =
                        marketPrice?.price;

                    const hasValidPrice =
                        Number.isFinite(price);

                    return {
                        symbol:
                            holding.symbol,

                       name: getAssetName(
                           holding.symbol
                       ),

                       icon: getAssetIcon(
                           holding.symbol
                       ),

                        amount:
                            Number.isFinite(
                                amount
                            )
                                ? amount
                                : 0,

                        price:
                            hasValidPrice
                                ? price
                                : null,

                        updatedAt:
                            marketPrice?.updatedAt
                            || null,

                        currentValue:
                            hasValidPrice
                                ? amount * price
                                : 0,
                    };
                })
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
                ),
        [holdings, priceMap]
    );

    const cryptoValue = useMemo(
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

    const totalPortfolioValue =
        balance + cryptoValue;

    if (isLoading) {
        return (
            <div className="portfolio-page">
                <Navbar />

                <main className="portfolio-content">
                    <div className="portfolio-state">
                        Loading your portfolio...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="portfolio-page">
            <Navbar />

            <main className="portfolio-content">
                <section className="portfolio-heading">
                    <div>
                        <p className="portfolio-eyebrow">
                            Your investments
                        </p>

                        <h1>
                            Portfolio Overview
                        </h1>

                        <p>
                            Welcome back,{" "}
                            {user.username}.
                            Monitor your balance,
                            digital assets and
                            recent transactions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="portfolio-refresh-button"
                        onClick={() =>
                            loadPortfolioData(false)
                        }
                        disabled={isRefreshing}
                    >
                        {isRefreshing
                            ? "Refreshing..."
                            : "Refresh Portfolio"}
                    </button>
                </section>

                {error && (
                    <div className="portfolio-error">
                        {error}
                    </div>
                )}

                <section className="summary-grid">
                    <article className="summary-card">
                        <span>
                            Cash Balance
                        </span>

                        <strong>
                            $
                            {formatCurrency(
                                balance
                            )}
                        </strong>

                        <small>
                            Available for trading
                        </small>
                    </article>

                    <article className="summary-card">
                        <span>
                            Crypto Value
                        </span>

                        <strong>
                            $
                            {formatCurrency(
                                cryptoValue
                            )}
                        </strong>

                        <small>
                            Current market value
                        </small>
                    </article>

                    <article className="summary-card highlight-card">
                        <span>
                            Total Portfolio Value
                        </span>

                        <strong>
                            $
                            {formatCurrency(
                                totalPortfolioValue
                            )}
                        </strong>

                        <small>
                            Cash and digital assets
                        </small>
                    </article>
                </section>

                <section className="portfolio-section">
                    <div className="section-title">
                        <div>
                            <h2>Your Assets</h2>

                            <p>
                                Current cryptocurrency
                                holdings
                                {lastUpdated
                                    ? ` · Prices updated at ${lastUpdated.toLocaleTimeString()}`
                                    : ""}
                            </p>
                        </div>
                    </div>

                    {portfolioAssets.length === 0 ? (
                        <div className="portfolio-state">
                            You do not currently own
                            any cryptocurrency.
                        </div>
                    ) : (
                        <div className="asset-grid">
                            {portfolioAssets.map(
                                (asset) => (
                                    <article
                                        className="asset-card"
                                        key={
                                            asset.symbol
                                        }
                                    >
                                        <div className="asset-card-top">
                                            <div className="asset-identity">
                                                <div className="asset-icon">
                                                    {asset.icon}
                                                </div>

                                                <div>
                                                    <h3>
                                                        {asset.symbol}
                                                    </h3>

                                                    <p>
                                                        {asset.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="asset-live">
                                                Live price
                                            </span>
                                        </div>

                                        <div className="asset-details">
                                            <div>
                                                <span>
                                                    Quantity
                                                </span>

                                                <strong>
                                                    {formatAmount(
                                                        asset.amount
                                                    )}{" "}
                                                    {asset.symbol}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Current Price
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

                                            <div>
                                                <span>
                                                    Current Value
                                                </span>

                                                <strong>
                                                    $
                                                    {formatCurrency(
                                                        asset.currentValue
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>

                <section className="portfolio-section">
                    <div className="section-title">
                        <div>
                            <h2>
                                Recent Transactions
                            </h2>

                            <p>
                                Your latest buy and
                                sell operations
                            </p>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="portfolio-state">
                            You have not completed
                            any transactions yet.
                        </div>
                    ) : (
                        <div className="transactions-table-wrapper">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Asset</th>
                                        <th>Amount</th>
                                        <th>
                                            Execution Price
                                        </th>
                                        <th>Total</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map(
                                        (
                                            transaction
                                        ) => (
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
                                                        {
                                                            transaction.type
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        transaction.symbol
                                                    }
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

                                                <td>
                                                    $
                                                    {formatCurrency(
                                                        transaction.total
                                                    )}
                                                </td>

                                                <td>
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
            </main>
        </div>
    );
}

export default PortfolioPage;