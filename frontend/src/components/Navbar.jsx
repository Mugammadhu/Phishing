import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [active, setActive] = useState(0);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));
  const navigate = useNavigate();
  const location = useLocation();

  // Sync active state with current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setActive(1);
    } else if (path === "/phishing") {
      setActive(2);
    } else if (path === "/signup") {
      setActive(3);
    } else if (path === "/login") {
      setActive(4);
    } else if (path === "/admin/urls") {
      setActive(5);
    } else {
      setActive(0); // Default: no active tab
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    setIsLoggedIn(false);
    setActive(0);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Phishing Detection
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${active === 1 ? "active" : ""}`}
                to="/"
                onClick={() => setActive(1)}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${active === 2 ? "active" : ""}`}
                to="/phishing"
                onClick={() => setActive(2)}
              >
                Phishing
              </Link>
            </li>
            {!isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === 3 ? "active" : ""}`}
                    to="/signup"
                    onClick={() => setActive(3)}
                  >
                    Signup
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === 4 ? "active" : ""}`}
                    to="/login"
                    onClick={() => setActive(4)}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${active === 5 ? "active" : ""}`}
                  to="/admin/urls"
                  onClick={() => setActive(5)}
                >
                  URLs
                </Link>
              </li>
            )}
            {isLoggedIn && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;