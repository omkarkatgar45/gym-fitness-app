import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

const API = "http://localhost:5000";

export default function TrainerDashboard() {
  const [user, setUser] = useState(null);
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [attendance, setAttendance] = useState(null);

  const [planTitle, setPlanTitle] = useState("");
  const [exercises, setExercises] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/trainer-login";
      return;
    }

    try {
      const data = JSON.parse(savedUser);

      if (data.role_id !== 3) {
        window.location.href = "/trainer-login";
        return;
      }

      setUser(data);
    } catch {
      localStorage.clear();
      window.location.href = "/trainer-login";
    }
  }, []);

  useEffect(() => {
    if (!memberId) {
      setMemberName("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setMemberLoading(true);
        setMemberName("");

        const res = await fetch(
          `${API}/api/members/${Number(memberId)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Member not found.");
          return;
        }

        setMemberName(data.member?.member_name || "");
        setMessage("");
      } catch {
        setMessage("Unable to connect to backend.");
      } finally {
        setMemberLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [memberId]);

  async function handleAttendance(type) {
    if (!memberId || !memberName) {
      setMessage("Enter a valid Member ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setAttendance(null);

      const res = await fetch(
        `${API}/api/attendance/${type}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: Number(memberId),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || `${type} failed.`);
        return;
      }

      setAttendance(data.attendance);
      setMessage(
        type === "check-in"
          ? "Member checked in successfully."
          : "Member checked out successfully."
      );
    } catch {
      setMessage("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  async function createWorkoutPlan(e) {
    e.preventDefault();

    if (!user?.id) {
      setMessage("Trainer session not found.");
      return;
    }

    if (!memberId || !memberName) {
      setMessage("Enter a valid Member ID.");
      return;
    }

    if (!planTitle.trim() || !exercises.trim()) {
      setMessage("Plan title and exercises are required.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setMessage("End date cannot be before start date.");
      return;
    }

    try {
      setWorkoutLoading(true);
      setMessage("");
      setWorkoutPlan(null);

      const res = await fetch(`${API}/api/workout-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: Number(user.id),
          memberId: Number(memberId),
          planTitle: planTitle.trim(),
          exercises: exercises.trim(),
          notes: notes.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Unable to create workout plan."
        );
        return;
      }

      setWorkoutPlan(data.workoutPlan);
      setMessage(
        data.message || "Workout plan created successfully."
      );

      setPlanTitle("");
      setExercises("");
      setNotes("");
      setStartDate("");
      setEndDate("");
    } catch {
      setMessage("Unable to connect to backend.");
    } finally {
      setWorkoutLoading(false);
    }
  }

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A";

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "N/A";

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-top-bar">
        <div>
          <p className="dashboard-role-title">
            TRAINER PORTAL
          </p>
          <h2 style={{ margin: "6px 0 0", color: "#fff" }}>
            Welcome, {user.full_name}
          </h2>
        </div>

        <LogoutButton />
      </div>

      <div className="dashboard-header">
        <p>TRAINER PORTAL</p>
        <h1>Attendance Management</h1>
        <span>
          Record member check-in and check-out and create workout
          plans.
        </span>
      </div>

      <div className="trainer-attendance-card">
        <h2>Member Attendance</h2>
        <p>Enter Member ID and record attendance.</p>

        <div className="trainer-member-input">
          <label>Member ID</label>
          <input
            type="number"
            min="1"
            placeholder="Enter Member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />

          {memberLoading && (
            <p style={{ marginTop: "10px" }}>
              Finding member...
            </p>
          )}

          {!memberLoading && memberName && (
            <div
              style={{
                marginTop: "14px",
                padding: "14px 16px",
                border: "1px solid #333",
                borderRadius: "10px",
              }}
            >
              <span style={{ display: "block", fontSize: "12px" }}>
                MEMBER NAME
              </span>
              <strong>{memberName}</strong>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            disabled={loading || memberLoading || !memberName}
            onClick={() => handleAttendance("check-in")}
          >
            {loading ? "Processing..." : "Check In"}
          </button>

          <button
            type="button"
            disabled={loading || memberLoading || !memberName}
            onClick={() => handleAttendance("check-out")}
          >
            {loading ? "Processing..." : "Check Out"}
          </button>
        </div>

        {message && (
          <div className="dashboard-message">{message}</div>
        )}

        {attendance && (
          <div className="trainer-attendance-result">
            <h3>Attendance Recorded</h3>

            <div className="attendance-row">
              <div>
                <span>Member</span>
                <strong>
                  {attendance.member_name || memberName}
                </strong>
              </div>

              <div>
                <span>Member ID</span>
                <strong>
                  {attendance.member_id || memberId}
                </strong>
              </div>
            </div>

            <div className="attendance-row">
              <div>
                <span>Attendance Date</span>
                <strong>
                  {formatDate(attendance.attendance_date)}
                </strong>
              </div>

              <div>
                <span>Check In</span>
                <strong>
                  {attendance.check_in
                    ? formatTime(attendance.check_in)
                    : "N/A"}
                </strong>
              </div>
            </div>

            <div className="attendance-row">
              <div>
                <span>Check Out</span>
                <strong>
                  {attendance.check_out
                    ? formatTime(attendance.check_out)
                    : "Currently Checked In"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="dashboard-header"
        style={{ marginTop: "55px" }}
      >
        <p>TRAINER PORTAL</p>
        <h1>Workout Plan Management</h1>
        <span>
          Create workout plans for your members.
        </span>
      </div>

      <div className="trainer-attendance-card">
        <h2>Create Workout Plan</h2>

        <form onSubmit={createWorkoutPlan}>
          <div className="trainer-member-input">
            <label>Member ID</label>
            <input
              type="number"
              min="1"
              placeholder="Enter Member ID"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
          </div>

          <div className="trainer-member-input">
            <label>Workout Plan Title</label>
            <input
              type="text"
              placeholder="Example: Beginner Strength Plan"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
            />
          </div>

          <div className="trainer-member-input">
            <label>Exercises</label>
            <textarea
              rows="7"
              placeholder={`Monday - Chest + Triceps
Tuesday - Back + Biceps
Wednesday - Rest
Thursday - Legs
Friday - Shoulders
Saturday - Cardio`}
              value={exercises}
              onChange={(e) => setExercises(e.target.value)}
            />
          </div>

          <div className="trainer-member-input">
            <label>Notes</label>
            <textarea
              rows="4"
              placeholder="Diet instructions, rest time, trainer notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div className="trainer-member-input">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="trainer-member-input">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={workoutLoading || !memberName}
          >
            {workoutLoading
              ? "Creating..."
              : "Create Workout Plan"}
          </button>
        </form>

        {workoutPlan && (
          <div
            className="trainer-attendance-result"
            style={{ marginTop: "25px" }}
          >
            <h3>Workout Plan Created</h3>

            <div className="attendance-row">
              <div>
                <span>Member</span>
                <strong>
                  {workoutPlan.member_name}
                </strong>
              </div>

              <div>
                <span>Trainer</span>
                <strong>
                  {workoutPlan.trainer_name}
                </strong>
              </div>
            </div>

            <div className="attendance-row">
              <div>
                <span>Plan</span>
                <strong>
                  {workoutPlan.plan_title}
                </strong>
              </div>

              <div>
                <span>Member ID</span>
                <strong>
                  {workoutPlan.member_id}
                </strong>
              </div>
            </div>

            <div className="attendance-row">
              <div>
                <span>Start Date</span>
                <strong>
                  {formatDate(workoutPlan.start_date)}
                </strong>
              </div>

              <div>
                <span>End Date</span>
                <strong>
                  {formatDate(workoutPlan.end_date)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}