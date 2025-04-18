import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

const Navbar = ({ isAdmin: propIsAdmin }) => {
    const [active, setActive] = useState(1);
    const [cookies, , removeCookie] = useCookies(["authToken"]);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(propIsAdmin || localStorage.getItem("isAdmin") === "true");
    const [authError, setAuthError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("Navbar: propIsAdmin:", propIsAdmin, "localStorage isAdmin:", localStorage.getItem("isAdmin")); // Debug
        if (propIsAdmin !== undefined) {
            setIsAdmin(propIsAdmin);
            localStorage.setItem("isAdmin", propIsAdmin.toString());
        }
    }, [propIsAdmin]);

    useEffect(() => {
        const checkIsAdmin = () => {
            const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
            if (storedIsAdmin !== isAdmin) {
                console.log("Navbar: isAdmin changed in localStorage:", storedIsAdmin); // Debug
                setIsAdmin(storedIsAdmin);
            }
        };
        window.addEventListener("storage", checkIsAdmin);
        const interval = setInterval(checkIsAdmin, 500);
        return () => {
            window.removeEventListener("storage", checkIsAdmin);
            clearInterval(interval);
        };
    }, [isAdmin]);

    const verifyAuth = async (retries = 3, delay = 1500) => {
        try {
            const token = localStorage.getItem("authToken");
            const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
            console.log("Navbar: Token from localStorage:", token, "Stored isAdmin:", storedIsAdmin); // Debug
            if (!token) {
                throw new Error("No token found");
            }
            const headers = {
                "Content-Type": "application/json",
                Accept: "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await axios.get(`${import.meta.env.VITE_SERVER}/auth`, {
                headers,
                withCredentials: true,
            });
            console.log("Navbar: Auth response:", response.data); // Debug
            const isAdminStatus = response.data?.isAdmin || storedIsAdmin || false;
            setIsAdmin(isAdminStatus);
            localStorage.setItem("isAdmin", isAdminStatus.toString());
            setAuthError("");
        } catch (error) {
            console.error("Navbar: Auth check failed:", error.message, error.response?.data); // Debug
            if (retries > 0) {
                console.log(`Navbar: Retrying auth check, ${retries} attempts left`); // Debug
                await new Promise(resolve => setTimeout(resolve, delay));
                return verifyAuth(retries - 1, delay);
            }
            const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
            setIsAdmin(storedIsAdmin);
            setAuthError(storedIsAdmin ? "" : "Failed to verify admin status. Please try logging in again.");
        }
    };

    useEffect(() => {
        if (cookies.authToken || localStorage.getItem("authToken")) {
            verifyAuth();
        } else {
            setIsAdmin(false);
            localStorage.setItem("isAdmin", "false");
            setAuthError("No authentication token found.");
        }
    }, [cookies.authToken]);

    const handleLogout = async () => {
        const token = localStorage.getItem("authToken");
        if (!cookies.authToken && !token) {
            console.log("No tokens found, redirecting to /login"); // Debug
            navigate("/login");
            return;
        }

        setShowSpinner(true);
        setAuthError("");

        try {
            const headers = {
                "Content-Type": "application/json",
                Accept: "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER}/logout`,
                {},
                { headers, withCredentials: true }
            );
            console.log("Logout response:", response.data); // Debug
            removeCookie("authToken", { path: "/", sameSite: "none", secure: true });
            removeCookie("adminToken", { path: "/", sameSite: "none", secure: true });
            localStorage.removeItem("authToken");
            localStorage.setItem("isAdmin", "false");
            setIsAdmin(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error.message, error.response?.data); // Debug
            setAuthError("Logout failed. Please try again.");
            removeCookie("authToken", { path: "/", sameSite: "none", secure: true });
            removeCookie("adminToken", { path: "/", sameSite: "none", secure: true });
            localStorage.removeItem("authToken");
            localStorage.setItem("isAdmin", "false");
            setIsAdmin(false);
            navigate("/login");
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <nav className="navbar">
            <h2>DarkShield</h2>
            {authError && <p style={{ color: "red" }}>{authError}</p>}
            <ul>
                <li>
                    <Link to="/" className={active===1?"active":""} onClick={() => setActive(1)}>Home</Link>
                </li>
                <li>
                    <Link to="/tools" className={active===2?"active":""} onClick={() => setActive(2)}>Tools</Link>
                </li>
                <li>
                    <Link to="/contact" className={active===3?"active":""} onClick={() => setActive(3)}>Contact</Link>
                </li>
                <li>
                    <Link to="/about" className={active===4?"active":""} onClick={() => setActive(4)}>About</Link>
                </li>
                {isAdmin && (
                    <li>
                        <Link to="/admin" className={active===5?"active":""} onClick={() => setActive(5)}>Admin</Link>
                    </li>
                )}
            </ul>
            <button onClick={handleLogout}>
                {showSpinner ? (
                    <div className="spinner"></div>
                ) : "Logout"}
            </button>
        </nav>
    );
};

export default Navbar;