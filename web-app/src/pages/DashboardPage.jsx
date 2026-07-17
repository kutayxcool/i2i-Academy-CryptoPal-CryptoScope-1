import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CryptoCard from "../components/CryptoCard";
import TradeModal from "../components/TradeModal";
import "../styles/Dashboard.css";
import { getMarketPrices } from "../services/marketService";
import { buyCrypto, sellCrypto } from "../services/tradeService";
import { useAuth } from "../context/AuthContext";

// Binance sembollerine karşılık gelen görünen isimler (backend sadece symbol/price dönüyorsa kullanılır)
const CRYPTO_NAMES = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "BNB",
    SOL: "Solana",
    XRP: "XRP",
};

// Backend cevabı array ([{symbol, price}, ...]) veya obje ({BTC: 65000, ...}) olabilir, ikisini de destekle
function normalizePrices(raw, previousCryptos) {
    const prevMap = new Map(previousCryptos.map((c) => [c.symbol, c]));
    let list = [];

    if (Array.isArray(raw)) {
        list = raw;
    } else if (raw && typeof raw === "object") {
        list = Object.entries(raw).map(([symbol, price]) => ({ symbol, price }));
    }

    return list.map((item) => {
        const symbol = item.symbol ?? item.asset ?? item.name;
        const price = Number(item.price ?? item.value ?? 0);
        const prev = prevMap.get(symbol);
        const change =
            prev && prev.price
                ? Number((((price - prev.price) / prev.price) * 100).toFixed(2))
                : 0;

        return {
            symbol,
            name: CRYPTO_NAMES[symbol] ?? symbol,
            price,
            change,
        };
    });
}

function DashboardPage() {
    const { user, login } = useAuth();
    const [cryptos, setCryptos] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [tradeType, setTradeType] = useState("buy");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const refreshPrices = () => {
        getMarketPrices()
            .then((res) => {
                setCryptos((current) => normalizePrices(res.data, current));
                setLastUpdated(new Date());
            })
            .catch((err) => {
                console.error("Market prices error:", err);
                setMessage("Fiyatlar yüklenemedi. Backend çalışıyor mu kontrol et.");
            });
    };

    useEffect(() => {
        refreshPrices();
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

    const handleConfirmTrade = async (order) => {
        setLoading(true);
        setMessage("");

        const payload = {
            symbol: order.crypto.symbol,
            amount: order.amount,
        };

        try {
            const apiCall = order.type === "buy" ? buyCrypto : sellCrypto;
            const res = await apiCall(payload);

            // Backend güncel bakiyeyi dönüyorsa onu kullan, dönmüyorsa tahmini hesapla
            const newBalance =
                res.data?.balance ??
                res.data?.newBalance ??
                (order.type === "buy"
                    ? user.balance - order.total
                    : user.balance + order.total);

            login({ ...user, balance: newBalance });

            setMessage(
                `${order.type === "buy" ? "Buy" : "Sell"} order successful for ${order.amount} ${order.crypto.symbol}.`
            );

            closeTradeModal();
        } catch (err) {
            console.error("Trade error:", err);
            const backendMessage = err.response?.data?.message;
            setMessage(backendMessage || "İşlem başarısız oldu. Tekrar dene.");
        } finally {
            setLoading(false);
        }
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
                loading={loading}
            />
        </div>
    );
}

export default DashboardPage;
