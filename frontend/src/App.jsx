import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Notfound from "./components/Notfound";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Contact from "./components/Contact";
import Tools from "./components/Tools";
import Phishing from "./components/Phishing";
import { motion } from "framer-motion";
import "./App.css";
import Admin from "./components/Admin";
import Users from "./components/Users";
import ContactInfo from "./components/ContactInfo";
import DarkWeb from "./components/Darkweb";
import axios from "axios";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
    const [authError, setAuthError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

    useEffect(() => {
        console.log("App: Current path:", location.pathname, "authToken:", authToken); // Debug
        const verifyAuth = async (retries = 3, delay = 1500) => {
            try {
                const token = localStorage.getItem("authToken");
                const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
                console.log("App: Token from localStorage:", token, "Stored isAdmin:", storedIsAdmin); // Debug
                if (token && ["/login", "/signup"].includes(location.pathname)) {
                    setIsAuthenticated(true);
                    setIsAdmin(storedIsAdmin);
                    setAuthError("");
                    return;
                }
                if (!token && !["/login", "/signup"].includes(location.pathname)) {
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
                console.log("App: Auth response:", response.data); // Debug
                if (response.data.authenticated) {
                    setIsAuthenticated(true);
                    const isAdminStatus = response.data.isAdmin || storedIsAdmin || false;
                    setIsAdmin(isAdminStatus);
                    localStorage.setItem("isAdmin", isAdminStatus.toString());
                    setAuthError("");
                } else {
                    throw new Error(response.data.error || "Authentication failed");
                }
            } catch (error) {
                console.error("App: Authentication check failed:", error.message, error.response?.data); // Debug
                if (retries > 0) {
                    console.log(`App: Retrying auth check, ${retries} attempts left`); // Debug
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return verifyAuth(retries - 1, delay);
                }
                const token = localStorage.getItem("authToken");
                if (token) {
                    setIsAuthenticated(true);
                    setIsAdmin(localStorage.getItem("isAdmin") === "true");
                    setAuthError("");
                } else {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                    localStorage.setItem("isAdmin", "false");
                    setAuthError("Failed to verify authentication. Please log in again.");
                    if (!["/login", "/signup"].includes(location.pathname)) {
                        console.log("App: Redirecting to /login from:", location.pathname); // Debug
                        navigate("/login", { replace: true });
                    }
                }
            }
        };
        verifyAuth();
    }, [navigate, location.pathname, authToken]);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("authToken");
            if (token !== authToken) {
                console.log("App: authToken changed:", token); // Debug
                setAuthToken(token);
            }
        };
        window.addEventListener("storage", checkToken);
        const interval = setInterval(checkToken, 500);
        return () => {
            window.removeEventListener("storage", checkToken);
            clearInterval(interval);
        };
    }, [authToken]);

    if (isAuthenticated === null) {
        console.log("App: Rendering loading screen"); // Debug
        return (
            <div className="loading-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 1 }}
                    className="loader-container"
                >
                    <motion.div
                        className="logo-animation"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <i className="bi bi-shield-lock-fill"></i>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="loading-title"
                    >
                        Secure Zone
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                        className="loading-tagline"
                    >
                        Ensuring your safety in the digital world...
                    </motion.p>
                    <motion.div
                        className="progress-bar-container"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                    >
                        <div className="progress-bar"></div>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2, delay: 1.5 }}
                        className="loading-text"
                    >
                        Verifying Authentication...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    console.log("App: Rendering routes, isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin); // Debug
    return (
        <div>
            {authError && <p style={{ color: "red", textAlign: "center" }}>{authError}</p>}
            <Navbar isAdmin={isAdmin} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
                <Route path="/home" element={isAuthenticated ? <Home /> : <Login />} />
                <Route path="/tools" element={isAuthenticated ? <Tools /> : <Login />} />
                <Route path="/contact" element={isAuthenticated ? <Contact /> : <Login />} />
                <Route path="/about" element={isAuthenticated ? <About /> : <Login />} />
                <Route path="/phishing-checker" element={isAuthenticated ? <Phishing /> : <Login />} />
                <Route path="/dark-web" element={isAuthenticated ? <DarkWeb /> : <Login />} />
                <Route path="/admin" element={isAdmin ? <Admin /> : <Notfound />}>
                    <Route index element={<Users />} />
                    <Route path="contacts" element={<ContactInfo />} />
                </Route>
                <Route path="*" element={<Notfound />} />
            </Routes>
        </div>
    );
};

export default App;