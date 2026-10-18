
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./AdminRecords.css";

const API = "http://localhost:5000";

export default function AdminRecords() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function get(url) {
    const response = await apiFetch(`${API}${url}`);
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Unable to load records.");
    }

    return data;
  }

  async function loadRecords() {
    setLoading(true);
    setError("");

    try {
      const [m, p] = await Promise.all([
        get("/api/members/history"),
        get("/api/membership/admin/payment-history"),
      ]);

      setMembers(Array.isArray(m.members) ? m.members : []);
      setPayments(Array.isArray(p.payments) ? p.payments : []);
    } catch (e) {
      setError(e.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadRecords();
  }, [user]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return members.filter((m) => {
      const matchesSearch = [
        m.member_id,
        m.full_name,
        m.email,
        m.phone,
        m.member_status,
        m.user_status,
      ].some((v) => String(v ?? "").toLowerCase().includes(q));

      const status = String(m.member_status || "").toLowerCase();
      const userStatus = String(m.user_status || "").toLowerCase();

      const matchesStatus =
        memberStatus === "all" ||
        (memberStatus === "inactive"
          ? userStatus === "inactive"
          : status === memberStatus);

      return matchesSearch && matchesStatus;
    });
  }, [members, search, memberStatus]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return payments.filter((p) => {
      const matchesSearch = [
        p.payment_id,
        p.member_id,
        p.member_name,
        p.email,
        p.member_email,
        p.plan_name,
        p.transaction_id,
        p.payment_method,
        p.amount,
      ].some((v) => String(v ?? "").toLowerCase().includes(q));

      const paid = String(p.payment_status || "").toLowerCase();
      const verified = String(
        p.verification_status || "pending"
      ).toLowerCase();

      return (
        matchesSearch &&
        (paymentStatus === "all" || paid === paymentStatus) &&
        (verificationStatus === "all" ||
          verified === verificationStatus)
      );
    });
  }, [payments, search, paymentStatus, verificationStatus]);

  const records =
    tab === "members" ? filteredMembers : filteredPayments;

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function changeTab(value) {
    setTab(value);
    setSearch("");
    setMemberStatus("all");
    setPaymentStatus("all");
    setVerificationStatus("all");
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setMemberStatus("all");
    setPaymentStatus("all");
    setVerificationStatus("all");
    setPage(1);
  }

  if (!user) return null;

  return (
    <div className="dashboard-page admin-records-page">
      <div className="records-topbar">
        <div>
          <p className="records-brand">GYMFIT ADMIN</p>
          <h2>Records Management</h2>
        </div>

        <button
          className="records-button"
          onClick={() => navigate("/admin-dashboard")}
        >
          ← Back to Admin
        </button>
      </div>

      <header className="records-header">
        <p>ADMIN PANEL</p>
        <h1>Search & Records</h1>
        <span>
          Search, filter and browse member and payment records.
        </span>
      </header>

      <div className="records-tabs">
        <button
          className={tab === "members" ? "active" : ""}
          onClick={() => changeTab("members")}
        >
          Members ({members.length})
        </button>

        <button
          className={tab === "payments" ? "active" : ""}
          onClick={() => changeTab("payments")}
        >
          Payments ({payments.length})
        </button>
      </div>

      <section className="records-panel">
        <h2>Find Records</h2>

        <div className="records-field">
          <label htmlFor="record-search">Search</label>
          <input
            id="record-search"
            type="search"
            placeholder={
              tab === "members"
                ? "Name, email, phone or member ID..."
                : "Member, transaction ID, plan or payment method..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="records-filters">
          {tab === "members" ? (
            <div className="records-field">
              <label htmlFor="member-status">Member Status</label>
              <select
                id="member-status"
                value={memberStatus}
                onChange={(e) => {
                  setMemberStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Members</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
          ) : (
            <>
              <div className="records-field">
                <label htmlFor="payment-status">Payment Status</label>
                <select
                  id="payment-status"
                  value={paymentStatus}
                  onChange={(e) => {
                    setPaymentStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All Payments</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="records-field">
                <label htmlFor="verification-status">
                  Verification Status
                </label>
                <select
                  id="verification-status"
                  value={verificationStatus}
                  onChange={(e) => {
                    setVerificationStatus(e.target.value);
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

        <div className="records-controls">
          <button className="records-button" onClick={clearFilters}>
            Clear Filters
          </button>

          <button
            className="records-button records-primary"
            onClick={loadRecords}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh Records"}
          </button>
        </div>
      </section>

      {error && <div className="records-error">{error}</div>}

      <div className="records-summary">
        {loading
          ? "Loading records..."
          : `Showing ${
              records.length ? (currentPage - 1) * pageSize + 1 : 0
            }–${Math.min(currentPage * pageSize, records.length)} of ${
              records.length
            } records`}
      </div>

      {loading ? (
        <div className="records-empty">
          <h2>Loading Records...</h2>
        </div>
      ) : !error && visibleRecords.length === 0 ? (
        <div className="records-empty">
          <h2>No Records Found</h2>
          <p>Try another search term or clear the filters.</p>
        </div>
      ) : (
        <div className="records-list">
          {tab === "members" &&
            visibleRecords.map((m, i) => (
              <article
                className="records-card"
                key={m.member_id ?? i}
              >
                <h3>{m.full_name || "Member"}</h3>

                <div className="records-info">
                  <div>
                    <span>Member ID</span>
                    <strong>{m.member_id ?? "N/A"}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{m.email || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{m.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Member Status</span>
                    <strong>{m.member_status || "N/A"}</strong>
                  </div>
                  <div>
                    <span>User Status</span>
                    <strong>{m.user_status || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Registration Date</span>
                    <strong>
                      {m.registration_date
                        ? new Date(m.registration_date).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </strong>
                  </div>
                </div>
              </article>
            ))}

          {tab === "payments" &&
            visibleRecords.map((p, i) => (
              <article
                className="records-card"
                key={p.payment_id ?? i}
              >
                <h3>{p.member_name || "Member"}</h3>

                <div className="records-info">
                  <div>
                    <span>Payment ID</span>
                    <strong>{p.payment_id ?? "N/A"}</strong>
                  </div>
                  <div>
                    <span>Member ID</span>
                    <strong>{p.member_id ?? "N/A"}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{p.member_email || p.email || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Plan</span>
                    <strong>{p.plan_name || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Amount</span>
                    <strong>
                      ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span>Transaction ID</span>
                    <strong>{p.transaction_id || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Payment Method</span>
                    <strong>{p.payment_method || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Payment Status</span>
                    <strong>{p.payment_status || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Verification Status</span>
                    <strong>{p.verification_status || "N/A"}</strong>
                  </div>
                  <div>
                    <span>Membership Status</span>
                    <strong>{p.request_status || "N/A"}</strong>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="records-pagination">
          <label htmlFor="page-size">Rows per page</label>

          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

          <button
            className="records-button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="records-button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
