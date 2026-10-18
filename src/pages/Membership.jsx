import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Membership() {
  const navigate = useNavigate();

  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [error, setError] = useState("");

  const plans = [
    {
      id: 1,
      name: "Monthly",
      price: "₹999",
      duration: "/ month",
      popular: false,
      description:
        "Perfect for getting started with your fitness journey.",
      features: [
        "Full Gym Access",
        "Modern Equipment",
        "Locker Facility",
        "Basic Fitness Assessment",
      ],
    },
    {
      id: 2,
      name: "Quarterly",
      price: "₹2,499",
      duration: "/ 3 months",
      popular: true,
      description:
        "A balanced plan for consistent fitness progress.",
      features: [
        "Full Gym Access",
        "Modern Equipment",
        "Locker Facility",
        "Fitness Assessment",
        "Group Fitness Support",
      ],
    },
    {
      id: 3,
      name: "Half-Yearly",
      price: "₹4,499",
      duration: "/ 6 months",
      popular: false,
      description:
        "Stay committed and save more with a longer plan.",
      features: [
        "Full Gym Access",
        "Modern Equipment",
        "Locker Facility",
        "Fitness Assessment",
        "Workout Guidance",
        "Priority Support",
      ],
    },
    {
      id: 4,
      name: "Annual",
      price: "₹7,999",
      duration: "/ year",
      popular: false,
      description:
        "Our complete long-term fitness membership.",
      features: [
        "Full Gym Access",
        "Modern Equipment",
        "Locker Facility",
        "Fitness Assessment",
        "Workout Guidance",
        "Priority Support",
        "Renewal Reminder",
      ],
    },
  ];

  const handleChoosePlan = async (plan) => {
    setError("");

    try {
      const storedUser = localStorage.getItem("user");

      // =========================
      // USER NOT LOGGED IN
      // =========================
      if (!storedUser) {
        navigate(
          `/register?plan=${encodeURIComponent(plan.name)}`
        );
        return;
      }

      const user = JSON.parse(storedUser);

      const memberId = user.member_id;

      // =========================
      // MEMBER ID NOT FOUND
      // =========================
      if (!memberId) {
        navigate(
          `/register?plan=${encodeURIComponent(plan.name)}`
        );
        return;
      }

      // =========================
      // CREATE MEMBERSHIP REQUEST
      // =========================
      setLoadingPlanId(plan.id);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/membership/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            memberId: Number(memberId),
            planId: plan.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create membership request."
        );
      }

      // =========================
      // GO TO PAYMENT
      // =========================
      navigate(
        `/payment?requestId=${data.requestId}`
      );
    } catch (err) {
      console.error("Membership request error:", err);

      setError(
        err.message ||
          "Something went wrong while selecting the membership plan."
      );
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="membership-page">

      {/* ================= HERO ================= */}

      <section className="membership-hero">

        <div className="membership-hero-content">

          <p className="membership-tag">
            CHOOSE YOUR PLAN
          </p>

          <h1>
            Find The Right
            <br />
            <span>Membership For You</span>
          </h1>

          <p>
            Flexible membership plans designed for every fitness goal.
            First complete registration and admin approval, then select
            your membership plan.
          </p>

        </div>

      </section>


      {/* ================= PLANS ================= */}

      <section className="plans-section">

        <div className="plans-heading">

          <p>
            MEMBERSHIP PLANS
          </p>

          <h2>
            Train More. Achieve More.
          </h2>

          <span>
            Select a plan that fits your fitness journey.
          </span>

        </div>


        {/* ================= ERROR ================= */}

        {error && (
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto 30px",
              padding: "14px 18px",
              border: "1px solid #8f2d2d",
              borderRadius: "10px",
              background: "rgba(143, 45, 45, 0.12)",
              color: "#ff8f8f",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}


        <div className="plans-grid">

          {plans.map((plan) => (

            <div
              className={
                plan.popular
                  ? "plan-card popular-plan"
                  : "plan-card"
              }
              key={plan.id}
            >

              {plan.popular && (
                <div className="popular-badge">
                  MOST POPULAR
                </div>
              )}


              {/* PLAN TOP */}

              <div className="plan-top">

                <div className="plan-icon">
                  💳
                </div>

                <h3>
                  {plan.name}
                </h3>

                <p>
                  {plan.description}
                </p>

              </div>


              {/* PRICE */}

              <div className="plan-price">

                <strong>
                  {plan.price}
                </strong>

                <span>
                  {plan.duration}
                </span>

              </div>


              <div className="plan-divider"></div>


              {/* FEATURES */}

              <div className="plan-features">

                {plan.features.map((feature) => (

                  <div
                    className="plan-feature"
                    key={feature}
                  >

                    <span className="feature-check">
                      ✓
                    </span>

                    <span>
                      {feature}
                    </span>

                  </div>

                ))}

              </div>


              {/* CHOOSE PLAN */}

              <button
                type="button"
                className="plan-btn"
                onClick={() => handleChoosePlan(plan)}
                disabled={loadingPlanId !== null}
              >
                {loadingPlanId === plan.id
                  ? "Processing..."
                  : `Choose ${plan.name} →`}
              </button>

            </div>

          ))}

        </div>

      </section>


      {/* ================= MEMBERSHIP FLOW ================= */}

      <section className="membership-flow">

        <div className="membership-flow-heading">

          <p>
            HOW IT WORKS
          </p>

          <h2>
            Simple Membership Process
          </h2>

        </div>


        <div className="flow-grid">

          <div className="flow-card">

            <div className="flow-number">
              01
            </div>

            <div className="flow-icon">
              📝
            </div>

            <h3>
              Register
            </h3>

            <p>
              Create your member account by entering your personal details.
            </p>

          </div>


          <div className="flow-line">
            →
          </div>


          <div className="flow-card">

            <div className="flow-number">
              02
            </div>

            <div className="flow-icon">
              🔍
            </div>

            <h3>
              Admin Approval
            </h3>

            <p>
              Admin reviews your registration and approves your member
              account.
            </p>

          </div>


          <div className="flow-line">
            →
          </div>


          <div className="flow-card">

            <div className="flow-number">
              03
            </div>

            <div className="flow-icon">
              🔐
            </div>

            <h3>
              Login
            </h3>

            <p>
              After approval, log in to access your member dashboard.
            </p>

          </div>


          <div className="flow-line">
            →
          </div>


          <div className="flow-card">

            <div className="flow-number">
              04
            </div>

            <div className="flow-icon">
              💳
            </div>

            <h3>
              Choose Membership
            </h3>

            <p>
              Select your preferred membership plan from the available
              options.
            </p>

          </div>

        </div>

      </section>


      {/* ================= NOTE ================= */}

      <section className="membership-note">

        <div className="note-icon">
          💡
        </div>

        <div>

          <h3>
            Membership Activation
          </h3>

          <p>
            Registration must be approved by the admin before the member
            can continue with the membership process.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Membership;