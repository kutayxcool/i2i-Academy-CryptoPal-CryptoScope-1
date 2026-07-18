import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { login as loginRequest } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login: saveAuthenticatedUser } =
        useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const successMessage =
        location.state?.message || "";

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

        if (!username || !password) {
            setError(
                "Please fill in all fields."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await loginRequest({
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
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-logo">
                    CryptoScope
                </div>

                <h1>Welcome Back</h1>

                <p className="auth-subtitle">
                    Sign in to monitor the market
                    and manage your portfolio.
                </p>

                {successMessage && (
                    <div className="auth-success">
                        {successMessage}
                    </div>
                )}

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

                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                    />

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Signing in..."
                            : "Login"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default LoginPage;