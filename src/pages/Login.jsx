
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Existing member session check
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const isMember =
        Number(user?.role_id) === 4 ||
        String(user?.role || "").toLowerCase() === "member";

      if (token && isMember) {
        navigate("/member-dashboard", { replace: true });
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [navigate]);

  // Member login
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
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.token) {
        setMessage(data.message || "Login failed.");
        return;
      }

      const isMember =
        Number(data.user?.role_id) === 4 ||
        String(data.user?.role || "").toLowerCase() === "member";

      if (!isMember) {
        setMessage(
          "This account is not authorized for Member Login."
        );
        return;
      }

      // Save member session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/member-dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open Forgot Password page
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          GYM<span>FIT</span>
        </div>

        <div className="login-left-content">
          <p className="login-tag">MEMBER PORTAL</p>

          <h1>
            Welcome To
            <br />
            <span>GYMFIT.</span>
          </h1>

          <p>
            Login to manage your membership, attendance,
            workout plans and payment history.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">💳</div>

              <div>
                <h3>My Membership</h3>
                <p>
                  View your active membership and renewal status.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">✅</div>

              <div>
                <h3>Check-In / Check-Out</h3>
                <p>
                  View your gym attendance history.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">🏋️</div>

              <div>
                <h3>Workout Plan</h3>
                <p>
                  View workout plans assigned by your trainer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-icon">👤</div>

          <p className="login-small-title">MEMBER ACCESS</p>

          <h2>Member Login</h2>

          <p className="login-subtitle">
            Login to access your GYMFIT member dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="login-options">
              <span className="remember-me">
                Stay logged in until Logout
              </span>

              <button
                type="button"
                className="forgot-btn"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login to Member Dashboard →"}
            </button>
          </form>

          {message && (
            <p className="login-message" role="alert">
              {message}
            </p>
          )}

          <div className="login-register">
            <p>Don't have a GYMFIT membership?</p>

            <Link to="/register">
              Join GYMFIT →
            </Link>
          </div>

          <div className="login-security">
            🛡️ Secure Member Access
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
