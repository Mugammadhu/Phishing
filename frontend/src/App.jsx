import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
import './App.css';
import Admin from './components/Admin';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth", {
          withCredentials: true,
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
        }
         else {
          setIsAuthenticated(false);
          // 🛠️ **Fix:** Don't redirect if the user is already on the signup page
          if (location.pathname !== "/signup") {
            navigate("/login");
          }
        }
        if(response.data.isAdmin){
          setIsAdmin(true);
        }
        else{
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Authentication check failed", error);
        setIsAuthenticated(false);
        if (location.pathname !== "/signup") {
          navigate("/login");
        }
      }
    };
    verifyAuth();
  }, [navigate, location.pathname]); // Depend on `location.pathname` to prevent unnecessary redirects

  if (isAuthenticated === null)
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

          {/* Progress Bar */}
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
        <Route path="/admin" element={isAdmin ? <Admin/> : <Notfound/>} />


        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 404 Page */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </div>
  );
};

export default App;
