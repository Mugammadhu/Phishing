import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/tools.css"; 
import Faq from "./Faq";

const Tools = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animate, setAnimate] = useState(false);

  // Trigger animation when the Tools page loads
  useEffect(() => {
    if (location.pathname === "/tools") {
      setAnimate(true);
    }
  }, [location]);

  const handleClick = (event, path) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    circle.classList.add("ripple");
    button.appendChild(circle);

    setTimeout(() => {
      circle.remove();
      navigate(path);
    }, 500);
  };

  return (
    <div className="tools">
        <div className={`tools-container ${animate ? "slide-in" : ""}`}>
          <h2 className="text-center fw-bold">Tools</h2>
          <div className="tools-wrapper">
            <div
              className="tool-card phishing"
              onClick={(e) => handleClick(e, "/phishing-checker")}
            >
              <i className="bi bi-shield-lock-fill tool-icon"></i>
              <h4 className="card-title">Phishing Checker</h4>
              <p className="card-text">Detect if a website is a phishing site.</p>
            </div>
            {/* <div
              className="tool-card darkweb"
              onClick={(e) => handleClick(e, "/dark-web")}
            >
              <i className="bi bi-eye-slash-fill tool-icon"></i>
              <h4 className="card-title">Dark Web Monitor</h4>
              <p className="card-text">Check if your data is on the dark web.</p>
            </div> */}
          </div>
        </div>
        <div className="faq"><Faq/></div>
    </div>

  );
};

export default Tools;
