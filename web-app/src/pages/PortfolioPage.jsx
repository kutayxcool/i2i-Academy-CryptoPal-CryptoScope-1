import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Portfolio.css";
import { useAuth } from "../context/AuthContext";
import { getPortfolio, getTransactions } from "../services/portfolioService";
import { getMarketPrices } from "../services/marketService";

const CRYPTO_NAMES = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "BNB",
    SOL: "Solana",
    XRP: "XRP",
};

function normalizePriceMap(raw) {
    if (Array.isArray(raw)) {
        return Object.fromEntries(raw.map((item) => [item.symbol, Number(item.price)]));
    }

    if (raw && typeof raw === "object") {
        return Object.fromEntries(
            Object.entries(raw).map(([symbol, price]) => [symbol, Number(price)])
        );
    }

    return {};
}

function PortfolioPage() {
    const { user } = useAuth();
    const [portfolioAssets, setPortfolioAssets] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [cashBalance, setCashBalance] = useState(user.balance);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        setError("");

        Promise.all([getPortfolio(), getTransactions(), getMarketPrices()])
            .then(([portfolioRes, transactionsRes, pricesRes]) => {
                const priceMap = normalizePriceMap(pricesRes.data);

                setCashBalance(Number(portfolioRes.data.balance));

                setPortfolioAssets(
                    (portfolioRes.data.holdings || []).map((holding) => {
                        const price = priceMap[holding.symbol] ?? 0;

                        return {
                            symbol: holding.symbol,
                            name: CRYPTO_NAMES[holding.symbol] ?? holding.symbol,
                            quantity: Number(holding.amount),
                            price,
                            change: 0,
                        };
                    })
                );

                setRecentTransactions(
                    transactionsRes.data.map((tx) => ({
                        id: tx.id,
                        type: tx.type,
                        symbol: tx.symbol,
                        quantity: Number(tx.amount),
                        price: Number(tx.price),
                        date: new Date(tx.executedAt).toLocaleString("en-US"),
                    }))
                );
            })
            .catch((err) => {
                console.error("Portfolio error:", err);
                setError("Portfolio could not be loaded.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const cryptoValue = portfolioAssets.reduce(
        (total, asset) => total + asset.quantity * asset.price,
        0
    );

    const totalPortfolioValue = cashBalance + cryptoValue;

    return (
        <div className="portfolio-page">
            <Navbar />

            <main className="portfolio-content">
                <section className="portfolio-heading">
                    <div>
                        <p className="portfolio-eyebrow">Your investments</p>
                        <h1>Portfolio Overview</h1>
                        <p>
                            Welcome back, {user.username}. Monitor your balance,
                            digital assets and recent transactions.
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="dashboard-message" style={{ marginBottom: "16px" }}>
                        {error}{" "}
                        <button type="button" onClick={loadData}>
                            Try Again
                        </button>
                    </div>
                )}

                {loading && !error && <p>Loading portfolio...</p>}

                <section className="summary-grid">
                    <article className="summary-card">
                        <span>Cash Balance</span>
                        <strong>
                            ${cashBalance.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                            })}
                        </strong>
                        <small>Available for trading</small>
                    </article>

                    <article className="summary-card">
                        <span>Crypto Value</span>
                        <strong>
                            ${cryptoValue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                        <small>Current market value</small>
                    </article>

                    <article className="summary-card highlight-card">
                        <span>Total Portfolio Value</span>
                        <strong>
                            ${totalPortfolioValue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                        <small>Cash and digital assets</small>
                    </article>
                </section>

                <section className="portfolio-section">
                    <div className="section-title">
                        <div>
                            <h2>Your Assets</h2>
                            <p>Current cryptocurrency holdings</p>
                        </div>
                    </div>

                    <div className="asset-grid">
                        {portfolioAssets.map((asset) => {
                            const currentValue = asset.quantity * asset.price;
                            const isPositive = asset.change >= 0;

                            return (
                                <article className="asset-card" key={asset.symbol}>
                                    <div className="asset-card-top">
                                        <div className="asset-identity">
                                            <div className="asset-icon">
                                                {asset.symbol === "BTC" ? "₿" : "Ξ"}
                                            </div>

                                            <div>
                                                <h3>{asset.symbol}</h3>
                                                <p>{asset.name}</p>
                                            </div>
                                        </div>

                                        <span
                                            className={
                                                isPositive
                                                    ? "asset-change positive"
                                                    : "asset-change negative"
                                            }
                                        >
                                            {isPositive ? "+" : ""}
                                            {asset.change}%
                                        </span>
                                    </div>

                                    <div className="asset-details">
                                        <div>
                                            <span>Quantity</span>
                                            <strong>
                                                {asset.quantity} {asset.symbol}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Current Price</span>
                                            <strong>
                                                $
                                                {asset.price.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Current Value</span>
                                            <strong>
                                                $
                                                {currentValue.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </strong>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="portfolio-section">
                    <div className="section-title">
                        <div>
                            <h2>Recent Transactions</h2>
                            <p>Your latest buy and sell operations</p>
                        </div>
                    </div>

                    <div className="transactions-table-wrapper">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Asset</th>
                                    <th>Quantity</th>
                                    <th>Execution Price</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTransactions.map((transaction) => {
                                    const total =
                                        transaction.quantity * transaction.price;

                                    return (
                                        <tr key={transaction.id}>
                                            <td>
                                                <span
                                                    className={
                                                        transaction.type === "BUY"
                                                            ? "transaction-badge buy"
                                                            : "transaction-badge sell"
                                                    }
                                                >
                                                    {transaction.type}
                                                </span>
                                            </td>

                                            <td>{transaction.symbol}</td>

                                            <td>{transaction.quantity}</td>

                                            <td>
                                                $
                                                {transaction.price.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>

                                            <td>
                                                $
                                                {total.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>

                                            <td>{transaction.date}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default PortfolioPage;