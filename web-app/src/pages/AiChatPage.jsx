import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/AiChat.css";
import { useAuth } from "../context/AuthContext";
import { askAi } from "../services/aiService";

function AiChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            content: `Hello ${user.username} 👋 I can help you review your portfolio, recent transactions and market trends.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
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

        try {
            const res = await askAi(trimmedInput);

            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content: res.data.answer,
            };

            setMessages((currentMessages) => [
                ...currentMessages,
                assistantMessage,
            ]);
        } catch (err) {
            console.error("AI chat error:", err);

            const backendMessage = err.response?.data?.message;

            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    backendMessage ||
                    "Sorry, I couldn't get a response right now. Please try again.",
            };

            setMessages((currentMessages) => [
                ...currentMessages,
                assistantMessage,
            ]);
        } finally {
            setIsLoading(false);
        }
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
                        Gemini AI active
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
                            <strong>Live Gemini response</strong>
                            <p>
                                Answers are generated using your real portfolio and market data.
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