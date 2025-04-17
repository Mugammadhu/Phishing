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
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const token = localStorage.getItem("authToken");
                console.log("Navbar: Token from localStorage:", token); // Debug
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
                setIsAdmin(response.data?.isAdmin || false);
            } catch (error) {
                console.error("Navbar: Auth check failed:", error.message); // Debug
                setIsAdmin(false);
            }
        };

        if (cookies.authToken || localStorage.getItem("authToken")) {
            verifyAuth();
        } else {
            setIsAdmin(false);
        }
    }, [cookies.authToken]);

    const handleLogout = async () => {
        if (!cookies.authToken && !localStorage.getItem("authToken")) return;
        setShowSpinner(true);

        try {
            await Promise.all([
                axios.post(
                    `${import.meta.env.VITE_SERVER}/logout`,
                    {},
                    { withCredentials: true }
                ),
                new Promise(resolve => setTimeout(resolve, 1500)),
            ]);
            removeCookie("authToken", { path: "/" });
            localStorage.removeItem("authToken"); // Clear localStorage
            setIsAdmin(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <nav className="navbar">
            <h2>DarkShield</h2>
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