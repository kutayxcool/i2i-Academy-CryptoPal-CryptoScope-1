import {
    useEffect,
    useRef,
    useState,
} from "react";

import Navbar from "../components/Navbar";

import {
    askAi,
} from "../services/aiService";

import {
    useAuth,
} from "../context/AuthContext";

import "../styles/AiChat.css";

const MAX_QUESTION_LENGTH = 1000;

function createMessageId(role) {
    return `${role}-${Date.now()}-${Math.random()}`;
}

function getApiErrorMessage(
    requestError,
    fallbackMessage
) {
    return requestError.response?.data
        ?.error?.message
        || requestError.message
        || fallbackMessage;
}

function AiChatPage() {
    const { user } = useAuth();

    const [messages, setMessages] = useState(
        () => [
            {
                id: createMessageId("assistant"),
                role: "assistant",
                content:
                    `Hello ${user.username} 👋 `
                    + "I can help you review your "
                    + "portfolio, recent transactions "
                    + "and current market prices.",
            },
        ]
    );

    const [input, setInput] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const messagesEndRef =
        useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, isLoading, error]);

    const selectSuggestedQuestion = (
        question
    ) => {
        if (isLoading) {
            return;
        }

        setInput(question);
        setError("");
    };

    const submitQuestion = async () => {
        const trimmedInput =
            input.trim();

        if (!trimmedInput || isLoading) {
            return;
        }

        if (
            trimmedInput.length
            > MAX_QUESTION_LENGTH
        ) {
            setError(
                "Question must not exceed 1000 characters."
            );
            return;
        }

        const userMessage = {
            id: createMessageId("user"),
            role: "user",
            content: trimmedInput,
        };

        setMessages((currentMessages) => [
            ...currentMessages,
            userMessage,
        ]);

        setInput("");
        setError("");
        setIsLoading(true);

        try {
            const response =
                await askAi(trimmedInput);

            const answer =
                response.data?.answer;

            if (
                typeof answer !== "string"
                || !answer.trim()
            ) {
                throw new Error(
                    "AI service returned an empty answer"
                );
            }

            const assistantMessage = {
                id: createMessageId(
                    "assistant"
                ),
                role: "assistant",
                content: answer.trim(),
            };

            setMessages(
                (currentMessages) => [
                    ...currentMessages,
                    assistantMessage,
                ]
            );
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "AI service is temporarily unavailable"
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        await submitQuestion();
    };

    const handleKeyDown = async (event) => {
        if (
            event.key === "Enter"
            && !event.shiftKey
        ) {
            event.preventDefault();

            await submitQuestion();
        }
    };

    const clearConversation = () => {
        if (isLoading) {
            return;
        }

        setMessages([
            {
                id: createMessageId(
                    "assistant"
                ),
                role: "assistant",
                content:
                    `Hello ${user.username} 👋 `
                    + "How can I help you with "
                    + "your CryptoScope account?",
            },
        ]);

        setInput("");
        setError("");
    };

    return (
        <div className="ai-page">
            <Navbar />

            <main className="ai-content">
                <section className="ai-heading">
                    <div>
                        <p className="ai-eyebrow">
                            Intelligent insights
                        </p>

                        <h1>
                            CryptoScope AI Assistant
                        </h1>

                        <p>
                            Ask questions about your
                            account, portfolio,
                            transactions and current
                            market information.
                        </p>
                    </div>

                    <div
                        className={
                            error
                                ? "ai-status error"
                                : "ai-status"
                        }
                    >
                        <span
                            className={
                                error
                                    ? "status-dot error"
                                    : "status-dot"
                            }
                        />

                        {isLoading
                            ? "AI is thinking"
                            : error
                                ? "AI unavailable"
                                : "AI assistant ready"}
                    </div>
                </section>

                <section className="chat-layout">
                    <aside className="chat-sidebar">
                        <h2>
                            Suggested Questions
                        </h2>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                                selectSuggestedQuestion(
                                    "Can you summarize my portfolio?"
                                )
                            }
                        >
                            Summarize my portfolio
                        </button>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                                selectSuggestedQuestion(
                                    "What are my recent transactions?"
                                )
                            }
                        >
                            Show recent transactions
                        </button>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                                selectSuggestedQuestion(
                                    "What is my current Bitcoin position?"
                                )
                            }
                        >
                            Review my BTC position
                        </button>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                                selectSuggestedQuestion(
                                    "Portföyümü ve nakit bakiyemi Türkçe olarak özetler misin?"
                                )
                            }
                        >
                            Türkçe portfolio özeti
                        </button>

                        <button
                            type="button"
                            className="clear-chat-button"
                            disabled={isLoading}
                            onClick={clearConversation}
                        >
                            Clear conversation
                        </button>

                        <div className="ai-info-card">
                            <span>
                                Current mode
                            </span>

                            <strong>
                                Live backend context
                            </strong>

                            <p>
                                Answers are generated
                                using your current cash
                                balance, holdings,
                                recent transactions and
                                live market prices.
                            </p>
                        </div>
                    </aside>

                    <section className="chat-panel">
                        <div
                            className="chat-messages"
                            aria-live="polite"
                        >
                            {messages.map(
                                (message) => (
                                    <div
                                        className={
                                            `chat-message ${message.role}`
                                        }
                                        key={message.id}
                                    >
                                        {message.role
                                            === "assistant" && (
                                            <div className="message-avatar">
                                                AI
                                            </div>
                                        )}

                                        <div className="message-content">
                                            <span>
                                                {message.role
                                                    === "assistant"
                                                    ? "CryptoScope AI"
                                                    : "You"}
                                            </span>

                                            <p>
                                                {
                                                    message.content
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}

                            {isLoading && (
                                <div className="chat-message assistant">
                                    <div className="message-avatar">
                                        AI
                                    </div>

                                    <div className="message-content">
                                        <span>
                                            CryptoScope AI
                                        </span>

                                        <div className="typing-indicator">
                                            <i />
                                            <i />
                                            <i />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div
                                    className="ai-chat-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            <div
                                ref={messagesEndRef}
                            />
                        </div>

                        <form
                            className="chat-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="chat-input-wrapper">
                                <textarea
                                    rows="2"
                                    maxLength={
                                        MAX_QUESTION_LENGTH
                                    }
                                    placeholder="Ask something about your portfolio..."
                                    value={input}
                                    onChange={(event) => {
                                        setInput(
                                            event.target.value
                                        );

                                        if (error) {
                                            setError("");
                                        }
                                    }}
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    disabled={isLoading}
                                />

                                <small className="question-counter">
                                    {input.length}
                                    /
                                    {
                                        MAX_QUESTION_LENGTH
                                    }
                                </small>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    !input.trim()
                                    || isLoading
                                }
                            >
                                {isLoading
                                    ? "Thinking..."
                                    : "Ask AI"}
                            </button>
                        </form>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default AiChatPage;