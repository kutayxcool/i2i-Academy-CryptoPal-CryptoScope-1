import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const {
      username,
      email,
      password,
      confirmPassword,
    } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log("Register data:", formData);

    // Backend hazır olana kadar login sayfasına yönlendiriyoruz.
    navigate("/");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">CryptoScope</div>

        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Join CryptoScope and start exploring the crypto market.
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

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />

          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className="auth-button">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;