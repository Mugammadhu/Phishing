import { useState } from "react";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setErrorMessage("");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else if (response.status === 404) {
        setErrorMessage(data.error);
        setSuccessMessage("");
        setTimeout(() => {
          navigate("/signup");
        }, 3000);
      } else {
        setErrorMessage(data.error);
        setSuccessMessage("");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Something went wrong. Please try again later.");
    }
    setUser({ email: "", password: "" });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setUser({ email: "", password: "" });
  };

  return (
    <div className="login">
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit} onReset={handleReset}>
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <div className="position-relative">
          <label htmlFor="email">
            Email:
            <input
              type="email"
              name="email"
              id="email"
              className="form-control"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </label>
        </div>

        <label htmlFor="password">
          Password:
          <div className="position-relative">
            <input
              type={showPass ? "text" : "password"}
              className="form-control"
              name="password"
              id="password"
              placeholder="Abc@1234"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
            <i
              className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"} position-absolute`}
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
        </label>

        <div className="btn_section">
          <button type="submit" id="submit_btn">Submit</button>
          <button type="reset" id="reset_btn">Reset</button>
        </div>

        <p>
          Don&apos;t have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
