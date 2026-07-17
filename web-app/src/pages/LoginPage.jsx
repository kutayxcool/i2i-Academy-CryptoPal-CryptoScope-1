import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";

function LoginPage() {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        if (!formData.username || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const res = await login({
                username: formData.username,
                password: formData.password,
            });

            authLogin({
                username: res.data.username,
                balance: res.data.balance,
                token: res.data.token,
            });

            navigate("/dashboard");
        } catch (err) {
            const backendMessage = err.response?.data?.message;
            setError(backendMessage || "Login failed. Check your username and password.");
        } finally {
            setLoading(false);
        }
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

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
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