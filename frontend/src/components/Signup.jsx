import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

const Signup = () => {
  const [user, setUser] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  });
  const [otp, setOtp] = useState("");
  const [sendOTP, setSendOTP] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!user.email) {
      setMessage({ text: "Email is required", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/send-otp", { 
        email: user.email 
      });
      setSendOTP(true);
      setMessage({ text: response.data.message, isError: false });
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || "Failed to send OTP", 
        isError: true 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage({ text: "OTP is required", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/verify-otp", {
        email: user.email,
        otp,
      });
      setMessage({ text: response.data.message, isError: false });
      setIsVerified(true);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || "OTP verification failed", 
        isError: true 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Signup Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      setMessage({ text: "Please verify OTP first!", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/signup", 
        user, 
        { withCredentials: true }
      );

      setMessage({ 
        text: "Registration successful! Redirecting...", 
        isError: false 
      });
      setTimeout(() => navigate("/"), 1500);
      console.log(response)
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage({ 
          text: "User already exists. Redirecting to login...", 
          isError: true 
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage({ 
          text: error.response?.data?.error || "Registration failed", 
          isError: true 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login signup">
      <h1>Signup Page</h1>
      {message.text && (
        <p style={{ color: message.isError ? "red" : "green" }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            style={{marginLeft:"25px"}}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            required
            disabled={sendOTP || isLoading}
            style={{marginLeft:"30px"}}
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </label>

        {sendOTP && (
          <div className="otp_section">
            <label>
              OTP:
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isVerified || isLoading}
              />
            </label>
            {!isVerified && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            )}
          </div>
        )}

        <div className="btn_section">
          {!sendOTP ? (
            <button 
              type="button" 
              className="btn btn-warning"
              onClick={handleSendOTP}
              disabled={isLoading || !user.email}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <button 
              type="submit"
              className="btn btn-success"
              disabled={!isVerified || isLoading}
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </button>
          )}
        </div>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
