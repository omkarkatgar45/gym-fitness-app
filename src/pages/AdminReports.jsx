import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const API = "http://localhost:5000";

const dateKey = (date) => String(date || "").slice(0, 10);

export default function AdminReports() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function get(url) {
    const res = await apiFetch(API + url);
    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Unable to load report.");
    }

    return data;
  }

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const [m, a, p, pending] = await Promise.all([
        get("/api/members/history"),
        get("/api/members/active"),
        get("/api/membership/admin/payment-history"),
        get("/api/membership/admin/pending-payments"),
      ]);

      const members = m.members || [];
      const active = a.members || [];
      const payments = p.payments || [];
      const pendingPayments = pending.payments || [];

      const histories = await Promise.all(
        members.map(async (member) => {
          try {
            const data = await get(
              `/api/attendance/history/${member.member_id}`
            );
            return data.attendance || [];
          } catch {
            return [];
          }
        })
      );

      const attendance = histories.flat();
      const today = dateKey(new Date().toLocaleDateString("en-CA"));
      const approved = payments.filter(
        (p) =>
          p.payment_status === "success" &&
          p.verification_status === "approved"
      );

      const latestMembership = new Map();

      [...payments]
        .sort((x, y) => Number(y.payment_id) - Number(x.payment_id))
        .forEach((p) => {
          if (
            !latestMembership.has(Number(p.member_id)) &&
            p.payment_status === "success" &&
            p.verification_status === "approved" &&
            p.request_status === "approved" &&
            p.end_date
          ) {
            latestMembership.set(Number(p.member_id), p);
          }
        });

      const expired = [...latestMembership.values()].filter(
        (p) => dateKey(p.end_date) < today
      ).length;

      const week = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);

        const key = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-");

        return {
          day: date.toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          count: attendance.filter(
            (a) => dateKey(a.attendance_date) === key
          ).length,
        };
      });

      setReport({
        total: members.length,
        active: active.length,
        pending: members.filter(
          (m) => m.member_status === "pending"
        ).length,
        expired,
        revenue: approved.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        ),
        pendingAmount: pendingPayments.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        ),
        paymentCount: payments.length,
        today: attendance.filter(
          (a) => dateKey(a.attendance_date) === today
        ).length,
        week,
      });
    } catch (e) {
      setError(e.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("user") || "null");

      if (!saved || Number(saved.role_id) !== 1) {
        navigate("/admin-login", { replace: true });
        return;
      }

      setUser(saved);
    } catch {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (user) loadReports();
  }, [user]);

  const cardStyle = {
    background: "#151515",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 20,
  };

  const cards = report
    ? [
        ["Registered Members", report.total],
        ["Active Members", report.active],
        ["Pending Registrations", report.pending],
        ["Expired Memberships", report.expired],
        [
          "Verified Revenue",
          "₹" + report.revenue.toLocaleString("en-IN"),
        ],
        [
          "Pending Payments",
          "₹" + report.pendingAmount.toLocaleString("en-IN"),
        ],
        ["Payment Records", report.paymentCount],
        ["Today's Attendance", report.today],
      ]
    : [];

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-top-bar">
        <p className="dashboard-role-title">GYMFIT REPORTS</p>
        <button
          className="logout-btn"
          onClick={() => navigate("/admin-dashboard")}
        >
          BACK TO ADMIN
        </button>
      </div>

      <div className="dashboard-header">
        <p>GYMFIT ADMIN</p>
        <h1>Reports & Analytics</h1>
        <span>Membership, payment and attendance summary.</span>
      </div>

      <button onClick={loadReports} disabled={loading}>
        {loading ? "Loading..." : "Refresh Reports"}
      </button>

      {error && <div className="dashboard-message">{error}</div>}

      {loading && !report && <p>Loading reports...</p>}

      {report && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            {cards.map(([title, value]) => (
              <div key={title} style={cardStyle}>
                <p style={{ color: "#bbb" }}>{title}</p>
                <h2 style={{ color: "#e0ab32", overflowWrap: "anywhere" }}>
                  {value}
                </h2>
              </div>
            ))}
          </div>

          <div className="trainer-attendance-card" style={{ marginTop: 25 }}>
            <h2>Attendance — Last 7 Days</h2>

            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: 14,
                height: 180,
                paddingTop: 20,
              }}
            >
              {report.week.map((item) => (
                <div
                  key={item.day}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    color: "#ddd",
                    fontSize: 12,
                    minWidth: 0,
                  }}
                >
                  <strong>{item.count}</strong>
                  <div
                    style={{
                      height:
                        Math.max(
                          8,
                          (item.count /
                            Math.max(1, ...report.week.map((x) => x.count))) *
                            100
                        ),
                      background: "#e0ab32",
                      borderRadius: "5px 5px 0 0",
                      maxWidth: 38,
                      margin: "8px auto",
                    }}
                  />
                  {item.day}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}