
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResetLink("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone.trim() }),
        }
      );

      const data = await response.json();

      setMessage(data.message || "Request processed.");

      if (response.ok && data.developmentResetLink) {
        setResetLink(data.developmentResetLink);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("Backend la connect hot nahi. Server check kar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-right" style={{ width: "100%" }}>
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <p className="login-small-title">ACCOUNT RECOVERY</p>
          <h2>Forgot Password?</h2>
          <p className="login-subtitle">
            Enter your registered mobile number to request a password reset.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="phone">Registered Mobile Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Request Reset Link"}
            </button>
          </form>

          {message && <p className="login-message">{message}</p>}

          {resetLink && (
            <div style={{ marginTop: 16, overflowWrap: "anywhere" }}>
              <p><strong>Development testing link:</strong></p>
              <a href={resetLink}>Open Reset Password Page</a>
              <p style={{ fontSize: 12 }}>
                Testing only. Real SMS delivery is not configured yet.
              </p>
            </div>
          )}

          <div className="login-register">
            <Link to="/login">← Back to Member Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
