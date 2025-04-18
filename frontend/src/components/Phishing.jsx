import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Container,
  Form,
  Button,
  Card,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";

function Phishing() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkURL = async () => {
    setResult(null);
    setLoading(true);
    try {
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_SERVER}/api/check-url`, {
        url,
      });
      setResult(response.data);
      setLoading(false);
    } catch (error) {
      setError("Error checking URL. Please try again.");
      console.error("Error checking URL", error);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="shadow-lg p-4 rounded-4"
          style={{ maxWidth: "500px", width: "100%" }}
        >
          <Card.Title className="mb-4 text-center fw-bold fs-4 text-primary">
            <i className="bi bi-shield-lock-fill me-2"></i> Phishing URL
            Detector
          </Card.Title>
          <Form>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevents form submission refresh
                    checkURL();
                  }
                }}
                placeholder="Enter a URL to check"
                className="py-2 border-primary shadow-sm"
              />

              <Button variant="primary" onClick={checkURL} className="fw-bold">
                <i className="bi bi-search"></i> Check
              </Button>
            </InputGroup>
          </Form>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            </motion.div>
          )}

          {loading && (
            <motion.div
              className="d-flex justify-content-center align-items-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                variant={result.isSafe ? "success" : "danger"}
                className="mt-3 text-center shadow-sm p-3 rounded-3"
              >
                <h5 className="fw-bold">Result</h5>
                <p className="mb-1">
                  <strong>URL:</strong> {result.url}
                </p>
                <p className="mb-1">
                  <strong>Confidence:</strong> {result.confidence}%
                </p>
                <h4
                  className={
                    result.isSafe
                      ? "text-success fw-bold"
                      : "text-danger fw-bold"
                  }
                >
                  <i
                    className={
                      result.isSafe
                        ? "bi bi-check-circle-fill"
                        : "bi bi-exclamation-triangle-fill"
                    }
                  ></i>
                  {result.isSafe ? " SAFE" : " PHISHING"}
                </h4>
              </Alert>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </Container>
  );
}

export default Phishing;
