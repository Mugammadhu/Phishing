import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

const Navbar = () => {
    const [active, setActive] = useState(1);
    const [cookies, , removeCookie] = useCookies(["authToken"]);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authError, setAuthError] = useState(""); // New: Track auth errors
    const navigate = useNavigate();

    const verifyAuth = async (retries = 2, delay = 1000) => {
        try {
            const token = localStorage.getItem("authToken");
            console.log("Navbar: Token from localStorage:", token); // Debug
            if (!token) {
                throw new Error("No token found");
            }
            const headers = {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };
            const response = await axios.get(`${import.meta.env.VITE_SERVER}/auth`, {
                headers,
                withCredentials: true,
            });
            console.log("Navbar: Auth response:", response.data); // Debug
            setIsAdmin(response.data?.isAdmin || false);
            setAuthError("");
        } catch (error) {
            console.error("Navbar: Auth check failed:", error.message, error.response?.data); // Debug
            if (retries > 0) {
                console.log(`Navbar: Retrying auth check, ${retries} attempts left`); // Debug
                await new Promise(resolve => setTimeout(resolve, delay));
                return verifyAuth(retries - 1, delay);
            }
            setIsAdmin(false);
            setAuthError("Failed to verify admin status. Please try logging in again.");
        }
    };

    useEffect(() => {
        if (cookies.authToken || localStorage.getItem("authToken")) {
            verifyAuth();
        } else {
            setIsAdmin(false);
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
            setIsAdmin(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error.message, error.response?.data); // Debug
            setAuthError("Logout failed. Please try again.");
            removeCookie("authToken", { path: "/", sameSite: "none", secure: true });
            removeCookie("adminToken", { path: "/", sameSite: "none", secure: true });
            localStorage.removeItem("authToken");
            setIsAdmin(false);
            navigate("/login");
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <nav className="navbar">
            <h2>DarkShield</h2>
            {authError && <p style={{ color: "red" }}>{authError}</p>} {/* Display auth errors */}
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
            <div>
                <button onClick={handleLogout}>
                    {showSpinner ? (
                        <div className="spinner"></div>
                    ) : "Logout"}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;