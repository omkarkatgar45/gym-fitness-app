import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    let loginPage = "/login";

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (Number(user?.role_id) === 1) {
        loginPage = "/admin-login";
      } else if (Number(user?.role_id) === 3) {
        loginPage = "/trainer-login";
      }
    } catch {
      // Use Member Login if stored user data is invalid.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate(loginPage, { replace: true });
  }

  return (
    <button
      type="button"
      className="logout-btn"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}