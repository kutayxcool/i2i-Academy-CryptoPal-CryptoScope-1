import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/AiChat.css";
import { mockStarterMessages } from "../mock/mockData";
import { useAuth } from "../context/AuthContext";

function AiChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            ...mockStarterMessages[0],
            content: `Hello ${user.username} 👋 I can help you review your portfolio, recent transactions and market trends.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const createMockResponse = (question) => {
        const normalizedQuestion = question.toLowerCase();

        if (normalizedQuestion.includes("portfolio")) {
            return "Your portfolio currently contains BTC and ETH. BTC represents the larger share of your crypto holdings. Based on the mock values, your total portfolio value is approximately $42,588.71.";
        }

        if (
            normalizedQuestion.includes("transaction") ||
            normalizedQuestion.includes("işlem")
        ) {
            return "Your recent activity includes BTC and ETH buy and sell operations. When the backend is connected, I will summarize your real transaction history from PostgreSQL.";
        }

        if (
            normalizedQuestion.includes("btc") ||
            normalizedQuestion.includes("bitcoin")
        ) {
            return "Bitcoin is currently your largest digital asset position. Its price is being displayed from mock market data for now. Later, the latest value will come from Redis through CryptoScope Core.";
        }

        if (
            normalizedQuestion.includes("eth") ||
            normalizedQuestion.includes("ethereum")
        ) {
            return "Ethereum forms a smaller part of your current mock portfolio. Future responses will combine live prices, historical trends and your account details.";
        }

        return "This is a temporary mock AI response. After the Gemini integration is ready, your question will be sent to the backend together with your portfolio, latest prices and recent transactions.";
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmedInput = input.trim();

        if (!trimmedInput || isLoading) {
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: trimmedInput,
        };

        setMessages((currentMessages) => [
            ...currentMessages,
            userMessage,
        ]);

        setInput("");
        setIsLoading(true);

        window.setTimeout(() => {
            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content: createMockResponse(trimmedInput),
            };

            setMessages((currentMessages) => [
                ...currentMessages,
                assistantMessage,
            ]);

            setIsLoading(false);
        }, 900);
    };

    return (
        <div className="ai-page">
            <Navbar />

            <main className="ai-content">
                <section className="ai-heading">
                    <div>
                        <p className="ai-eyebrow">Intelligent insights</p>
                        <h1>CryptoScope AI Assistant</h1>
                        <p>
                            Ask questions about your account, portfolio, transactions
                            and recent market movements.
                        </p>
                    </div>

                    <div className="ai-status">
                        <span className="status-dot" />
                        Mock AI active
                    </div>
                </section>

                <section className="chat-layout">
                    <aside className="chat-sidebar">
                        <h2>Suggested Questions</h2>

                        <button
                            type="button"
                            onClick={() =>
                                setInput("Can you summarize my portfolio?")
                            }
                        >
                            Summarize my portfolio
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setInput("What are my recent transactions?")
                            }
                        >
                            Show recent transactions
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setInput("What is my Bitcoin position?")
                            }
                        >
                            Review my BTC position
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setInput("How is Ethereum performing?")
                            }
                        >
                            Review Ethereum
                        </button>

                        <div className="ai-info-card">
                            <span>Current mode</span>
                            <strong>Frontend mock response</strong>
                            <p>
                                Gemini responses will be connected through the backend API.
                            </p>
                        </div>
                    </aside>

                    <section className="chat-panel">
                        <div className="chat-messages">
                            {messages.map((message) => (
                                <div
                                    className={`chat-message ${message.role}`}
                                    key={message.id}
                                >
                                    {message.role === "assistant" && (
                                        <div className="message-avatar">AI</div>
                                    )}

                                    <div className="message-content">
                                        <span>
                                            {message.role === "assistant"
                                                ? "CryptoScope AI"
                                                : "You"}
                                        </span>

                                        <p>{message.content}</p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="chat-message assistant">
                                    <div className="message-avatar">AI</div>

                                    <div className="message-content">
                                        <span>CryptoScope AI</span>

                                        <div className="typing-indicator">
                                            <i />
                                            <i />
                                            <i />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="chat-form" onSubmit={handleSubmit}>
                            <textarea
                                rows="2"
                                placeholder="Ask something about your portfolio..."
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        handleSubmit(event);
                                    }
                                }}
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                            >
                                {isLoading ? "Thinking..." : "Ask AI"}
                            </button>
                        </form>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default AiChatPage;