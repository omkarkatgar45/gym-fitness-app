import { Link } from "react-router-dom";

function Membership() {
  const plans = [
    {
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
            Choose your plan and continue to registration.
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


        <div className="plans-grid">

          {plans.map((plan) => (

            <div
              className={
                plan.popular
                  ? "plan-card popular-plan"
                  : "plan-card"
              }
              key={plan.name}
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

              <Link
                to={`/register?plan=${encodeURIComponent(
                  plan.name
                )}`}
                className="plan-btn"
              >
                Choose {plan.name} →
              </Link>

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
              📋
            </div>

            <h3>
              Choose Plan
            </h3>

            <p>
              Select Monthly, Quarterly, Half-Yearly or Annual membership.
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
              📝
            </div>

            <h3>
              Register
            </h3>

            <p>
              Enter your personal details and submit your membership request.
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
              💰
            </div>

            <h3>
              Payment
            </h3>

            <p>
              Complete the membership payment after registration.
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
              ✅
            </div>

            <h3>
              Admin Approval
            </h3>

            <p>
              Admin verifies payment and approves the membership request.
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
            Your membership becomes active only after payment verification
            and admin approval.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Membership;