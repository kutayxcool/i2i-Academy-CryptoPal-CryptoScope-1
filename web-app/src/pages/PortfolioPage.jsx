import Navbar from "../components/Navbar";
import "../styles/Portfolio.css";
import { mockPortfolio } from "../mock/mockData";
import { useAuth } from "../context/AuthContext";

const portfolioAssets = mockPortfolio;

const recentTransactions = [
    {
        id: 1,
        type: "BUY",
        symbol: "BTC",
        quantity: 0.1,
        price: 64000,
        date: "14 July 2026, 13:40",
    },
    {
        id: 2,
        type: "SELL",
        symbol: "ETH",
        quantity: 0.5,
        price: 3380,
        date: "13 July 2026, 17:15",
    },
    {
        id: 3,
        type: "BUY",
        symbol: "ETH",
        quantity: 1.2,
        price: 3290,
        date: "12 July 2026, 10:20",
    },
];

function PortfolioPage() {
    const { user } = useAuth();
    const cashBalance = user.balance;
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