import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (!formData.username || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        authLogin({
            username: formData.username,
            balance: 12500,
            token: "mock-token",
        });

        navigate("/dashboard");
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-logo">CryptoScope</div>

                <h1>Welcome Back</h1>
                <p className="auth-subtitle">
                    Sign in to monitor the market and manage your portfolio.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                    />

                    <label htmlFor="password">Password</label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <button type="submit" className="auth-button">
                        Login
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    );
}

export default LoginPage;