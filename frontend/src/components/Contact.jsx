import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent!"); // Replace with actual form submission logic
  };

  return (
    <div className="container-fluid contact-container py-5">
      {/* Hero Section */}
      <motion.section
        className="hero-section text-white text-center d-flex flex-column justify-content-center align-items-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          background: "linear-gradient(135deg, #1c1f2b, #252a40)",
          height: "60vh",
        }}
      >
        <h1 className="display-3 fw-bold">Contact Us</h1>
        <p className="lead">We are here to help with any cybersecurity concerns</p>
      </motion.section>

      {/* Contact Info Section */}
      <section className="container my-5">
        <div className="row text-center">
          {[
            { icon: "bi-telephone-fill", title: "Call Us", text: "+1 234 567 890", bg: "#ff5722" },
            { icon: "bi-envelope-fill", title: "Email", text: "support@cybersecurity.com", bg: "#4caf50" },
            { icon: "bi-geo-alt-fill", title: "Location", text: "123 Cyber Street, Security City", bg: "#2196f3" },
          ].map((info, index) => (
            <div className="col-md-4" key={index}>
              <motion.div
                className="p-4 text-white rounded shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: info.bg }}
              >
                <i className={`bi ${info.icon} display-4`}></i>
                <h4 className="mt-3">{info.title}</h4>
                <p>{info.text}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <motion.section
        className="container p-5 rounded shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <h2 className="fw-bold text-center text-dark">Get in Touch</h2>
        <p className="text-muted text-center">Send us a message and we’ll get back to you as soon as possible.</p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                style={{border:"1px solid gray"}}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                style={{border:"1px solid gray"}}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              className="form-control"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
              style={{border:"1px solid gray"}}
            ></textarea>
          </div>
          <div className="text-center mt-4">
            <motion.button
              type="submit"
              className="btn btn-primary btn-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Send Message
            </motion.button>
          </div>
        </form>
      </motion.section>
    </div>
  );
};

export default Contact;