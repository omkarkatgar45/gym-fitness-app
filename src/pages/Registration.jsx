import { useState } from "react";

function Registration() {
  const [selectedPlan, setSelectedPlan] = useState("Monthly");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    address: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);
  };

  const plans = [
    {
      name: "Monthly",
      price: "₹999",
    },
    {
      name: "Quarterly",
      price: "₹2,499",
    },
    {
      name: "Half-Yearly",
      price: "₹4,499",
    },
    {
      name: "Annual",
      price: "₹7,999",
    },
  ];

  return (
    <div className="registration-page">

      {/* ================= PAGE HEADER ================= */}

      <section className="registration-header">

        <p className="registration-tag">
          JOIN GYMFIT
        </p>

        <h1>
          Start Your
          <br />
          <span>Fitness Journey</span>
        </h1>

        <p>
          Register with GYMFIT, choose your membership plan
          and submit your membership request.
        </p>

      </section>


      {/* ================= REGISTRATION AREA ================= */}

      <section className="registration-section">

        {!submitted ? (

          <div className="registration-layout">

            {/* LEFT - PLANS */}

            <div className="registration-plans">

              <div className="registration-section-title">

                <p>
                  STEP 1
                </p>

                <h2>
                  Choose Your Plan
                </h2>

                <span>
                  Select the membership that suits your goals.
                </span>

              </div>


              <div className="registration-plan-list">

                {plans.map((plan) => (

                  <button
                    type="button"
                    key={plan.name}
                    className={
                      selectedPlan === plan.name
                        ? "registration-plan selected-plan"
                        : "registration-plan"
                    }
                    onClick={() =>
                      setSelectedPlan(plan.name)
                    }
                  >

                    <div className="registration-plan-icon">
                      💳
                    </div>

                    <div className="registration-plan-info">

                      <h3>
                        {plan.name}
                      </h3>

                      <p>
                        Membership Plan
                      </p>

                    </div>

                    <div className="registration-plan-price">
                      {plan.price}
                    </div>

                    <div className="plan-radio">
                      {selectedPlan === plan.name
                        ? "✓"
                        : ""}
                    </div>

                  </button>

                ))}

              </div>

            </div>


            {/* RIGHT - FORM */}

            <div className="registration-card">

              <div className="registration-card-header">

                <p>
                  STEP 2
                </p>

                <h2>
                  Your Details
                </h2>

                <span>
                  Enter your information to create your membership request.
                </span>

              </div>


              <form onSubmit={handleSubmit}>

                <div className="registration-form-group">

                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="registration-two-columns">

                  <div className="registration-form-group">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="10 digit number"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="registration-form-group">

                    <label htmlFor="age">
                      Age
                    </label>

                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="12"
                      max="100"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>


                <div className="registration-form-group">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="registration-two-columns">

                  <div className="registration-form-group">

                    <label htmlFor="gender">
                      Gender
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select Gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>


                  <div className="registration-form-group">

                    <label>
                      Selected Plan
                    </label>

                    <input
                      type="text"
                      value={selectedPlan}
                      readOnly
                    />

                  </div>

                </div>


                <div className="registration-form-group">

                  <label htmlFor="address">
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows="4"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="registration-info-box">

                  <span>
                    ℹ️
                  </span>

                  <p>
                    After submitting this form, your membership request
                    will remain pending until the gym administrator
                    verifies your payment and approves your membership.
                  </p>

                </div>


                <button
                  type="submit"
                  className="registration-submit-btn"
                >
                  Continue to Payment →
                </button>

              </form>

            </div>

          </div>

        ) : (

          /* ================= SUCCESS ================= */

          <div className="registration-success">

            <div className="registration-success-icon">
              ✓
            </div>

            <p className="registration-tag">
              REQUEST CREATED
            </p>

            <h2>
              Registration Submitted
            </h2>

            <p>
              Your <strong>{selectedPlan}</strong> membership request
              has been created successfully.
            </p>

            <div className="request-summary">

              <div>
                <span>
                  Name
                </span>

                <strong>
                  {formData.name}
                </strong>
              </div>

              <div>
                <span>
                  Plan
                </span>

                <strong>
                  {selectedPlan}
                </strong>
              </div>

              <div>
                <span>
                  Phone
                </span>

                <strong>
                  {formData.phone}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong className="pending-text">
                  Pending Payment
                </strong>
              </div>

            </div>

            <p className="next-step-text">
              Next step: complete your payment.
              After payment verification, the admin can approve
              your membership.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}

export default Registration;