import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Membership from "./pages/Membership";
import Registration from "./pages/Registration";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        {/* ================= NAVBAR ================= */}

        <nav className="navbar">

          <Link
            to="/"
            className="logo"
          >
            GYM<span>FIT</span>
          </Link>

          <div className="nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/membership">
              Membership
            </Link>

            <Link to="/programs">
              Programs
            </Link>

            <Link to="/trainers">
              Trainers
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </div>

          {/* PUBLIC LOGIN */}

          <Link
            to="/login"
            className="nav-btn"
          >
            Login
          </Link>

        </nav>


        {/* ================= ROUTES ================= */}

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* MEMBER LOGIN */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* MEMBERSHIP PLANS */}

          <Route
            path="/membership"
            element={<Membership />}
          />


          {/* MEMBER REGISTRATION */}

          <Route
            path="/register"
            element={<Registration />}
          />


          {/* PROGRAMS */}

          <Route
            path="/programs"
            element={
              <div className="temporary-page">

                <h1>
                  Programs
                </h1>

                <p>
                  Programs page will be created next.
                </p>

              </div>
            }
          />


          {/* TRAINERS */}

          <Route
            path="/trainers"
            element={
              <div className="temporary-page">

                <h1>
                  Trainers
                </h1>

                <p>
                  Trainers page will be created next.
                </p>

              </div>
            }
          />


          {/* CONTACT */}

          <Route
            path="/contact"
            element={
              <div className="temporary-page">

                <h1>
                  Contact
                </h1>

                <p>
                  Contact page will be created next.
                </p>

              </div>
            }
          />

        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;