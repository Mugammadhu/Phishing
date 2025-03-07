import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

const About = () => {
    

  return (
    <div className="container-fluid about_container py-5">
      {/* Hero Section - Full Width */}
      <motion.section
        className="hero-section d-flex flex-column align-items-center justify-content-center text-white text-center position-relative overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ background: "url(/images/about-banner.jpg) center/cover no-repeat", height: "60vh" }}
      >
        <div className="overlay position-absolute w-100 h-100" style={{ background: "rgba(0,0,0,0.6)" }}></div>
        <h1 className="display-3 fw-bold position-relative">About Us</h1>
        <p className="lead position-relative">Ensuring cybersecurity with AI-driven technology</p>
      </motion.section>

      {/* Two-Column Section - Image and Text */}
      <motion.section
        className="row align-items-center my-5 px-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="col-lg-6 mb-4">
          <motion.img
            src={'/images/about.jpg'}
            alt="About Us"
            className="img-fluid rounded shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{width:"100%",height:"300px"}}
          />
        </div>
        <div className="col-lg-6">
          <h2 className="fw-bold text-primary">Our Mission</h2>
          <p className="text-muted fs-5">
            Our mission is to detect phishing URLs, monitor dark web activities, and provide
            real-time cybersecurity solutions. With AI-driven threat detection and
            advanced security analytics, we safeguard users from cyber risks.
          </p>
          <motion.button
            className="btn btn-lg btn-primary mt-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById("learn-more").scrollIntoView({ behavior: "smooth" })}
          >
            Learn More
          </motion.button>
        </div>
      </motion.section>

      {/* Feature Grid Section */}
      <motion.section
        className="container text-center my-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        id="learn-more"
      >
        <h2 className="fw-bold mb-4">Why Choose Us?</h2>
        <div className="row g-4">
          {[
            { title: "AI-Powered Detection", desc: "Real-time malicious URL detection using machine learning.", icon: "bi-cpu" },
            { title: "Dark Web Monitoring", desc: "Proactive scanning of dark web activities.", icon: "bi-eye-fill" },
            { title: "Instant Alerts", desc: "Immediate notifications for potential cyber threats.", icon: "bi-bell-fill" },
            { title: "Secure & Scalable", desc: "A scalable cybersecurity platform for businesses & individuals.", icon: "bi-shield-lock" }
          ].map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3 d-flex align-items-stretch">
              <motion.div
                className="p-4 border rounded shadow-lg d-flex flex-column align-items-center w-100 bg-white"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  minHeight: "100%"
                }}
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ duration: 0.3 }}
              >
                <i className={`bi ${feature.icon} display-4 text-primary mb-3`}></i>
                <h4 className="fw-bold text-dark">{feature.title}</h4>
                <p className="text-muted">{feature.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default About;
