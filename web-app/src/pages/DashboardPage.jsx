import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CryptoCard from "../components/CryptoCard";
import TradeModal from "../components/TradeModal";
import "../styles/Dashboard.css";
import { mockMarketPrices } from "../mock/mockData";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
    const { user } = useAuth();
    const [cryptos, setCryptos] = useState(mockMarketPrices);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [tradeType, setTradeType] = useState("buy");
    const [message, setMessage] = useState("");

    const refreshPrices = () => {
        setCryptos((currentCryptos) =>
            currentCryptos.map((crypto) => {
                const changeRatio = (Math.random() - 0.5) * 0.01;
                const newPrice = crypto.price * (1 + changeRatio);

                return {
                    ...crypto,
                    price: Number(newPrice.toFixed(2)),
                    change: Number((changeRatio * 100).toFixed(2)),
                };
            })
        );

        setLastUpdated(new Date());
    };

    useEffect(() => {
        const intervalId = setInterval(refreshPrices, 15000);

        return () => clearInterval(intervalId);
    }, []);

    const openTradeModal = (crypto, type) => {
        setSelectedCrypto(crypto);
        setTradeType(type);
        setMessage("");
    };

    const closeTradeModal = () => {
        setSelectedCrypto(null);
    };

    const handleConfirmTrade = (order) => {
        console.log("Mock order:", order);

        setMessage(
            `${order.type === "buy" ? "Buy" : "Sell"} order created for ${order.amount
            } ${order.crypto.symbol}.`
        );

        closeTradeModal();
    };

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-content">
                <section className="dashboard-hero">
                    <div>
                        <p className="dashboard-eyebrow">Market overview</p>
                        <h1>Welcome back, {user.username}</h1>
                        <p>
                            Track live prices and manage your crypto portfolio.
                        </p>
                    </div>

                    <div className="wallet-card">
                        <span>Wallet Balance</span>
                        <strong>${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        <small>Mock balance</small>
                    </div>
                </section>

                <section className="market-section">
                    <div className="market-header">
                        <div>
                            <h2>Live Market</h2>
                            <p>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>

                        <button type="button" onClick={refreshPrices}>
                            Refresh Prices
                        </button>
                    </div>

                    {message && <div className="dashboard-message">{message}</div>}

                    <div className="crypto-grid">
                        {cryptos.map((crypto) => (
                            <CryptoCard
                                key={crypto.symbol}
                                crypto={crypto}
                                onBuy={() => openTradeModal(crypto, "buy")}
                                onSell={() => openTradeModal(crypto, "sell")}
                            />
                        ))}
                    </div>
                </section>
            </main>

            <TradeModal
                isOpen={Boolean(selectedCrypto)}
                type={tradeType}
                crypto={selectedCrypto}
                onClose={closeTradeModal}
                onConfirm={handleConfirmTrade}
            />
        </div>
    );
}

export default DashboardPage;