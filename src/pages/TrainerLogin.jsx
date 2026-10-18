import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TrainerLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userId,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      if (data.user?.role_id !== 3) {
        setMessage(
          "This account is not authorized for Trainer Login."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/trainer-dashboard");
    } catch (error) {
      console.error("Trainer login error:", error);

      setMessage(
        "Unable to connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card admin-login-card">

        <div className="login-icon">
          🏋️
        </div>

        <p className="login-small-title">
          TRAINER PORTAL
        </p>

        <h2>
          Trainer Login
        </h2>

        <p className="login-subtitle">
          Login with your authorized Trainer User ID and password.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="login-form-group">

            <label htmlFor="trainer-user-id">
              Trainer User ID
            </label>

            <input
              id="trainer-user-id"
              type="text"
              placeholder="Enter trainer user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

          </div>

          <div className="login-form-group">

            <label htmlFor="trainer-password">
              Trainer Password
            </label>

            <input
              id="trainer-password"
              type="password"
              placeholder="Enter trainer password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login to Trainer Panel →"}
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <div className="login-security">
          🛡️ Authorized Trainer Access Only
        </div>

      </div>

    </div>
  );
}

export default TrainerLogin;