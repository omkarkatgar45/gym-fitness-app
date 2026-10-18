import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Payment.css";

function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [request, setRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchMembershipRequest = async () => {
      if (!requestId) {
        setError("Membership request ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/membership/request/${requestId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load membership request."
          );
        }

        setRequest(data.request);
      } catch (err) {
        setError(err.message || "Failed to load membership request.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipRequest();
  }, [requestId]);

  const handleMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setError("");
    setSuccess("");
    setTransactionId("");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (paymentMethod === "Card") {
      setError("Card Payment Not Available.");
      return;
    }

    if (paymentMethod === "UPI" && !transactionId.trim()) {
      setError("Please enter your UPI transaction ID.");
      return;
    }

    if (!requestId || !Number.isInteger(Number(requestId))) {
      setError("Valid Membership request ID is required.");
      return;
    }

    try {
      setPaying(true);

      const response = await fetch(
        "http://localhost:5000/api/membership/payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            membershipRequestId: Number(requestId),
            paymentMethod,
            // Cash sathi transaction ID nahi lagat.
            // Backend la non-empty value required asel tar
            // temporary CASH reference pathavla aahe.
            transactionId:
              paymentMethod === "UPI"
                ? transactionId.trim()
                : "CASH",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment failed.");
      }

      setPaymentData(data.payment);
      setSuccess("Payment recorded successfully.");
      setTransactionId("");
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-form-card">
            <h2>Loading...</h2>
            <p>Please wait while we load your membership details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-form-card">
            <div className="payment-error">{error}</div>

            <button
              type="button"
              className="payment-back-btn"
              onClick={() => navigate("/membership")}
            >
              Back to Membership
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <p className="payment-label">GYMFIT PAYMENT</p>
          <h1>Complete Your Membership Payment</h1>
          <p>
            Review your membership details and submit your transaction
            information.
          </p>
        </div>

        {error && <div className="payment-error">{error}</div>}

        {success && !paymentData && (
          <div className="payment-success">
            <p>{success}</p>
          </div>
        )}

        {!paymentData && (
          <div className="payment-layout">
            <div className="payment-summary-card">
              <h2>Membership Summary</h2>

              <div className="payment-summary-row">
                <span>Member Name</span>
                <strong>{request.member_name}</strong>
              </div>

              <div className="payment-summary-row">
                <span>Request ID</span>
                <strong>#{request.membership_request_id}</strong>
              </div>

              <div className="payment-summary-row">
                <span>Plan</span>
                <strong>{request.plan_name}</strong>
              </div>

              <div className="payment-summary-row">
                <span>Duration</span>
                <strong>{request.duration_months} Month(s)</strong>
              </div>

              <div className="payment-summary-row payment-total-row">
                <span>Total Amount</span>
                <strong>
                  ₹{Number(request.price).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="payment-form-card">
              <h2>Payment Details</h2>

              <form onSubmit={handlePayment}>
                <div className="payment-form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>

                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={handleMethodChange}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                {paymentMethod === "UPI" && (
                  <>
                    <div className="upi-scanner">
                      <h3>Scan &amp; Pay</h3>
                      <p>
                        Open your UPI app and scan the gym's official QR code.
                      </p>

                      <img
                        src="/upi-qr.png"
                        alt="GYMFIT UPI payment QR code"
                        className="upi-qr-image"
                      />

                      <p className="upi-note">
                        Pay the exact amount shown above. Enter your
                        transaction ID after completing payment.
                      </p>
                    </div>

                    <div className="payment-form-group">
                      <label htmlFor="transactionId">
                        Transaction ID / Reference Number
                      </label>

                      <input
                        id="transactionId"
                        type="text"
                        placeholder="Enter UPI transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {paymentMethod === "Card" && (
                  <div className="cash-payment-note">
                    <h3>Card Payment Not Available</h3>
                    <p>Please select UPI or Cash to continue.</p>
                  </div>
                )}

                {paymentMethod === "Cash" && (
                  <div className="cash-payment-note">
                    <h3>Cash Payment</h3>
                    <p>
                      Cash gym staff kade receive ani verify zalyanantar
                      payment confirm hoil. Transaction ID required nahi.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="payment-submit-btn"
                  disabled={paying || paymentMethod === "Card"}
                >
                  {paying
                    ? "Processing..."
                    : `Pay Now — ₹${Number(request.price).toLocaleString(
                        "en-IN"
                      )}`}
                </button>
              </form>

              <p className="payment-note">
                UPI transaction details are recorded by GYMFIT. Cash payment
                must be verified by gym staff.
              </p>
            </div>
          </div>
        )}

        {paymentData && (
          <div className="payment-receipt-card">
            <div className="payment-success-icon">✓</div>
            <h2>Payment Recorded</h2>
            <p>Your payment transaction has been recorded.</p>

            <div className="payment-receipt-details">
              <div>
                <span>Payment ID</span>
                <strong>#{paymentData.id}</strong>
              </div>

              <div>
                <span>Request ID</span>
                <strong>#{paymentData.membership_request_id}</strong>
              </div>

              <div>
                <span>Plan</span>
                <strong>{paymentData.plan_name}</strong>
              </div>

              <div>
                <span>Amount</span>
                <strong>
                  ₹{Number(paymentData.amount).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>{paymentData.payment_method}</strong>
              </div>

              <div>
                <span>Transaction ID</span>
                <strong>
                  {paymentData.transaction_id || "N/A"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{paymentData.payment_status}</strong>
              </div>
            </div>

            <button
              type="button"
              className="payment-dashboard-btn"
              onClick={() => navigate("/member-dashboard")}
            >
              Go to Member Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payment;