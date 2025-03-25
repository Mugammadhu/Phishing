import { Link, useNavigate } from "react-router-dom";
import '../styles/navbar.css';
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
                const response = await axios.get("http://localhost:3000/auth", {
                    withCredentials: true,
                });
                setIsAdmin(response.data?.isAdmin || false);
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setIsAdmin(false);
            }
        };
        
        if (cookies.authToken) {
            verifyAuth();
        } else {
            setIsAdmin(false);
        }
    }, [cookies.authToken]);

    const handleLogout = async () => {
        if (!cookies.authToken) return;
        setShowSpinner(true);
        
        try {
            // Start both the logout request and the timer simultaneously
            await Promise.all([
                axios.post(
                    "http://localhost:3000/logout", 
                    {}, 
                    { withCredentials: true }
                ),
                new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second delay
            ]);
            
            removeCookie("authToken", { path: "/" });
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