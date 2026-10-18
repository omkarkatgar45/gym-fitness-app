import { useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN");
}

function safeText(value) {
  return String(value ?? "N/A")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function paymentVerificationLabel(value) {
  const status = String(value || "pending").toLowerCase();

  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function printAdminReceipt(item) {
  const receiptWindow = window.open("", "_blank", "width=800,height=700");

  if (!receiptWindow) {
    alert("Receipt window block zali. Browser madhye pop-ups allow kara.");
    return;
  }

  const receiptNumber =
    item.receipt_number ||
    `RCP-${String(item.payment_id || "N/A").padStart(6, "0")}`;

  const verification = paymentVerificationLabel(item.verification_status);

  receiptWindow.document.open();
  receiptWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Receipt - ${safeText(receiptNumber)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 760px;
            margin: 30px auto;
            padding: 20px;
            color: #222;
          }
          .receipt {
            border: 2px solid #222;
            border-radius: 10px;
            padding: 28px;
          }
          header {
            text-align: center;
            border-bottom: 2px solid #e0ab32;
            padding-bottom: 18px;
          }
          h1 { margin: 0 0 8px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          td {
            padding: 12px 8px;
            border-bottom: 1px solid #ddd;
          }
          td:first-child { width: 40%; color: #555; }
          td:last-child {
            font-weight: bold;
            overflow-wrap: anywhere;
          }
          .amount {
            text-align: right;
            font-size: 24px;
            margin-top: 24px;
          }
          .status {
            padding: 12px;
            border: 1px solid #ccc;
            margin-top: 18px;
          }
          .note {
            color: #666;
            font-size: 12px;
            margin-top: 22px;
          }
          button {
            display: block;
            margin: 20px auto;
            padding: 12px 24px;
            cursor: pointer;
          }
          @media print {
            button { display: none; }
            body { margin: 0 auto; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <header>
            <h1>GYMFIT</h1>
            <p>Payment Receipt</p>
          </header>

          <h3>Receipt No: ${safeText(receiptNumber)}</h3>

          <table>
            <tr><td>Member Name</td><td>${safeText(item.member_name)}</td></tr>
            <tr><td>Member ID</td><td>${safeText(item.member_id)}</td></tr>
            <tr><td>Email</td><td>${safeText(item.member_email || item.email)}</td></tr>
            <tr><td>Membership Plan</td><td>${safeText(item.plan_name)}</td></tr>
            <tr><td>Payment ID</td><td>${safeText(item.payment_id)}</td></tr>
            <tr><td>Payment Date</td><td>${safeText(formatDate(item.paid_at))}</td></tr>
            <tr><td>Payment Method</td><td>${safeText(item.payment_method)}</td></tr>
            <tr><td>Transaction ID</td><td>${safeText(item.transaction_id)}</td></tr>
            <tr><td>Payment Status</td><td>${safeText(item.payment_status)}</td></tr>
            <tr><td>Verification Status</td><td>${safeText(verification)}</td></tr>
            <tr><td>Verified At</td><td>${safeText(formatDate(item.verified_at))}</td></tr>
            <tr><td>Membership Status</td><td>${safeText(item.request_status)}</td></tr>
          </table>

          <div class="amount">Amount: ${safeText(money(item.amount))}</div>

          <div class="status">
            ${
              verification === "Approved"
                ? "Payment verified by gym administration."
                : verification === "Rejected"
                ? "Payment verification was rejected. Contact gym administration."
                : "Payment verification is pending. This is not a confirmed approved receipt."
            }
          </div>

          <p class="note">
            Receipt generated from the payment records available in the administration dashboard.
          </p>
        </div>
        <button onclick="window.print()">Print Receipt</button>
      </body>
    </html>
  `);

  receiptWindow.document.close();
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [activeSection, setActiveSection] = useState("pending-members");
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberHistory, setMemberHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);

  const [search, setSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const user = getStoredUser();

    if (!user || Number(user.role_id ?? user.roleId) !== 1) {
      window.location.href = "/admin-login";
      return;
    }

    if (!localStorage.getItem("token")) {
      window.location.href = "/admin-login";
      return;
    }

    setAdmin(user);
  }, []);

  async function request(url, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(API + url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message ||
          (response.status === 401
            ? "Session expired. Please login again."
            : `Request failed (${response.status}).`)
      );
    }

    return data;
  }

  async function loadAllData() {
    setLoading(true);

    try {
      const [m, p, h, ph, a] = await Promise.all([
        request("/api/members/pending"),
        request("/api/membership/admin/pending-payments"),
        request("/api/members/history"),
        request("/api/membership/admin/payment-history"),
        request("/api/members/active"),
      ]);

      setMembers(m.members || []);
      setPayments(p.payments || []);
      setMemberHistory(h.members || []);
      setPaymentHistory(ph.payments || []);
      setActiveMembers(a.members || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (admin) loadAllData();
  }, [admin]);

  const sections = [
    ["pending-members", "Pending Members", members],
    ["pending-payments", "Pending Verification", payments],
    ["member-history", "Registered Members", memberHistory],
    ["active-members", "Current Members", activeMembers],
    ["payment-history", "Payment History", paymentHistory],
  ];

  const current = sections.find((item) => item[0] === activeSection);

  const isPayment = [
    "pending-payments",
    "payment-history",
  ].includes(activeSection);

  const sourceRecords = current?.[2] || [];

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sourceRecords.filter((item) => {
      const fields = isPayment
        ? [
            item.payment_id,
            item.member_id,
            item.member_name,
            item.email,
            item.member_email,
            item.plan_name,
            item.transaction_id,
            item.payment_method,
            item.amount,
            item.payment_status,
            item.verification_status,
          ]
        : [
            item.member_id,
            item.full_name,
            item.email,
            item.phone,
            item.gender,
            item.address,
            item.member_status,
            item.user_status,
          ];

      if (
        !fields.some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        )
      ) {
        return false;
      }

      if (isPayment) {
        if (
          paymentStatus !== "all" &&
          String(item.payment_status || "").toLowerCase() !== paymentStatus
        ) {
          return false;
        }

        if (
          verificationStatus !== "all" &&
          String(item.verification_status || "pending").toLowerCase() !==
            verificationStatus
        ) {
          return false;
        }
      } else {
        const ms = String(item.member_status || "").toLowerCase();
        const us = String(item.user_status || "").toLowerCase();

        if (memberStatus === "inactive" && us !== "inactive") return false;
        if (memberStatus === "active" && us !== "active") return false;

        if (
          ["pending", "approved", "rejected"].includes(memberStatus) &&
          ms !== memberStatus
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    sourceRecords,
    search,
    isPayment,
    memberStatus,
    paymentStatus,
    verificationStatus,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function changeSection(id) {
    setActiveSection(id);
    setSearch("");
    setMemberStatus("all");
    setPaymentStatus("all");
    setVerificationStatus("all");
    setPage(1);
    setMessage("");
    setSelectedPayment(null);
  }

  async function approveMember(id) {
    try {
      setBusyId(id);

      const data = await request(`/api/members/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      setMessage(data.message || "Member approved successfully.");
      await loadAllData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function approvePayment(id) {
    if (!window.confirm("Ya payment la approve karayche aahe ka?")) {
      return;
    }

    try {
      setBusyId(id);

      const data = await request(
        "/api/membership/admin/approve-payment",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: Number(id) }),
        }
      );

      setMessage(data.message || "Payment approved successfully.");
      await loadAllData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeMember(id) {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      setBusyId(id);

      const data = await request(`/api/members/deactivate/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      setMessage(data.message || "Member removed successfully.");
      await loadAllData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId(null);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin-login";
  }

  function memberCard(item, type) {
    const id = item.member_id ?? item.id;

    return (
      <article className="admin-member-card" key={id}>
        <div>
          <h2>{item.full_name || "Member"}</h2>
          <p><strong>Member ID:</strong> {id}</p>
          <p><strong>Email:</strong> {item.email || "N/A"}</p>
          <p><strong>Phone:</strong> {item.phone || "N/A"}</p>

          {type === "pending-members" && (
            <>
              <p><strong>Date of Birth:</strong> {item.date_of_birth || "N/A"}</p>
              <p><strong>Gender:</strong> {item.gender || "N/A"}</p>
              <p><strong>Address:</strong> {item.address || "N/A"}</p>
              <p><strong>Status:</strong> {item.member_status || "pending"}</p>
            </>
          )}

          {type === "member-history" && (
            <>
              <p><strong>Registration Date:</strong> {formatDate(item.registration_date)}</p>
              <p><strong>Member Status:</strong> {item.member_status || "N/A"}</p>
              <p><strong>User Status:</strong> {item.user_status || "N/A"}</p>
            </>
          )}

          {type === "active-members" && (
            <>
              <p><strong>Gender:</strong> {item.gender || "N/A"}</p>
              <p><strong>Status:</strong> Active</p>
            </>
          )}
        </div>

        <div className="member-actions">
          {type === "pending-members" && (
            <button
              disabled={busyId === id}
              onClick={() => approveMember(id)}
            >
              {busyId === id ? "APPROVING..." : "APPROVE"}
            </button>
          )}

          {["active-members", "member-history"].includes(type) &&
            (type === "active-members" ||
              (item.user_status === "active" &&
                item.member_status === "approved")) && (
              <button
                disabled={busyId === id}
                onClick={() => removeMember(id)}
              >
                {busyId === id ? "REMOVING..." : "REMOVE MEMBER"}
              </button>
            )}
        </div>
      </article>
    );
  }

  function paymentCard(item, pending) {
    const status = paymentVerificationLabel(item.verification_status);

    const receiptNumber =
      item.receipt_number ||
      `RCP-${String(item.payment_id || "N/A").padStart(6, "0")}`;

    return (
      <article className="admin-payment-card" key={item.payment_id}>
        <div className="admin-payment-info">
          <div className="admin-payment-title-row">
            <h2>{item.member_name || "Member"}</h2>
            <span className="payment-pending-badge">{status}</span>
          </div>

          <div className="admin-payment-grid">
            <p><strong>Receipt No:</strong> {receiptNumber}</p>
            <p><strong>Member ID:</strong> {item.member_id}</p>
            <p><strong>Payment ID:</strong> {item.payment_id}</p>
            <p><strong>Plan:</strong> {item.plan_name || "N/A"}</p>
            <p><strong>Amount:</strong> {money(item.amount)}</p>
            <p><strong>Payment Method:</strong> {item.payment_method || "N/A"}</p>
            <p><strong>Transaction ID:</strong> {item.transaction_id || "N/A"}</p>
            <p><strong>Payment Status:</strong> {item.payment_status || "N/A"}</p>
            <p><strong>Paid At:</strong> {formatDate(item.paid_at)}</p>

            {!pending && (
              <>
                <p><strong>Verified At:</strong> {formatDate(item.verified_at)}</p>
                <p><strong>Membership:</strong> {item.request_status || "N/A"}</p>
              </>
            )}
          </div>
        </div>

        {/* RECEIPT ACTION BUTTONS */}
        <div className="admin-payment-actions receipt-actions">
          <button
            type="button"
            className="view-receipt-btn"
            onClick={() => setSelectedPayment(item)}
          >
            VIEW RECEIPT
          </button>

          <button
            type="button"
            className="print-receipt-btn"
            onClick={() => printAdminReceipt(item)}
          >
            PRINT RECEIPT
          </button>

          {pending &&
            String(item.verification_status || "pending").toLowerCase() ===
              "pending" && (
              <button
                type="button"
                className="admin-approve-payment-btn"
                disabled={busyId === item.payment_id}
                onClick={() => approvePayment(item.payment_id)}
              >
                {busyId === item.payment_id
                  ? "APPROVING..."
                  : "APPROVE PAYMENT"}
              </button>
            )}
        </div>
      </article>
    );
  }

  if (!admin) return null;

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-top-bar">
        <div>
          <p className="dashboard-role-title">ADMIN PANEL</p>
          <h2 style={{ color: "#fff" }}>GYMFIT Management</h2>
        </div>

        <button className="logout-btn" onClick={logout}>
          LOGOUT
        </button>
      </div>

      <div className="dashboard-header">
        <p>GYMFIT ADMIN</p>
        <h1>Admin Dashboard</h1>
        <p>Manage members, registrations and payments from one place.</p>
      </div>

      {message && <div className="dashboard-message">{message}</div>}

      <div className="admin-dashboard-layout">
        <aside className="admin-dashboard-sidebar">
          <h3>MENU</h3>

          {sections.map(([id, title, list]) => (
            <button
              type="button"
              key={id}
              className={
                activeSection === id
                  ? "admin-menu-btn active"
                  : "admin-menu-btn"
              }
              onClick={() => changeSection(id)}
            >
              <span>{title}</span>
              <strong>{list.length}</strong>
            </button>
          ))}
        </aside>

        <main className="admin-dashboard-main">
          <section className="admin-record-tools">
            <h2>Search &amp; Filter Records</h2>

            <div className="admin-record-search">
              <label htmlFor="admin-search">Search</label>
              <input
                id="admin-search"
                type="search"
                value={search}
                placeholder={
                  isPayment
                    ? "Search member, plan, transaction ID..."
                    : "Search name, email, phone or member ID..."
                }
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="admin-record-filters">
              {!isPayment ? (
                <div>
                  <label htmlFor="member-filter">Member Status</label>
                  <select
                    id="member-filter"
                    value={memberStatus}
                    onChange={(event) => {
                      setMemberStatus(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">All Members</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="payment-filter">Payment Status</label>
                    <select
                      id="payment-filter"
                      value={paymentStatus}
                      onChange={(event) => {
                        setPaymentStatus(event.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="all">All Payments</option>
                      <option value="success">Success</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="verification-filter">
                      Verification Status
                    </label>
                    <select
                      id="verification-filter"
                      value={verificationStatus}
                      onChange={(event) => {
                        setVerificationStatus(event.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="admin-record-controls">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMemberStatus("all");
                  setPaymentStatus("all");
                  setVerificationStatus("all");
                  setPage(1);
                }}
              >
                CLEAR FILTERS
              </button>

              <button
                type="button"
                onClick={loadAllData}
                disabled={loading}
              >
                {loading ? "LOADING..." : "REFRESH RECORDS"}
              </button>
            </div>
          </section>

          <section
            className={
              isPayment ? "admin-payment-list" : "admin-members-list"
            }
          >
            <div
              className={
                isPayment ? "admin-payment-header" : "dashboard-header"
              }
            >
              <p>{isPayment ? "PAYMENT RECORDS" : "MEMBER RECORDS"}</p>
              <h2>{current?.[1] || "Records"}</h2>
              <span>
                {loading
                  ? "Loading records..."
                  : `Showing ${
                      filteredRecords.length
                        ? (currentPage - 1) * pageSize + 1
                        : 0
                    }–${Math.min(
                      currentPage * pageSize,
                      filteredRecords.length
                    )} of ${filteredRecords.length} records`}
              </span>
            </div>

            {loading ? (
              <div className="empty-state">
                <h2>Loading...</h2>
              </div>
            ) : visibleRecords.length === 0 ? (
              <div className="empty-state">
                <h2>No Records Found</h2>
                <p>Change the search text or filters.</p>
              </div>
            ) : (
              visibleRecords.map((item) => {
                if (activeSection === "pending-members") {
                  return memberCard(item, "pending-members");
                }

                if (activeSection === "member-history") {
                  return memberCard(item, "member-history");
                }

                if (activeSection === "active-members") {
                  return memberCard(item, "active-members");
                }

                return paymentCard(
                  item,
                  activeSection === "pending-payments"
                );
              })
            )}

            {!loading && filteredRecords.length > 0 && (
              <div className="admin-record-pagination">
                <label htmlFor="page-size">Rows per page</label>

                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((value) => Math.max(1, value - 1))
                  }
                >
                  PREVIOUS
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((value) =>
                      Math.min(totalPages, value + 1)
                    )
                  }
                >
                  NEXT
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ADMIN RECEIPT PREVIEW */}
      {selectedPayment && (
        <div
          className="admin-receipt-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
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
            className="admin-receipt-modal"
            style={{
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              color: "#222",
              padding: 24,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #e0ab32",
                paddingBottom: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>GYMFIT</h2>
                <p style={{ marginBottom: 0 }}>Payment Receipt</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
              >
                CLOSE
              </button>
            </div>

            <h3>
              Receipt No:{" "}
              {selectedPayment.receipt_number ||
                `RCP-${String(
                  selectedPayment.payment_id || "N/A"
                ).padStart(6, "0")}`}
            </h3>

            {[
              ["Member Name", selectedPayment.member_name],
              ["Member ID", selectedPayment.member_id],
              [
                "Email",
                selectedPayment.member_email || selectedPayment.email,
              ],
              ["Payment ID", selectedPayment.payment_id],
              ["Plan", selectedPayment.plan_name],
              ["Amount", money(selectedPayment.amount)],
              ["Payment Method", selectedPayment.payment_method],
              ["Transaction ID", selectedPayment.transaction_id],
              ["Payment Status", selectedPayment.payment_status],
              [
                "Verification Status",
                paymentVerificationLabel(
                  selectedPayment.verification_status
                ),
              ],
              ["Paid At", formatDate(selectedPayment.paid_at)],
              ["Verified At", formatDate(selectedPayment.verified_at)],
              ["Membership Status", selectedPayment.request_status],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <span>{label}</span>
                <strong
                  style={{
                    textAlign: "right",
                    overflowWrap: "anywhere",
                  }}
                >
                  {value || "N/A"}
                </strong>
              </div>
            ))}

            <p style={{ marginTop: 20, lineHeight: 1.6 }}>
              {paymentVerificationLabel(
                selectedPayment.verification_status
              ) === "Approved"
                ? "Payment verified by gym administration."
                : paymentVerificationLabel(
                    selectedPayment.verification_status
                  ) === "Rejected"
                ? "Payment verification was rejected. Contact gym administration."
                : "Payment verification is pending. This is not a confirmed approved receipt."}
            </p>

            <button
              type="button"
              className="print-receipt-btn"
              onClick={() => printAdminReceipt(selectedPayment)}
              style={{
                width: "100%",
                padding: 13,
                marginTop: 12,
                border: "none",
                borderRadius: 8,
                background: "#16803c",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              PRINT RECEIPT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}