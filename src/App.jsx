
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import DashboardLayout from "./components/DashboardLayout";

import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Membership from "./pages/Membership";
import Payment from "./pages/Payment";
import MemberDashboard from "./pages/MemberDashboard";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminRecords from "./pages/AdminRecords";

import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerLogin from "./pages/TrainerLogin";

import Programs from "./pages/Programs";
import Trainers from "./pages/Trainers";
import Contact from "./pages/Contact";
import "./pages/Home.css";

function AppContent() {
  const location = useLocation();

  const dashboardPaths = [
    "/member-dashboard",
    "/admin-dashboard",
    "/admin-reports",
    "/admin-records",
    "/trainer-dashboard",
  ];

  const hideNavbarPaths = [
    ...dashboardPaths,
    "/forgot-password",
    "/reset-password",
  ];

  const hideNavbar = hideNavbarPaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
  );

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        {/* Password Recovery */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Membership */}
        <Route path="/membership" element={<Membership />} />
        <Route path="/payment" element={<Payment />} />

        {/* General Pages */}
        <Route path="/programs" element={<Programs />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/contact" element={<Contact />} />

        {/* Member Dashboard */}
        <Route
          path="/member-dashboard"
          element={
            <DashboardLayout>
              <MemberDashboard />
            </DashboardLayout>
          }
        />

        {/* Admin Pages */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin-reports"
          element={
            <DashboardLayout>
              <AdminReports />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin-records"
          element={
            <DashboardLayout>
              <AdminRecords />
            </DashboardLayout>
          }
        />

        {/* Trainer Pages */}
        <Route path="/trainer-login" element={<TrainerLogin />} />
        <Route
          path="/trainer-dashboard"
          element={
            <DashboardLayout>
              <TrainerDashboard />
            </DashboardLayout>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="temporary-page">
              <h1>404</h1>
              <p>Page not found.</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}