
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!token) {
      setMessage("Reset token missing. Please request a new reset link.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await response.json();

      setMessage(data.message || "Request completed.");
      setSuccess(response.ok && data.success === true);

      if (response.ok && data.success) {
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Backend la connect hot nahi. Server check kar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-right" style={{ width: "100%" }}>
        <div className="login-card">
          <div className="login-icon">🔑</div>
          <p className="login-small-title">SECURE YOUR ACCOUNT</p>
          <h2>Reset Password</h2>

          {!token ? (
            <p className="login-message">
              Reset token missing. Please request a new link.
            </p>
          ) : (
            <>
              <p className="login-subtitle">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="login-form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="login-form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}

          {message && <p className="login-message">{message}</p>}

          {success && (
            <p>
              <Link to="/login">Go to Login</Link>
            </p>
          )}

          <div className="login-register">
            <Link to="/forgot-password">Request another reset link</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
