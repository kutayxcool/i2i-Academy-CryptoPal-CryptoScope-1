import {
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";

import {
    register as registerRequest,
} from "../services/authService";

function EyeIcon({
    visible,
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            {visible ? (
                <>
                    <path
                        d="M3 3L21 21"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                    />

                    <path
                        d="M9.8 4.3A10.8 10.8 0 0112 4C17.5 4 21 12 21 12A17.5 17.5 0 0118.1 15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                    />

                    <path
                        d="M6.2 6.2C4 8.1 3 12 3 12S6.5 20 12 20C13.5 20 14.8 19.5 15.9 18.8"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                    />
                </>
            ) : (
                <>
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
                </>
            )}
        </svg>
    );
}

function calculatePasswordStrength(
    password
) {
    let score = 0;

    if (password.length >= 8) {
        score += 1;
    }

    if (
        /[a-z]/.test(password)
        && /[A-Z]/.test(password)
    ) {
        score += 1;
    }

    if (/\d/.test(password)) {
        score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
    }

    const labels = [
        "Not entered",
        "Weak",
        "Fair",
        "Good",
        "Strong",
    ];

    return {
        score,
        label: labels[score],
    };
}

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [error, setError] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const passwordStrength = useMemo(
        () =>
            calculatePasswordStrength(
                formData.password
            ),
        [formData.password]
    );

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

        const firstName =
            formData.firstName.trim();

        const lastName =
            formData.lastName.trim();

        const username =
            formData.username.trim();

        const password =
            formData.password;

        const confirmPassword =
            formData.confirmPassword;

        if (
            !firstName
            || !lastName
            || !username
            || !password
            || !confirmPassword
        ) {
            setError(
                "Please complete all required fields."
            );
            return;
        }

        if (
            firstName.length < 2
            || lastName.length < 2
        ) {
            setError(
                "First name and last name must contain at least 2 characters."
            );
            return;
        }

        if (username.length < 3) {
            setError(
                "Username must contain at least 3 characters."
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await registerRequest({
                firstName,
                lastName,
                username,
                password,
            });

            navigate(
                "/",
                {
                    replace: true,
                    state: {
                        message:
                            "Your account was created successfully. You can now sign in.",
                    },
                }
            );
        } catch (requestError) {
            const message =
                requestError.response?.data
                    ?.error?.message
                || "Registration failed. Please try again.";

            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            mode="register"
            eyebrow="Start your journey"
            title="Create your account"
            subtitle="Build your virtual portfolio and explore the crypto market with real-time information."
            footerText="Already have an account?"
            footerLinkText="Sign in"
            footerLinkTo="/"
        >
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
                <div className="auth-field-grid">
                    <div className="auth-field">
                        <label htmlFor="firstName">
                            First name
                        </label>

                        <div className="auth-input-shell">
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="Your first name"
                                value={
                                    formData.firstName
                                }
                                onChange={handleChange}
                                disabled={isSubmitting}
                                autoComplete="given-name"
                                maxLength="60"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="lastName">
                            Last name
                        </label>

                        <div className="auth-input-shell">
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Your last name"
                                value={
                                    formData.lastName
                                }
                                onChange={handleChange}
                                disabled={isSubmitting}
                                autoComplete="family-name"
                                maxLength="60"
                            />
                        </div>
                    </div>
                </div>

                <div className="auth-field">
                    <div className="auth-label-row">
                        <label htmlFor="register-username">
                            Username
                        </label>

                        <span className="auth-label-note">
                            Used for signing in
                        </span>
                    </div>

                    <div className="auth-input-shell">
                        <span className="auth-input-leading">
                            @
                        </span>

                        <input
                            id="register-username"
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="username"
                            maxLength="50"
                            spellCheck="false"
                        />
                    </div>
                </div>

                <div className="auth-field">
                    <label htmlFor="register-password">
                        Password
                    </label>

                    <div className="auth-input-shell">
                        <input
                            id="register-password"
                            name="password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="new-password"
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

                    <div className="auth-strength">
                        <div className="auth-strength-bars">
                            {[1, 2, 3, 4].map(
                                (level) => (
                                    <span
                                        key={level}
                                        className={
                                            passwordStrength.score
                                                >= level
                                                ? `active strength-${passwordStrength.score}`
                                                : ""
                                        }
                                    />
                                )
                            )}
                        </div>

                        <span>
                            {passwordStrength.label}
                        </span>
                    </div>

                    <p className="auth-password-hint">
                        Use 8 or more characters with
                        uppercase, lowercase, numbers and
                        symbols.
                    </p>
                </div>

                <div className="auth-field">
                    <label htmlFor="confirmPassword">
                        Confirm password
                    </label>

                    <div className="auth-input-shell">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Repeat your password"
                            value={
                                formData.confirmPassword
                            }
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            maxLength="100"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() =>
                                setShowConfirmPassword(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                            disabled={isSubmitting}
                            aria-label={
                                showConfirmPassword
                                    ? "Hide confirmed password"
                                    : "Show confirmed password"
                            }
                        >
                            <EyeIcon
                                visible={
                                    showConfirmPassword
                                }
                            />
                        </button>
                    </div>
                </div>

                <div className="auth-agreement">
                    <span className="auth-agreement-icon">
                        ✓
                    </span>

                    <p>
                        By creating an account, you
                        acknowledge that CryptoScope is
                        an educational virtual trading
                        application.
                    </p>
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
                            ? "Creating account..."
                            : "Create account"}
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

export default RegisterPage;