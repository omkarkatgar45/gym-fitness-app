import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
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
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      // Only Admin can enter Admin Dashboard
      if (data.user?.role_id !== 1) {
        setMessage(
          "This account is not authorized for Admin Login."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

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

        {/* ================= ADMIN HEADER ================= */}

        <div className="login-icon">
          🔐
        </div>

        <p className="login-small-title">
          ADMIN PORTAL
        </p>

        <h2>
          Admin Login
        </h2>

        <p className="login-subtitle">
          Login with your authorized GYMFIT administrator account.
        </p>


        {/* ================= FORM ================= */}

        <form onSubmit={handleAdminLogin}>

          <div className="login-form-group">

            <label htmlFor="admin-email">
              Admin Email Address
            </label>

            <input
              id="admin-email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>


          <div className="login-form-group">

            <label htmlFor="admin-password">
              Admin Password
            </label>

            <input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
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
            {loading ? "Logging in..." : "Login to Admin Panel →"}
          </button>

        </form>


        {/* ================= MESSAGE ================= */}

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}


        {/* ================= SECURITY ================= */}

        <div className="login-security">
          🛡️ Authorized Admin Access Only
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;