
import "./Home.css";
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

const initialStats = {
  totalMembers: null,
  todaysAttendance: null,
  activeMemberships: null,
};

function Home() {
  const [stats, setStats] = useState(initialStats);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const response = await fetch(`${API}/api/public/stats`);
        const data = await response.json();

        if (!response.ok || !data.success || !data.stats) {
          throw new Error("Statistics could not be loaded.");
        }

        const nextStats = {
          totalMembers: Number(data.stats.totalMembers),
          todaysAttendance: Number(data.stats.todaysAttendance),
          activeMemberships: Number(data.stats.activeMemberships),
        };

        if (
          Object.values(nextStats).some(
            (value) => !Number.isFinite(value) || value < 0
          )
        ) {
          throw new Error("Invalid statistics.");
        }

        if (mounted) {
          setStats(nextStats);
          setStatsError(false);
        }
      } catch (error) {
        console.error("Home statistics error:", error);

        if (mounted) {
          setStats(initialStats);
          setStatsError(true);
        }
      }
    }

    loadStats();

    const timer = window.setInterval(loadStats, 30000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  function displayCount(value) {
    if (value === null) {
      return statsError ? "—" : "…";
    }

    return value.toLocaleString("en-IN");
  }

  return (
    <div className="home-page">
      {/* HERO - NO BACKGROUND PHOTO */}
      <section className="home-hero">
        <div className="home-hero-overlay">
          <div className="home-hero-content">
            <p className="home-badge">
              💪 PREMIUM FITNESS CENTER
            </p>

            <h1>
              STRONGER
              <br />
              <span>HEALTHIER</span>
              <br />
              HAPPIER
            </h1>

            <p className="home-description">
              Your fitness journey starts here.
              Get fit, stay healthy and achieve your goals
              with our expert trainers and modern facilities.
            </p>

            <div className="home-buttons">
              <a href="register/" className="home-primary-btn">
                Join Now →
              </a>

              <a href="/programs" className="home-secondary-btn">
                Explore Programs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DATABASE STATISTICS */}
      <section className="home-stats-section">
        <div className="home-stat-card">
          <div className="home-stat-icon">👥</div>
          <h2>{displayCount(stats.totalMembers)}</h2>
          <p>Total Members</p>
          <span>
            {statsError
              ? "Statistics unavailable"
              : "Registered members in the database"}
          </span>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">🟢</div>
          <h2>{displayCount(stats.todaysAttendance)}</h2>
          <p>Today's Attendance</p>
          <span>
            {statsError
              ? "Statistics unavailable"
              : "Unique members present today"}
          </span>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">💳</div>
          <h2>{displayCount(stats.activeMemberships)}</h2>
          <p>Active Memberships</p>
          <span>
            {statsError
              ? "Statistics unavailable"
              : "Approved and currently valid memberships"}
          </span>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">📋</div>
          <h2>4</h2>
          <p>Membership Plans</p>
          <span>Choose Your Perfect Plan</span>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="home-programs">
        <div className="home-section-heading">
          <p>OUR PROGRAMS</p>
          <h2>Programs &amp; Facilities</h2>
          <span>
            Explore fitness programs designed to help you
            become stronger, healthier and more confident.
          </span>
        </div>

        <div className="home-program-grid">
          <div className="home-program-card">
            <div className="home-program-icon">🏋️</div>
            <h3>Strength Training</h3>
            <p>Build muscle and improve strength.</p>
          </div>

          <div className="home-program-card">
            <div className="home-program-icon">🥊</div>
            <h3>Boxing</h3>
            <p>Improve agility, stamina and focus.</p>
          </div>

          <div className="home-program-card">
            <div className="home-program-icon">🧘</div>
            <h3>Yoga</h3>
            <p>Improve flexibility and find balance.</p>
          </div>

          <div className="home-program-card">
            <div className="home-program-icon">🏃</div>
            <h3>Cardio</h3>
            <p>Improve endurance and overall fitness.</p>
          </div>

          <div className="home-program-card">
            <div className="home-program-icon">🧑‍🏫</div>
            <h3>Personal Training</h3>
            <p>One-to-one guidance from expert trainers.</p>
          </div>

          <div className="home-program-card">
            <div className="home-program-icon">👥</div>
            <h3>Group Classes</h3>
            <p>Train together and stay motivated.</p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="home-why">
        <div className="home-section-heading">
          <p>WHY CHOOSE US</p>
          <h2>Everything You Need</h2>
        </div>

        <div className="home-why-grid">
          <div className="home-why-card">
            <div>🏋️</div>
            <h3>Modern Equipment</h3>
            <p>Latest machines and fitness equipment.</p>
          </div>

          <div className="home-why-card">
            <div>🧑‍🏫</div>
            <h3>Expert Trainers</h3>
            <p>Professional guidance for your goals.</p>
          </div>

          <div className="home-why-card">
            <div>🛡️</div>
            <h3>Safe Environment</h3>
            <p>Clean, secure and comfortable facilities.</p>
          </div>

          <div className="home-why-card">
            <div>⏰</div>
            <h3>Flexible Timings</h3>
            <p>Convenient timings for your schedule.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div>
          <p>START YOUR FITNESS JOURNEY</p>
          <h2>Ready To Transform Your Life?</h2>
          <span>
            Join GYMFIT today and take the first step
            towards a stronger and healthier you.
          </span>
        </div>

        <a href="/membership" className="home-primary-btn">
          Get Membership →
        </a>
      </section>
    </div>
  );
}

export default Home;