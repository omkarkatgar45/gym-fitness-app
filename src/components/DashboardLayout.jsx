
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const menus = {
  member: {
    title: "MEMBER MENU",
    dashboard: "/member-dashboard",
    items: [
      { label: "Dashboard", target: "member-overview" },
      { label: "My Membership", target: "member-membership" },
      { label: "My Workout Plans", target: "member-workouts" },
      { label: "My Attendance", target: "member-attendance" },
    ],
  },

  admin: {
    title: "ADMIN MENU",
    dashboard: "/admin-dashboard",
    items: [
      { label: "Dashboard", path: "/admin-dashboard" },
      { label: "Admin Reports", path: "/admin-reports" },
      { label: "Admin Records", path: "/admin-records" },
    ],
  },

  trainer: {
    title: "TRAINER MENU",
    dashboard: "/trainer-dashboard",
    items: [
      { label: "Dashboard", target: "trainer-overview" },
      { label: "Member Attendance", target: "trainer-attendance" },
      {
        label: "Workout Plan Management",
        target: "trainer-workout-plan",
      },
    ],
  },
};

export default function DashboardLayout({ role, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const menu = menus[role];

  useEffect(() => {
    if (!location.hash) return;

    window.requestAnimationFrame(() => {
      const id = decodeURIComponent(location.hash.slice(1));
      const section = document.getElementById(id);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }, [location.pathname, location.hash]);

  if (!menu) {
    return children;
  }

  function handleSectionClick(target) {
    if (location.pathname !== menu.dashboard) {
      navigate(`${menu.dashboard}#${target}`);
      return;
    }

    const section = document.getElementById(target);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="gym-dashboard-layout">
      <style>{`
        .gym-dashboard-layout {
          display: flex !important;
          flex-direction: row !important;
          align-items: stretch;
          width: 100%;
          min-height: 100vh;
          background: #07090d;
        }

        .gym-dashboard-sidebar {
          box-sizing: border-box;
          flex: 0 0 245px;
          width: 245px;
          min-width: 245px;
          height: 100vh;
          min-height: 100vh;
          position: sticky;
          top: 0;
          align-self: flex-start;
          display: flex;
          flex-direction: column;
          padding: 26px 15px;
          overflow-y: auto;
          background: #101216;
          border-right: 1px solid rgba(255,255,255,0.1);
          z-index: 100;
        }

        .gym-dashboard-brand {
          display: block;
          margin: 0 10px 35px;
          color: #ffffff;
          text-decoration: none;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .gym-dashboard-brand span {
          color: #e0ab32;
        }

        .gym-dashboard-menu-title {
          margin: 0 10px 15px;
          color: #e0ab32;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .gym-dashboard-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gym-dashboard-menu a,
        .gym-dashboard-menu button {
          box-sizing: border-box;
          display: block;
          width: 100%;
          padding: 13px 12px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #d4d7dd;
          text-align: left;
          text-decoration: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          overflow-wrap: anywhere;
          transition: 0.2s ease;
        }

        .gym-dashboard-menu a:hover,
        .gym-dashboard-menu button:hover {
          color: #e0ab32;
          background: rgba(224,171,50,0.09);
          border-color: rgba(224,171,50,0.22);
        }

        .gym-dashboard-public-home {
          display: block;
          margin-top: auto;
          padding: 15px 10px 5px;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #aeb4bf;
          text-decoration: none;
          font-size: 13px;
        }

        .gym-dashboard-public-home:hover {
          color: #e0ab32;
        }

        .gym-dashboard-main {
          flex: 1 1 0%;
          min-width: 0;
          width: 0;
        }

        .gym-dashboard-main [id] {
          scroll-margin-top: 20px;
        }

        @media (max-width: 760px) {
          .gym-dashboard-layout {
            display: flex !important;
            flex-direction: row !important;
          }

          .gym-dashboard-sidebar {
            box-sizing: border-box;
            flex: 0 0 155px;
            width: 155px;
            min-width: 155px;
            height: 100vh;
            min-height: 100vh;
            position: sticky;
            top: 0;
            padding: 18px 8px;
          }

          .gym-dashboard-brand {
            margin: 0 5px 25px;
            font-size: 22px;
          }

          .gym-dashboard-menu-title {
            margin: 0 5px 12px;
            font-size: 10px;
            letter-spacing: 1px;
          }

          .gym-dashboard-menu {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .gym-dashboard-menu a,
          .gym-dashboard-menu button {
            width: 100%;
            min-width: 0;
            padding: 12px 7px;
            font-size: 11px;
          }

          .gym-dashboard-main {
            flex: 1 1 0%;
            width: 0;
            min-width: 0;
          }

          .gym-dashboard-public-home {
            font-size: 11px;
          }
        }
      `}</style>

      <aside className="gym-dashboard-sidebar">
        <Link to="/" className="gym-dashboard-brand">
          GYM<span>FIT</span>
        </Link>

        <p className="gym-dashboard-menu-title">
          {menu.title}
        </p>

        <nav className="gym-dashboard-menu">
          {menu.items.map((item) =>
            item.path ? (
              <Link key={item.label} to={item.path}>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSectionClick(item.target)}
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <Link to="/" className="gym-dashboard-public-home">
          ← Public Home
        </Link>
      </aside>

      <main className="gym-dashboard-main">
        {children}
      </main>
    </div>
  );
}
