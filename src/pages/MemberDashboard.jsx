
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogoutButton from "../components/LogoutButton";
import { apiFetch } from "../utils/api";

const API = "http://localhost:5000";

function getTokenData(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      atob(payload + "=".repeat((4 - (payload.length % 4)) % 4))
    );
  } catch {
    return {};
  }
}

function daysLeft(value) {
  if (!value) return null;

  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;

  const end = new Date(y, m - 1, d);
  const today = new Date();

  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.round((end - today) / 86400000);
}

const menuItems = [
  { id: "membership", label: "My Membership", icon: "💳" },
  { id: "bills", label: "Payment Bills", icon: "🧾" },
  { id: "workouts", label: "My Workout Plans", icon: "🏋️" },
  { id: "attendance", label: "My Attendance", icon: "📅" },
];

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Not checked out";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function verificationLabel(payment) {
  const status = String(
    payment.verification_status ||
    payment.receipt_status ||
    ""
  ).toLowerCase();

  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "pending") return "Pending Verification";

  return "Not Verified";
}

function safeText(value) {
  return String(value ?? "Not available")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printReceipt(payment, user) {
  const status = verificationLabel(payment);
  const receiptNumber =
    payment.receipt_number || `PAY-${payment.id || "N/A"}`;

  const receiptWindow = window.open("", "_blank", "width=800,height=700");

  if (!receiptWindow) {
    alert("Receipt window block zali. Browser madhye pop-ups allow kara.");
    return;
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Receipt - ${safeText(receiptNumber)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            color: #222;
            padding: 28px;
            max-width: 760px;
            margin: 0 auto;
          }
          .receipt {
            border: 2px solid #222;
            padding: 28px;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e0ab32;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          h1 { margin: 0 0 8px; font-size: 26px; }
          .subtitle { color: #666; margin: 0; }
          .number {
            font-size: 19px;
            font-weight: bold;
            margin: 18px 0;
          }
          table { width: 100%; border-collapse: collapse; }
          td {
            padding: 12px 8px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
          }
          td:first-child { color: #555; width: 42%; }
          td:last-child { font-weight: 600; overflow-wrap: anywhere; }
          .amount {
            font-size: 24px;
            font-weight: bold;
            text-align: right;
            margin-top: 24px;
          }
          .status {
            margin-top: 20px;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
          }
          .note { margin-top: 26px; font-size: 12px; color: #666; }
          .print-button {
            display: block;
            margin: 20px auto;
            padding: 12px 24px;
            cursor: pointer;
          }
          @media print {
            body { padding: 0; }
            .receipt { border: 1px solid #222; }
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>GYM FITNESS</h1>
            <p class="subtitle">Payment Receipt</p>
          </div>

          <div class="number">
            Receipt No: ${safeText(receiptNumber)}
          </div>

          <table>
            <tr>
              <td>Member Name</td>
              <td>${safeText(user.full_name)}</td>
            </tr>
            <tr>
              <td>Member ID</td>
              <td>${safeText(user.member_id)}</td>
            </tr>
            <tr>
              <td>Membership Plan</td>
              <td>${safeText(payment.plan_name)}</td>
            </tr>
            <tr>
              <td>Payment Date</td>
              <td>${safeText(formatDate(payment.paid_at || payment.created_at))}</td>
            </tr>
            <tr>
              <td>Payment Method</td>
              <td>${safeText(payment.payment_method)}</td>
            </tr>
            <tr>
              <td>Transaction ID</td>
              <td>${safeText(payment.transaction_id)}</td>
            </tr>
            <tr>
              <td>Verification Status</td>
              <td>${safeText(status)}</td>
            </tr>
          </table>

          <div class="amount">
            Amount: ${safeText(money(payment.amount))}
          </div>

          <div class="status">
            ${
              status === "Approved"
                ? "Payment verified by gym administration."
                : status === "Rejected"
                ? "Payment verification was rejected. Please contact gym administration."
                : "Payment verification is not yet complete. This is not a confirmed approved receipt."
            }
          </div>

          <p class="note">
            This receipt is generated from the payment information available in your member account.
            Please contact gym administration if any detail is incorrect.
          </p>
        </div>

        <button class="print-button" onclick="window.print()">Print Receipt</button>
      </body>
    </html>
  `;

  receiptWindow.document.open();
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
}

export default function MemberDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [membership, setMembership] = useState(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  const [message, setMessage] = useState("");
  const [membershipMessage, setMembershipMessage] = useState("");
  const [workoutMessage, setWorkoutMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const [liveTime, setLiveTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState("membership");
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Verify logged-in member
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const saved = localStorage.getItem("user");

      if (!token || !saved) {
        navigate("/login", { replace: true });
        return;
      }

      const data = JSON.parse(saved);
      const claims = getTokenData(token);

      const roleId = Number(
        data.role_id ?? data.roleId ?? claims.roleId
      );

      const memberId =
        data.member_id ?? data.memberId ?? claims.memberId;

      if (roleId !== 4 || !memberId) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      const member = {
        ...data,
        role_id: roleId,
        member_id: Number(memberId),
      };

      localStorage.setItem("user", JSON.stringify(member));
      setUser(member);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load member data and payment history
  useEffect(() => {
    if (!user?.member_id) return;

    let cancelled = false;

    async function loadData() {
      try {
        const responses = await Promise.all([
          apiFetch(`${API}/api/attendance/history/${user.member_id}`),
          apiFetch(`${API}/api/membership/member/${user.member_id}`),
          apiFetch(`${API}/api/workout-plans/member/${user.member_id}`),
          apiFetch(`${API}/api/membership/member/${user.member_id}/payments`),
        ]);

        const results = await Promise.all(
          responses.map(async (response) => {
            try {
              return await response.json();
            } catch {
              return {};
            }
          })
        );

        if (cancelled) return;

        const [a, m, w, p] = results;

        setAttendance(responses[0].ok ? a.attendance || [] : []);
        setMembership(responses[1].ok ? m.membership || null : null);
        setWorkoutPlans(responses[2].ok ? w.workoutPlans || [] : []);

        const paymentRows = Array.isArray(p.payments)
          ? p.payments
          : Array.isArray(p.paymentHistory)
          ? p.paymentHistory
          : [];

        setPayments(responses[3].ok ? paymentRows : []);

        setMessage(
          responses[0].ok ? "" : a.message || "Unable to load attendance."
        );

        setMembershipMessage(
          responses[1].ok ? "" : m.message || "Unable to load membership."
        );

        setWorkoutMessage(
          responses[2].ok ? "" : w.message || "Unable to load workout plans."
        );

        setPaymentMessage(
          responses[3].ok
            ? ""
            : p.message || "Unable to load payment history."
        );
      } catch {
        if (cancelled) return;

        setMessage("Unable to connect to backend.");
        setMembershipMessage("Unable to connect to backend.");
        setWorkoutMessage("Unable to connect to backend.");
        setPaymentMessage("Unable to connect to backend.");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const expiryDays =
    membership?.membership_status === "ACTIVE"
      ? daysLeft(membership.end_date)
      : null;

  const membershipStatus =
    expiryDays !== null && expiryDays < 0
      ? "EXPIRED"
      : !membership
      ? "NOT PURCHASED"
      : membership.membership_status === "ACTIVE"
      ? "ACTIVE"
      : membership.membership_status === "PAYMENT_PENDING_APPROVAL"
      ? "PAYMENT PENDING APPROVAL"
      : membership.membership_status === "REJECTED"
      ? "REJECTED"
      : "REQUEST PENDING";

  const buttonStyle = (selected) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "14px 16px",
    border: "none",
    borderRadius: 10,
    textAlign: "left",
    fontSize: 14,
    fontWeight: selected ? 800 : 600,
    background: selected ? "#e0ab32" : "transparent",
    color: selected ? "#111" : "inherit",
    cursor: "pointer",
    transition: "background 0.2s ease",
  });

  if (!user) return null;

  return (
    <div
      className="dashboard-page"
      style={{ minHeight: "100vh", padding: 0 }}
    >
      {/* TOP BAR */}
      <div
        className="dashboard-top-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px 24px",
          margin: 0,
        }}
      >
        <p className="dashboard-role-title" style={{ margin: 0 }}>
          MEMBER PORTAL
        </p>
        <LogoutButton />
      </div>

      {/* SIDEBAR + MAIN CONTENT */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          padding: 20,
          minHeight: "calc(100vh - 70px)",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDEBAR */}
        <aside
          style={{
            width: 245,
            minWidth: 215,
            flexShrink: 0,
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(128,128,128,0.25)",
            background: "rgba(128,128,128,0.06)",
            position: "sticky",
            top: 16,
          }}
        >
          <h3 style={{ margin: "4px 8px 18px", fontSize: 15 }}>
            MEMBER MENU
          </h3>

          <nav style={{ display: "grid", gap: 8 }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setSelectedPayment(null);
                }}
                style={buttonStyle(activeSection === item.id)}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* RIGHT CONTENT */}
        <main style={{ flex: 1, minWidth: 280 }}>
          <div className="dashboard-header">
            <p>MEMBER PORTAL</p>
            <h1>Welcome, {user.full_name}</h1>
            <p>{user.email}</p>
            <span>Role: {user.role || "Member"}</span>
          </div>

          <div className="live-clock-card">
            <p>CURRENT DATE &amp; TIME</p>
            <h2>
              {liveTime.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h2>
            <strong>
              {liveTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </strong>
          </div>

          {/* MY MEMBERSHIP */}
          {activeSection === "membership" && (
            <section className="attendance-section" id="member-membership">
              <h2>My Membership</h2>
              <p className="attendance-info">
                View your membership, payment and expiry status.
              </p>

              {membershipMessage && (
                <div className="dashboard-message">{membershipMessage}</div>
              )}

              {!membership ? (
                <div className="empty-state">
                  <h2>No Membership Purchased</h2>
                  <p>You have not selected a membership plan yet.</p>
                  <button
                    onClick={() => navigate("/membership")}
                    style={{
                      marginTop: 20,
                      padding: "13px 20px",
                      border: "none",
                      borderRadius: 9,
                      background: "#e0ab32",
                      color: "#111",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Choose Membership
                  </button>
                </div>
              ) : (
                <div className="attendance-card">
                  {membershipStatus === "EXPIRED" && (
                    <div
                      className="dashboard-message"
                      style={{ marginBottom: 20 }}
                    >
                      Your membership has expired. Please renew your membership.
                      <button onClick={() => navigate("/membership")}>
                        Renew Membership
                      </button>
                    </div>
                  )}

                  {membershipStatus === "ACTIVE" &&
                    expiryDays !== null &&
                    expiryDays >= 0 &&
                    expiryDays <= 7 && (
                      <div
                        className="dashboard-message"
                        style={{ marginBottom: 20 }}
                      >
                        {expiryDays === 0
                          ? "Reminder: Your membership expires today!"
                          : `Reminder: Your membership expires in ${expiryDays} day(s).`}
                        <button onClick={() => navigate("/membership")}>
                          View Renewal Plans
                        </button>
                      </div>
                    )}

                  <div className="attendance-row">
                    <div>
                      <span>Membership Status</span>
                      <strong>{membershipStatus}</strong>
                    </div>
                    <div>
                      <span>Plan</span>
                      <strong>{membership.plan_name || "Not available"}</strong>
                    </div>
                  </div>

                  <div className="attendance-row">
                    <div>
                      <span>Duration</span>
                      <strong>{membership.duration_months || "—"} Month(s)</strong>
                    </div>
                    <div>
                      <span>Amount</span>
                      <strong>
                        {money(membership.amount || membership.price)}
                      </strong>
                    </div>
                  </div>

                  <div className="attendance-row">
                    <div>
                      <span>Payment Status</span>
                      <strong>
                        {membership.payment_status || "Not available"}
                      </strong>
                    </div>
                    <div>
                      <span>Admin Approval</span>
                      <strong>
                        {membership.verification_status === "approved"
                          ? "Approved"
                          : membership.verification_status === "pending"
                          ? "Pending"
                          : membership.verification_status === "rejected"
                          ? "Rejected"
                          : "Not available"}
                      </strong>
                    </div>
                  </div>

                  {membership.transaction_id && (
                    <div className="attendance-row">
                      <div>
                        <span>Transaction ID</span>
                        <strong>{membership.transaction_id}</strong>
                      </div>
                      <div>
                        <span>Payment Method</span>
                        <strong>{membership.payment_method || "Not available"}</strong>
                      </div>
                    </div>
                  )}

                  {(membershipStatus === "ACTIVE" ||
                    membershipStatus === "EXPIRED") && (
                    <div className="attendance-row">
                      <div>
                        <span>Start Date</span>
                        <strong>{formatDate(membership.start_date)}</strong>
                      </div>
                      <div>
                        <span>End Date</span>
                        <strong>{formatDate(membership.end_date)}</strong>
                      </div>
                    </div>
                  )}

                  {membershipStatus === "PAYMENT PENDING APPROVAL" && (
                    <div className="dashboard-message">
                      Payment recorded. Membership will activate after admin verification.
                    </div>
                  )}

                  {membershipStatus === "REJECTED" && (
                    <div className="dashboard-message">
                      Your membership request was rejected. Contact the gym administration.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveSection("bills")}
                    style={{
                      marginTop: 18,
                      padding: "12px 18px",
                      border: "none",
                      borderRadius: 8,
                      background: "#e0ab32",
                      color: "#111",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🧾 View Payment Bills
                  </button>
                </div>
              )}
            </section>
          )}

          {/* PAYMENT BILLS */}
          {activeSection === "bills" && (
            <section className="attendance-section" id="member-bills">
              <h2>Payment Bills &amp; Receipts</h2>
              <p className="attendance-info">
                View your payment history, verification status and receipts.
              </p>

              {paymentMessage && (
                <div className="dashboard-message">{paymentMessage}</div>
              )}

              {payments.length === 0 ? (
                <div className="empty-state">
                  <h2>No Payment Records</h2>
                  <p>
                    Payment records tumchya account sathi available nahit.
                    Payment kela asel tar admin verification ani backend API check kara.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: 14,
                      marginBottom: 18,
                    }}
                  >
                    <div className="attendance-card">
                      <span>Total Payment Records</span>
                      <h2 style={{ marginBottom: 0 }}>{payments.length}</h2>
                    </div>
                    <div className="attendance-card">
                      <span>Total Amount Recorded</span>
                      <h2 style={{ marginBottom: 0 }}>
                        {money(
                          payments.reduce(
                            (total, payment) =>
                              total + Number(payment.amount || 0),
                            0
                          )
                        )}
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 16 }}>
                    {payments.map((payment, index) => {
                      const status = verificationLabel(payment);
                      const receiptNumber =
                        payment.receipt_number ||
                        `PAY-${payment.id || index + 1}`;

                      return (
                        <div
                          key={payment.id || receiptNumber || index}
                          className="attendance-card"
                        >
                          <div className="attendance-row">
                            <div>
                              <span>Receipt Number</span>
                              <strong>{receiptNumber}</strong>
                            </div>
                            <div>
                              <span>Verification Status</span>
                              <strong>{status}</strong>
                            </div>
                          </div>

                          <div className="attendance-row">
                            <div>
                              <span>Membership Plan</span>
                              <strong>{payment.plan_name || "Not available"}</strong>
                            </div>
                            <div>
                              <span>Amount</span>
                              <strong>{money(payment.amount)}</strong>
                            </div>
                          </div>

                          <div className="attendance-row">
                            <div>
                              <span>Payment Date</span>
                              <strong>
                                {formatDate(payment.paid_at || payment.created_at)}
                              </strong>
                            </div>
                            <div>
                              <span>Payment Method</span>
                              <strong>{payment.payment_method || "Not available"}</strong>
                            </div>
                          </div>

                          <div className="attendance-row">
                            <div>
                              <span>Transaction ID</span>
                              <strong>{payment.transaction_id || "Not available"}</strong>
                            </div>
                            <div>
                              <span>Payment Status</span>
                              <strong>{payment.payment_status || "Not available"}</strong>
                            </div>
                          </div>

                          {status !== "Approved" && (
                            <p className="dashboard-message">
                              {status === "Rejected"
                                ? "Ha payment reject zala aahe. Gym administration shi sampark kara."
                                : "Payment receipt details available aahet; pan admin verification ajun complete nasu shakate."}
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                              marginTop: 16,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedPayment(payment)}
                              style={{
                                padding: "11px 16px",
                                border: "1px solid rgba(128,128,128,0.4)",
                                borderRadius: 8,
                                background: "transparent",
                                color: "inherit",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              View Receipt
                            </button>

                            <button
                              type="button"
                              onClick={() => printReceipt(payment, user)}
                              style={{
                                padding: "11px 16px",
                                border: "none",
                                borderRadius: 8,
                                background: "#e0ab32",
                                color: "#111",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              🖨️ Print Receipt
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* RECEIPT PREVIEW */}
              {selectedPayment && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1000,
                    background: "rgba(0,0,0,0.65)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                    overflowY: "auto",
                  }}
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      setSelectedPayment(null);
                    }
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      color: "#222",
                      width: "100%",
                      maxWidth: 620,
                      maxHeight: "90vh",
                      overflowY: "auto",
                      borderRadius: 12,
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        borderBottom: "2px solid #e0ab32",
                        paddingBottom: 16,
                      }}
                    >
                      <div>
                        <h2 style={{ margin: 0 }}>GYM FITNESS</h2>
                        <p style={{ marginBottom: 0 }}>Payment Receipt</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(null)}
                        aria-label="Close receipt"
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: 8,
                          background: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <h3 style={{ marginTop: 20 }}>
                      Receipt No:{" "}
                      {selectedPayment.receipt_number ||
                        `PAY-${selectedPayment.id || "N/A"}`}
                    </h3>

                    <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
                      {[
                        ["Member Name", user.full_name],
                        ["Member ID", user.member_id],
                        ["Membership Plan", selectedPayment.plan_name],
                        [
                          "Payment Date",
                          formatDate(
                            selectedPayment.paid_at ||
                              selectedPayment.created_at
                          ),
                        ],
                        ["Payment Method", selectedPayment.payment_method],
                        ["Transaction ID", selectedPayment.transaction_id],
                        ["Payment Status", selectedPayment.payment_status],
                        ["Verification Status", verificationLabel(selectedPayment)],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 16,
                            borderBottom: "1px solid #e5e5e5",
                            paddingBottom: 10,
                          }}
                        >
                          <span style={{ color: "#666" }}>{label}</span>
                          <strong style={{ textAlign: "right", overflowWrap: "anywhere" }}>
                            {value || "Not available"}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <h2 style={{ textAlign: "right", marginTop: 24 }}>
                      Amount: {money(selectedPayment.amount)}
                    </h2>

                    <p
                      style={{
                        background: "#f5f5f5",
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {verificationLabel(selectedPayment) === "Approved"
                        ? "Payment verified by gym administration."
                        : verificationLabel(selectedPayment) === "Rejected"
                        ? "Payment verification rejected. Please contact gym administration."
                        : "Verification pending. This payment is not yet confirmed as approved."}
                    </p>

                    <button
                      type="button"
                      onClick={() => printReceipt(selectedPayment, user)}
                      style={{
                        width: "100%",
                        marginTop: 12,
                        padding: 13,
                        border: "none",
                        borderRadius: 8,
                        background: "#e0ab32",
                        color: "#111",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      🖨️ Print Receipt
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* MY WORKOUT PLANS */}
          {activeSection === "workouts" && (
            <section className="attendance-section" id="member-workouts">
              <h2>My Workout Plans</h2>
              <p className="attendance-info">
                View your workout schedule and trainer notes.
              </p>

              {workoutMessage && (
                <div className="dashboard-message">{workoutMessage}</div>
              )}

              {workoutPlans.length === 0 ? (
                <div className="empty-state">
                  <h2>No Workout Plan Assigned</h2>
                  <p>Your trainer has not created a workout plan yet.</p>
                </div>
              ) : (
                workoutPlans.map((plan) => (
                  <div key={plan.id} className="attendance-card">
                    <h2>{plan.plan_title}</h2>

                    <div className="attendance-row">
                      <div>
                        <span>Trainer</span>
                        <strong>{plan.trainer_name || "Not available"}</strong>
                      </div>
                      <div>
                        <span>Member ID</span>
                        <strong>{plan.member_id || user.member_id}</strong>
                      </div>
                    </div>

                    <div className="attendance-row">
                      <div>
                        <span>Start Date</span>
                        <strong>{formatDate(plan.start_date)}</strong>
                      </div>
                      <div>
                        <span>End Date</span>
                        <strong>{formatDate(plan.end_date)}</strong>
                      </div>
                    </div>

                    <h3>Exercises</h3>
                    <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                      {plan.exercises}
                    </p>

                    {plan.notes && (
                      <>
                        <h3>Trainer Notes</h3>
                        <p style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                          {plan.notes}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </section>
          )}

          {/* MY ATTENDANCE */}
          {activeSection === "attendance" && (
            <section className="attendance-section" id="member-attendance">
              <h2>My Attendance</h2>
              <p className="attendance-info">
                Your trainer records your gym attendance.
              </p>

              {message && (
                <div className="dashboard-message">{message}</div>
              )}

              {attendance.length === 0 ? (
                <div className="empty-state">
                  <h2>No Attendance Records</h2>
                  <p>Your trainer has not recorded any attendance yet.</p>
                </div>
              ) : (
                attendance.map((record) => (
                  <div key={record.id} className="attendance-card">
                    <div className="attendance-row">
                      <div>
                        <span>Member Name</span>
                        <strong>
                          {record.member_name || user.full_name}
                        </strong>
                      </div>
                      <div>
                        <span>Member ID</span>
                        <strong>
                          {record.member_id || user.member_id}
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: 16,
                        marginTop: 16,
                        alignItems: "start",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: "block", marginBottom: 6 }}>
                          Attendance Date
                        </span>
                        <strong>{formatDate(record.attendance_date)}</strong>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: "block", marginBottom: 6 }}>
                          Check In
                        </span>
                        <strong>{formatTime(record.check_in)}</strong>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: "block", marginBottom: 6 }}>
                          Check Out
                        </span>
                        <strong>{formatTime(record.check_out)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
