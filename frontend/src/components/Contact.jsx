import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errMsg, setErrMsg] = useState({ name: "", email: "", message: "" });
  const [resMsg, setResMsg] = useState({ msg: "", status: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    let errors = { ...errMsg };

    if (name === "name") errors.name = value.trim() === "" ? "Name is required" : "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = value.trim() === "" ? "Email is required" : !emailRegex.test(value) ? "Invalid email" : "";
    }
    if (name === "message") errors.message = value.trim() === "" ? "Message cannot be empty" : "";
    setErrMsg(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.message.trim()) errors.message = "Message cannot be empty";
    if (Object.keys(errors).length > 0) {
      setErrMsg(errors);
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/send", formData);
      if (response.status === 200) {
        setResMsg({ msg: "Message Sent Successfully!", status: "success" });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setResMsg({ msg: "Something went wrong, try again.", status: "failure" });
      }
    } catch (error) {
      console.error("Error:", error);
      setResMsg({ msg: "Network error, try again.", status: "failure" });
    }
    setTimeout(() => setResMsg({ msg: "", status: "" }), 4000);
  };

  return (
    <div className="container-fluid contact-container py-5 position-relative">
      <motion.section className="hero-section text-white text-center d-flex flex-column justify-content-center align-items-center"
        initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
        style={{ background: "linear-gradient(135deg, #1c1f2b, #252a40)", height: "60vh" }}>
        <h1 className="display-3 fw-bold">Contact Us</h1>
        <p className="lead">We are here to help with any cybersecurity concerns</p>
      </motion.section>

  {/* Animated Notification */}
<AnimatePresence>
  {resMsg.msg && (
    <motion.div
      className={`alert ${
        resMsg.status === "success" ? "alert-success" : "alert-danger"
      } position-fixed shadow`}
      style={{
        zIndex: 1050,
        width:"250px",
        top: "130px", // Adjust the vertical position
        left: "100%", // Start off-screen to the right
        transform: "translateX(-50%)",
      }}
      initial={{ x: "100%", opacity: 0 }} // Start completely off-screen
      animate={{ x: "-370%", opacity: 1 }} // Move to center smoothly
      exit={{ x: "100%", opacity: 0 }} // Exit by moving right & fading out
      transition={{
        x: { type: "spring", stiffness: 80, damping: 15 },
        opacity: { duration: 0.5 },
      }}
    >
      {resMsg.msg}
    </motion.div>
  )}
</AnimatePresence>


      <motion.section className="container p-5 rounded shadow-lg "
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
        style={{ backgroundColor: "#f5f5f5",marginTop:"30px" }}>
        <h2 className="fw-bold text-center text-dark">Get in Touch</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
              <p className="text-danger">{errMsg.name}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
              <p className="text-danger">{errMsg.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label">Message</label>
            <textarea name="message" className="form-control" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            <p className="text-danger">{errMsg.message}</p>
          </div>
          <div className="text-center mt-4">
            <motion.button type="submit" className="btn btn-primary btn-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              Send Message
            </motion.button>
          </div>
        </form>
      </motion.section>
    </div>
  );
};

export default Contact;