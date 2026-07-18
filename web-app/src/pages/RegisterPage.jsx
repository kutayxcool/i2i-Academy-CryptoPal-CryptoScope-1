import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    register as registerRequest,
} from "../services/authService";

import "../styles/Auth.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const username =
            formData.username.trim();

        const password =
            formData.password;

        const confirmPassword =
            formData.confirmPassword;

        if (
            !username
            || !password
            || !confirmPassword
        ) {
            setError(
                "Please fill in all fields."
            );
            return;
        }

        if (username.length < 3) {
            setError(
                "Username must be at least 3 characters."
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
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
                username,
                password,
            });

            navigate(
                "/",
                {
                    replace: true,
                    state: {
                        message:
                            "Registration successful. Please log in.",
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
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-logo">
                    CryptoScope
                </div>

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Join CryptoScope and start
                    exploring the crypto market.
                </p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        autoComplete="username"
                    />

                    <label htmlFor="register-password">
                        Password
                    </label>

                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                    />

                    <label htmlFor="confirm-password">
                        Confirm Password
                    </label>

                    <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        value={
                            formData.confirmPassword
                        }
                        onChange={handleChange}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                    />

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Register"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/">
                        Login
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default RegisterPage;