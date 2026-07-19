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

const SUGGESTED_QUESTIONS = [
    {
        category: "Portfolio",
        title: "Summarize my portfolio",
        question:
            "Can you summarize my portfolio and explain my largest positions?",
    },
    {
        category: "Activity",
        title: "Review recent transactions",
        question:
            "What are my recent transactions and what do they show about my trading activity?",
    },
    {
        category: "Position",
        title: "Analyze my Bitcoin position",
        question:
            "What is my current Bitcoin position and what percentage of my crypto holdings does it represent?",
    },
    {
        category: "Balance",
        title: "Review available cash",
        question:
            "How much cash do I currently have available and how does it compare with my crypto holdings?",
    },
    {
        category: "Market",
        title: "Compare current prices",
        question:
            "Compare the current prices of the crypto assets supported by CryptoScope.",
    },
    {
        category: "Türkçe",
        title: "Portföyümü Türkçe özetle",
        question:
            "Portföyümü, nakit bakiyemi ve son işlemlerimi Türkçe olarak özetler misin?",
    },
];

function createMessageId(role) {
    return (
        `${role}-${Date.now()}-`
        + `${Math.random()}`
    );
}

function createWelcomeMessage(user) {
    const displayName =
        user.firstName
        || user.fullName
        || user.username;

    return {
        id: createMessageId(
            "assistant"
        ),
        role: "assistant",
        content:
            `Hello ${displayName}. `
            + "I can review your portfolio, "
            + "cash balance, recent transactions "
            + "and current market prices. "
            + "What would you like to explore?",
        createdAt:
            new Date().toISOString(),
    };
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

function formatMessageTime(createdAt) {
    const date =
        new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

function createInitials(user) {
    const firstName =
        user.firstName?.trim() || "";

    const lastName =
        user.lastName?.trim() || "";

    if (firstName || lastName) {
        return (
            `${firstName.charAt(0)}`
            + `${lastName.charAt(0)}`
        ).toUpperCase();
    }

    return (
        user.username
            ?.slice(0, 2)
            .toUpperCase()
        || "CS"
    );
}

function AiAvatar() {
    return (
        <span className="ai-message-avatar assistant">
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                />

                <path
                    d="M18.3 15L19 17.2L21.2 18L19 18.8L18.3 21L17.5 18.8L15.3 18L17.5 17.2L18.3 15Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                />
            </svg>
        </span>
    );
}

function AiChatPage() {
    const {
        user,
    } = useAuth();

    const [
        messages,
        setMessages,
    ] = useState(
        () => [
            createWelcomeMessage(user),
        ]
    );

    const [
        input,
        setInput,
    ] = useState("");

    const [
        isLoading,
        setIsLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        copiedMessageId,
        setCopiedMessageId,
    ] = useState("");

    const messagesEndRef =
        useRef(null);

    const textareaRef =
        useRef(null);

    const displayName =
        user.fullName
        || [
            user.firstName,
            user.lastName,
        ]
            .filter(Boolean)
            .join(" ")
        || user.username;

    const questionCount =
        messages.filter(
            (message) =>
                message.role === "user"
        ).length;

    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth",
            });
    }, [
        messages,
        isLoading,
        error,
    ]);

    const selectSuggestedQuestion = (
        question
    ) => {
        if (isLoading) {
            return;
        }

        setInput(question);
        setError("");

        window.setTimeout(
            () => {
                textareaRef.current
                    ?.focus();
            },
            0
        );
    };

    const submitQuestion = async () => {
        const trimmedInput =
            input.trim();

        if (
            !trimmedInput
            || isLoading
        ) {
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
            id: createMessageId(
                "user"
            ),
            role: "user",
            content: trimmedInput,
            createdAt:
                new Date().toISOString(),
        };

        setMessages(
            (currentMessages) => [
                ...currentMessages,
                userMessage,
            ]
        );

        setInput("");
        setError("");
        setCopiedMessageId("");
        setIsLoading(true);

        try {
            const response =
                await askAi(
                    trimmedInput
                );

            const answer =
                response.data?.answer;

            if (
                typeof answer
                    !== "string"
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
                content:
                    answer.trim(),
                createdAt:
                    new Date()
                        .toISOString(),
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

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        await submitQuestion();
    };

    const handleKeyDown = async (
        event
    ) => {
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
            createWelcomeMessage(user),
        ]);

        setInput("");
        setError("");
        setCopiedMessageId("");
    };

    const copyMessage = async (
        message
    ) => {
        try {
            await navigator.clipboard
                .writeText(
                    message.content
                );

            setCopiedMessageId(
                message.id
            );
        } catch {
            setError(
                "The response could not be copied."
            );
        }
    };

    return (
        <div className="ai-page">
            <Navbar />

            <main className="ai-content">
                <section className="ai-hero">
                    <div className="ai-hero-copy">
                        <span className="ai-eyebrow">
                            AI workspace
                        </span>

                        <h1>
                            Your portfolio and
                            market
                            <span>
                                {" "}
                                copilot
                            </span>
                        </h1>

                        <p>
                            Ask account-aware questions
                            using your current balance,
                            cryptocurrency holdings,
                            recent transactions and live
                            market information.
                        </p>
                    </div>

                    <article className="ai-hero-status-card">
                        <div className="ai-status-card-header">
                            <div className="ai-status-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinejoin="round"
                                        strokeWidth="1.6"
                                    />

                                    <path
                                        d="M18 15L18.7 17.2L21 18L18.7 18.8L18 21L17.2 18.8L15 18L17.2 17.2L18 15Z"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinejoin="round"
                                        strokeWidth="1.4"
                                    />
                                </svg>
                            </div>

                            <div>
                                <span>
                                    CryptoScope AI
                                </span>

                                <strong>
                                    Context-aware assistant
                                </strong>
                            </div>

                            <span
                                className={
                                    error
                                        ? "ai-assistant-status error"
                                        : isLoading
                                            ? "ai-assistant-status thinking"
                                            : "ai-assistant-status ready"
                                }
                            >
                                <span />

                                {error
                                    ? "Unavailable"
                                    : isLoading
                                        ? "Thinking"
                                        : "Ready"}
                            </span>
                        </div>

                        <div className="ai-context-summary">
                            <div>
                                <span>
                                    Account
                                </span>

                                <strong>
                                    Connected
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Market data
                                </span>

                                <strong>
                                    Live context
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Conversation
                                </span>

                                <strong>
                                    {questionCount}
                                    {" "}
                                    {questionCount === 1
                                        ? "question"
                                        : "questions"}
                                </strong>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="ai-workspace">
                    <aside className="ai-sidebar">
                        <div className="ai-sidebar-heading">
                            <span className="ai-eyebrow">
                                Quick start
                            </span>

                            <h2>
                                Suggested prompts
                            </h2>

                            <p>
                                Select a question and
                                customize it before
                                sending.
                            </p>
                        </div>

                        <div className="ai-prompt-list">
                            {SUGGESTED_QUESTIONS.map(
                                (
                                    suggestion
                                ) => (
                                    <button
                                        type="button"
                                        className="ai-prompt-button"
                                        key={
                                            suggestion.title
                                        }
                                        disabled={
                                            isLoading
                                        }
                                        onClick={() =>
                                            selectSuggestedQuestion(
                                                suggestion.question
                                            )
                                        }
                                    >
                                        <div>
                                            <span>
                                                {
                                                    suggestion.category
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    suggestion.title
                                                }
                                            </strong>
                                        </div>

                                        <svg
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M6 10H14M10.5 6.5L14 10L10.5 13.5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.6"
                                            />
                                        </svg>
                                    </button>
                                )
                            )}
                        </div>

                        <div className="ai-context-card">
                            <div className="ai-context-card-heading">
                                <span className="ai-context-card-icon">
                                    <svg
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M10 2.5L16 5.3V9.4C16 13.1 13.6 16.1 10 17.5C6.4 16.1 4 13.1 4 9.4V5.3L10 2.5Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                </span>

                                <div>
                                    <span>
                                        Secure context
                                    </span>

                                    <strong>
                                        What the AI can use
                                    </strong>
                                </div>
                            </div>

                            <div className="ai-context-list">
                                <div>
                                    <span>
                                        Cash balance
                                    </span>

                                    <strong>
                                        $
                                        {formatCurrency(
                                            user.balance
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Portfolio
                                    </span>

                                    <strong>
                                        Current holdings
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Activity
                                    </span>

                                    <strong>
                                        Recent transactions
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Market
                                    </span>

                                    <strong>
                                        Current prices
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="ai-clear-button"
                            disabled={
                                isLoading
                            }
                            onClick={
                                clearConversation
                            }
                        >
                            <svg
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5.5 6H14.5M8 6V4.5H12V6M7 8.5V14M10 8.5V14M13 8.5V14M6 6L6.7 16H13.3L14 6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                />
                            </svg>

                            Clear conversation
                        </button>
                    </aside>

                    <section className="ai-chat-panel">
                        <header className="ai-chat-header">
                            <div className="ai-chat-agent">
                                <span className="ai-chat-agent-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinejoin="round"
                                            strokeWidth="1.6"
                                        />
                                    </svg>
                                </span>

                                <div>
                                    <strong>
                                        CryptoScope AI
                                    </strong>

                                    <span>
                                        Portfolio and
                                        market assistant
                                    </span>
                                </div>
                            </div>

                            <div className="ai-chat-header-meta">
                                <span>
                                    Signed in as
                                </span>

                                <strong>
                                    {displayName}
                                </strong>
                            </div>
                        </header>

                        <div
                            className="ai-chat-messages"
                            aria-live="polite"
                        >
                            {messages.map(
                                (message) => (
                                    <article
                                        className={
                                            `ai-message ${message.role}`
                                        }
                                        key={
                                            message.id
                                        }
                                    >
                                        {message.role
                                            === "assistant" && (
                                            <AiAvatar />
                                        )}

                                        <div className="ai-message-body">
                                            <div className="ai-message-meta">
                                                <div>
                                                    <strong>
                                                        {message.role
                                                            === "assistant"
                                                            ? "CryptoScope AI"
                                                            : displayName}
                                                    </strong>

                                                    <span>
                                                        {formatMessageTime(
                                                            message.createdAt
                                                        )}
                                                    </span>
                                                </div>

                                                {message.role
                                                    === "assistant" && (
                                                    <button
                                                        type="button"
                                                        className="ai-copy-button"
                                                        onClick={() =>
                                                            void copyMessage(
                                                                message
                                                            )
                                                        }
                                                        title="Copy response"
                                                    >
                                                        {copiedMessageId
                                                            === message.id
                                                            ? (
                                                                <>
                                                                    <span>
                                                                        ✓
                                                                    </span>
                                                                    Copied
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    <svg
                                                                        viewBox="0 0 20 20"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <rect
                                                                            x="6"
                                                                            y="6"
                                                                            width="9"
                                                                            height="10"
                                                                            rx="1.5"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.4"
                                                                        />

                                                                        <path
                                                                            d="M6 13H4.8C4 13 3.5 12.5 3.5 11.7V4.8C3.5 4 4 3.5 4.8 3.5H11.7C12.5 3.5 13 4 13 4.8V6"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.4"
                                                                        />
                                                                    </svg>

                                                                    Copy
                                                                </>
                                                            )}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="ai-message-bubble">
                                                <p>
                                                    {
                                                        message.content
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {message.role
                                            === "user" && (
                                            <span className="ai-message-avatar user">
                                                {createInitials(
                                                    user
                                                )}
                                            </span>
                                        )}
                                    </article>
                                )
                            )}

                            {isLoading && (
                                <article className="ai-message assistant">
                                    <AiAvatar />

                                    <div className="ai-message-body">
                                        <div className="ai-message-meta">
                                            <div>
                                                <strong>
                                                    CryptoScope AI
                                                </strong>

                                                <span>
                                                    Generating response
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ai-message-bubble typing">
                                            <div className="ai-typing-indicator">
                                                <span />
                                                <span />
                                                <span />
                                            </div>

                                            <p>
                                                Reviewing your
                                                account context...
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            )}

                            {error && (
                                <div
                                    className="ai-chat-error"
                                    role="alert"
                                >
                                    <span>!</span>

                                    <div>
                                        <strong>
                                            Request failed
                                        </strong>

                                        <p>
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div
                                ref={
                                    messagesEndRef
                                }
                            />
                        </div>

                        <form
                            className="ai-chat-form"
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="ai-composer">
                                <textarea
                                    ref={
                                        textareaRef
                                    }
                                    rows="3"
                                    maxLength={
                                        MAX_QUESTION_LENGTH
                                    }
                                    placeholder="Ask about your portfolio, transactions or current market prices..."
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
                                    disabled={
                                        isLoading
                                    }
                                />

                                <div className="ai-composer-footer">
                                    <span>
                                        Press Enter to send
                                        · Shift + Enter for
                                        a new line
                                    </span>

                                    <span
                                        className={
                                            input.length
                                                > 900
                                                ? "ai-question-counter warning"
                                                : "ai-question-counter"
                                        }
                                    >
                                        {input.length}
                                        /
                                        {
                                            MAX_QUESTION_LENGTH
                                        }
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="ai-send-button"
                                disabled={
                                    !input.trim()
                                    || isLoading
                                }
                            >
                                {isLoading ? (
                                    <>
                                        <span className="ai-send-spinner" />
                                        Thinking
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Ask AI
                                        </span>

                                        <svg
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M3.5 4L17 10L3.5 16L6 10L3.5 4Z"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinejoin="round"
                                                strokeWidth="1.6"
                                            />

                                            <path
                                                d="M6 10H17"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeWidth="1.6"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default AiChatPage;