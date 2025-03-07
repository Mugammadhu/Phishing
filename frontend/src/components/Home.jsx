import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Carousel } from "react-bootstrap";
import '../styles/home.css'

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container home_container">
      {/* Hero Section with Enhanced Styling */}
      <motion.header
        className="text-center py-5 bg-dark text-white rounded shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="display-4 fw-bold">Malicious URL Detection & Dark Web Monitoring</h1>
        <p className="lead">Enhancing cybersecurity with AI-powered threat detection.</p>
        <motion.button
          className="btn btn-primary btn-lg mt-3"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/tools")}
        >
          Get Started
        </motion.button>
      </motion.header>

      {/* Features Section with Carousel and Background Images */}
      <div className="row justify-content-center my-5">
        <div className="col-md-8">
          <Carousel indicators={false} controls={true} interval={3000} className="shadow-lg rounded">
            {[
              { title: "AI-Powered Detection", text: "Utilizes machine learning to detect phishing URLs in real-time.", img: "/images/ai-detection.jpg" },
              { title: "Dark Web Monitoring", text: "Monitors dark web activities to prevent data breaches.", img: "/images/dark-web.jpg" },
              { title: "Instant Alerts", text: "Get real-time alerts for potential security threats.", img: "/images/alerts.jpg" }
            ].map((feature, index) => (
              <Carousel.Item key={index}>
                <div 
                  className="text-center p-5 d-flex align-items-center justify-content-center"
                  style={{ backgroundImage: `url(${feature.img})`, backgroundSize: "cover", backgroundPosition: "center", height: "300px", color: "white" }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="p-3 bg-dark bg-opacity-75 rounded"
                  >
                    <h3 className="fw-bold">{feature.title}</h3>
                    <p>{feature.text}</p>
                  </motion.div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Additional Important Section */}
      <section className="text-center py-5 bg-secondary text-white rounded shadow-lg">
        <h2 className="fw-bold">Why Choose Our Platform?</h2>
        <p className="lead">We provide state-of-the-art security solutions using AI and real-time monitoring.</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <motion.button
            className="btn btn-light btn-lg text-dark"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/about")}
          >
            Learn More
          </motion.button>
          <motion.button
            className="btn btn-warning btn-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Home;
