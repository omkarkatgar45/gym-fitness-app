
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./HomeSidebar.css";

export default function Navbar() {
  const { pathname } = useLocation();

  const currentPath = pathname.replace(/\/+$/, "") || "/";

  const sidebarPages = [
    "/",
    "/membership",
    "/programs",
    "/trainers",
    "/contact",
    "/login",
    "/register",
    "/admin-login",
    "/trainer-login",
  ];

  const showSidebar = sidebarPages.includes(currentPath);

  useEffect(() => {
    document.body.classList.toggle("home-sidebar-active", showSidebar);

    return () => {
      document.body.classList.remove("home-sidebar-active");
    };
  }, [showSidebar]);

  return (
    <header className={`navbar ${showSidebar ? "home-sidebar" : ""}`}>
      <Link to="/" className="logo">
        GYM<span>FIT</span>
      </Link>

      <nav className="nav-links">
        <Link to="/" className={currentPath === "/" ? "active" : ""}>
          HOME
        </Link>

        <Link
          to="/membership"
          className={currentPath === "/membership" ? "active" : ""}
        >
          MEMBERSHIP
        </Link>

        <Link
          to="/programs"
          className={currentPath === "/programs" ? "active" : ""}
        >
          PROGRAMS
        </Link>

        <Link
          to="/trainers"
          className={currentPath === "/trainers" ? "active" : ""}
        >
          TRAINERS
        </Link>

        <Link
          to="/contact"
          className={currentPath === "/contact" ? "active" : ""}
        >
          CONTACT
        </Link>
      </nav>

      <div className="member-nav-actions">
        <Link to="/login" className="nav-btn">
          LOGIN
        </Link>

        <Link to="/register" className="nav-btn">
          JOIN NOW
        </Link>
      </div>

      <div className="admin-nav-action">
        <Link to="/admin-login" className="admin-login-btn">
          ADMIN
        </Link>

        <Link to="/trainer-login" className="trainer-login-btn">
          TRAINER
        </Link>
      </div>
    </header>
  );
}
