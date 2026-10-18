
import { useState } from "react";

function Registration() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Registration failed.");
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        "Unable to connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page registration-auth-page">

      {/* LEFT SIDE - HEADING */}
      <section className="login-left registration-auth-left">
        <div className="login-left-content">

          <p className="login-tag">JOIN GYMFIT</p>

          <h1>
            Start Your
            <br />
            <span>Fitness Journey</span>
          </h1>

          <p>
            Create your GYMFIT account and submit your
            registration for admin approval.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <div className="login-feature-icon">💪</div>
              <div>
                <h3>Start Your Fitness Journey</h3>
                <p>
                  Take the first step towards a healthier,
                  stronger lifestyle.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">✓</div>
              <div>
                <h3>Admin Approval</h3>
                <p>
                  Your registration will be reviewed
                  by the gym administrator.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">🏆</div>
              <div>
                <h3>Achieve Your Goals</h3>
                <p>
                  Get ready to work towards your
                  fitness goals with GYMFIT.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* RIGHT SIDE - REGISTRATION FORM */}
      <section className="registration-auth-right">

        {!submitted ? (
          <div className="registration-card">

            <div className="registration-card-header">
              <p>REGISTRATION</p>
              <h2>Create Your Account</h2>
              <span>
                Enter your details and submit your registration.
                Your account will remain pending until an admin
                approves it.
              </span>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="registration-form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="registration-two-columns">

                <div className="registration-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="10 digit number"
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="registration-form-group">
                  <label htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="registration-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="registration-form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="registration-form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="registration-form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="registration-info-box">
                <span>ℹ️</span>
                <p>
                  After registration, your account will remain
                  pending until the gym administrator reviews
                  and approves your application.
                </p>
              </div>

              {errorMessage && (
                <div className="registration-error" role="alert">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="registration-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Registration →"}
              </button>

            </form>
          </div>
        ) : (
          <div className="registration-success">

            <div className="registration-success-icon">✓</div>

            <p className="registration-tag">
              REGISTRATION SUBMITTED
            </p>

            <h2>Welcome to GYMFIT</h2>

            <p>
              Your registration has been submitted successfully.
              Your account is now waiting for admin approval.
            </p>

            <div className="request-summary">

              <div>
                <span>Name</span>
                <strong>{formData.fullName}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{formData.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{formData.phone}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className="pending-text">
                  Pending Admin Approval
                </strong>
              </div>

            </div>

            <p className="next-step-text">
              Next step: the gym administrator will review your
              registration. After approval, you can log in and
              choose your membership plan.
            </p>

          </div>
        )}

      </section>
    </div>
  );
}

export default Registration;
