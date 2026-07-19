import {
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";

import {
    login as loginRequest,
} from "../services/authService";

import {
    useAuth,
} from "../context/AuthContext";

function EyeIcon({
    visible,
}) {
    if (visible) {
        return (
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M3 3L21 21"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                />

                <path
                    d="M10.6 10.7A2 2 0 0013.3 13.4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                />

                <path
                    d="M9.9 4.3A10.5 10.5 0 0112 4C17.5 4 21 12 21 12A16.8 16.8 0 0118.2 15.8"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                />

                <path
                    d="M6.2 6.2C4 8 3 12 3 12S6.5 20 12 20C13.4 20 14.7 19.5 15.8 18.8"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M3 12S6.5 4 12 4S21 12 21 12S17.5 20 12 20S3 12 3 12Z"
                fill="none"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />

            <circle
                cx="12"
                cy="12"
                r="2.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        login: saveAuthenticatedUser,
    } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const successMessage =
        location.state?.message || "";

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData(
            (previousData) => ({
                ...previousData,
                [name]: value,
            })
        );

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const username =
            formData.username.trim();

        const password =
            formData.password;

        if (!username || !password) {
            setError(
                "Please enter your username and password."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const response =
                await loginRequest({
                    username,
                    password,
                });

            saveAuthenticatedUser(
                response.data
            );

            navigate(
                "/dashboard",
                {
                    replace: true,
                }
            );
        } catch (requestError) {
            const message =
                requestError.response?.data
                    ?.error?.message
                || "Login failed. Please try again.";

            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            mode="login"
            eyebrow="Welcome back"
            title="Sign in to your account"
            subtitle="Enter your details to access your portfolio and live market tools."
            footerText="New to CryptoScope?"
            footerLinkText="Create an account"
            footerLinkTo="/register"
        >
            {successMessage && (
                <div
                    className="auth-alert auth-alert-success"
                    role="status"
                >
                    <span className="auth-alert-icon">
                        ✓
                    </span>

                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div
                    className="auth-alert auth-alert-error"
                    role="alert"
                >
                    <span className="auth-alert-icon">
                        !
                    </span>

                    <span>{error}</span>
                </div>
            )}

            <form
                className="auth-form"
                onSubmit={handleSubmit}
            >
                <div className="auth-field">
                    <label htmlFor="username">
                        Username
                    </label>

                    <div className="auth-input-shell">
                        <span className="auth-input-leading">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="8"
                                    r="3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />

                                <path
                                    d="M5 20C5.5 15.8 8.1 13.5 12 13.5C15.9 13.5 18.5 15.8 19 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="1.8"
                                />
                            </svg>
                        </span>

                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="username"
                            maxLength="50"
                            spellCheck="false"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="auth-field">
                    <div className="auth-label-row">
                        <label htmlFor="password">
                            Password
                        </label>

                        <span className="auth-label-note">
                            Minimum 8 characters
                        </span>
                    </div>

                    <div className="auth-input-shell">
                        <span className="auth-input-leading">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <rect
                                    x="5"
                                    y="10"
                                    width="14"
                                    height="10"
                                    rx="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />

                                <path
                                    d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="1.8"
                                />
                            </svg>
                        </span>

                        <input
                            id="password"
                            name="password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="current-password"
                            maxLength="100"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() =>
                                setShowPassword(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                            disabled={isSubmitting}
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            <EyeIcon
                                visible={showPassword}
                            />
                        </button>
                    </div>
                </div>

                <div className="auth-session-note">
                    <span className="auth-session-icon">
                        <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                d="M10 2.5L16 5.2V9.4C16 13.1 13.6 16.1 10 17.5C6.4 16.1 4 13.1 4 9.4V5.2L10 2.5Z"
                                fill="none"
                                stroke="currentColor"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                            />
                        </svg>
                    </span>

                    Your session is protected with a
                    temporary authentication token.
                </div>

                <button
                    type="submit"
                    className="auth-primary-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting && (
                        <span className="auth-spinner" />
                    )}

                    <span>
                        {isSubmitting
                            ? "Signing in..."
                            : "Sign in"}
                    </span>

                    {!isSubmitting && (
                        <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                d="M4 10H16M11 5L16 10L11 15"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                            />
                        </svg>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}

export default LoginPage;