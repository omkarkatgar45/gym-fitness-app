import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Member login submitted!");
  };

  return (
    <div className="login-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="login-left">

        <div className="login-brand">
          GYM<span>FIT</span>
        </div>

        <div className="login-left-content">

          <p className="login-tag">
            MEMBER PORTAL
          </p>

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

              <div className="login-feature-icon">
                💳
              </div>

              <div>
                <h3>
                  My Membership
                </h3>

                <p>
                  View your active membership and renewal status.
                </p>
              </div>

            </div>

            <div className="login-feature">

              <div className="login-feature-icon">
                ✅
              </div>

              <div>
                <h3>
                  Check-In / Check-Out
                </h3>

                <p>
                  Record your gym attendance yourself.
                </p>
              </div>

            </div>

            <div className="login-feature">

              <div className="login-feature-icon">
                🏋️
              </div>

              <div>
                <h3>
                  Workout Plan
                </h3>

                <p>
                  View workout plans assigned by your trainer.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="login-right">

        <div className="login-card">

          <div className="login-icon">
            👤
          </div>

          <p className="login-small-title">
            MEMBER ACCESS
          </p>

          <h2>
            Member Login
          </h2>

          <p className="login-subtitle">
            Login to access your GYMFIT member dashboard.
          </p>


          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>

            <div className="login-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>


            <div className="login-form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-btn"
                onClick={() =>
                  alert(
                    "Please contact GYMFIT support for password reset."
                  )
                }
              >
                Forgot Password?
              </button>

            </div>


            <button
              type="submit"
              className="login-btn"
            >
              Login to Member Dashboard →
            </button>

          </form>


          {/* ================= REGISTER ================= */}

          <div className="login-register">

            <p>
              Don't have a GYMFIT membership?
            </p>

            <a href="/membership">
              Join GYMFIT →
            </a>

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