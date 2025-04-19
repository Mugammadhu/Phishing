import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../styles/Login.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Signup = () => {
  const [otp, setOtp] = useState("");
  const [sendOTP, setSendOTP] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        )
        .min(8, "Password must be at least 8 characters long")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      if (!isVerified) {
        setMessage({ text: "Please verify OTP first!", isError: true });
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER}/signup`,
          values,
          {
            withCredentials: true,
          }
        );
        console.log("Signup response:", response.data);
        setMessage({
          text: "Registration successful! Redirecting...",
          isError: false,
        });
        const timeoutId = setTimeout(() => {
          console.log("Navigating to /");
          navigate("/", { replace: true });
        }, 1500);
        return () => clearTimeout(timeoutId); // Cleanup timeout
      } catch (error) {
        console.error("Signup error:", error.response?.data || error.message);
        if (error.response?.status === 409) {
          setMessage({
            text: "User already exists. Redirecting to login...",
            isError: true,
          });
          setTimeout(() => {
            console.log("Navigating to /login");
            navigate("/login", { replace: true });
          }, 1500);
        } else {
          setMessage({
            text: error.response?.data?.error || "Registration failed",
            isError: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formik.values.email) {
      setMessage({ text: "Email is required", isError: true });
      return;
    } else if (!formik.values.name) {
      setMessage({ text: "Name is required", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/send-otp`,
        {
          email: formik.values.email,
          name: formik.values.name,
        }
      );
      setSendOTP(true);
      setMessage({ text: response.data.message, isError: false });
    } catch (error) {
      console.error("Send OTP error:", error.response?.data || error.message);
      setMessage({
        text: error.response?.data?.error || "Failed to send OTP",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage({ text: "OTP is required", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/verify-otp`,
        {
          email: formik.values.email,
          otp,
        }
      );
      setMessage({ text: response.data.message, isError: false });
      setIsVerified(true);
    } catch (error) {
      console.error("Verify OTP error:", error.response?.data || error.message);
      setMessage({
        text: error.response?.data?.error || "OTP verification failed",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout();
  }, []);

  return (
    <div className="login signup">
      <h1>Signup Page</h1>
      {message.text && (
        <p style={{ color: message.isError ? "red" : "green" }}>
          {message.text}
        </p>
      )}

      <form onSubmit={formik.handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            className="form-control"
            value={formik.values.name}
            placeholder="Richard Thomson"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            disabled={isLoading}
            style={{ marginLeft: "10px" }}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-danger">{formik.errors.name}</div>
          )}
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            className="form-control"
            value={formik.values.email}
            placeholder="example@gmail.com"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            disabled={sendOTP || isLoading}
            style={{ marginLeft: "10px" }}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger">{formik.errors.email}</div>
          )}
        </label>

        <label>
          Password:
          <div className="position-relative">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Abc@1234"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              disabled={isLoading}
            />
            <i
              className={`bi ${
                showPass ? "bi-eye-slash" : "bi-eye"
              } position-absolute`}
              style={{
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#6c757d",
              }}
              onClick={() => setShowPass(!showPass)}
            ></i>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="text-danger">{formik.errors.password}</div>
          )}
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
              disabled={isLoading || !formik.values.email}
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