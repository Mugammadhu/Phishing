import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to verify authentication
  const verifyAuth = async () => {
    try {
      const token = Cookies.get('auth_token'); // Get token from cookies

      if (!token) {
        setIsAuthenticated(false);
        if (location.pathname !== "/signup" && location.pathname !== "/login") {
          navigate("/login");
        }
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_SERVER}/auth`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
        withCredentials: true,
      });

      if (response.data.authenticated) {
        setIsAuthenticated(true);
        if (location.pathname === "/login" || location.pathname === "/signup") {
          navigate("/");  // Redirect to Home if already authenticated
        }
      } else {
        setIsAuthenticated(false);
        if (location.pathname !== "/signup" && location.pathname !== "/login") {
          navigate("/login");
        }
      }

      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      if (location.pathname !== "/signup" && location.pathname !== "/login") {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    verifyAuth();
  }, [navigate, location.pathname]);  // Dependency array ensures rerun when location changes

  if (isAuthenticated === null) {
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

  return (
    <div>
      <Navbar />
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
        <Route path="/tools" element={isAuthenticated ? <Tools /> : <Login />} />
        <Route path="/contact" element={isAuthenticated ? <Contact /> : <Login />} />
        <Route path="/about" element={isAuthenticated ? <About /> : <Login />} />
        <Route path="/phishing-checker" element={isAuthenticated ? <Phishing /> : <Login />} />
        <Route path="/dark-web" element={isAuthenticated ? <DarkWeb /> : <Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={isAdmin ? <Admin /> : <Notfound />}>
          <Route index element={<Users />} />
          <Route path="contacts" element={<ContactInfo />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 404 Page */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </div>
  );
};

export default App;
