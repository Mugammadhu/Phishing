import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import { motion, AnimatePresence } from "framer-motion";
import '../styles/Urls.css'

const Urls = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [urlToDelete, setUrlToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchUrls = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER}/urls`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                setUrls(response.data);
            } catch (error) {
                console.error("Error fetching URLs:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUrls();
    }, []);

    const filteredUrls = urls.filter(
        (url) =>
            url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (url.isSafe ? "safe" : "danger").includes(searchTerm.toLowerCase())
    );

    const confirmDelete = (url) => {
        setUrlToDelete(url);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER}/urls/${urlToDelete._id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            setUrls(urls.filter((url) => url._id !== urlToDelete._id));
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting URL:", error.response?.data || error.message);
        }
    };

    const viewDetails = (url) => {
        setSelectedUrl(url);
        setShowDetailsModal(true);
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center my-5"
            >
                <i className="bi bi-link-45deg bi-spin fs-3 text-primary"></i>
                <p className="mt-2">Loading URLs...</p>
            </motion.div>
        );
    }

    return (
        <div className="container p-4">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
                    <h2 className="m-0">
                        <i className="bi bi-link-45deg me-2 text-primary"></i>
                        Phishing URL Records
                    </h2>
                    <div className="input-group" style={{ maxWidth: "400px" }}>
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search URLs or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                    <div>
                        Showing <strong>{filteredUrls.length}</strong> of <strong>{urls.length}</strong> URLs
                    </div>
                </div>
            </motion.div>

            <div className="row g-4">
                <AnimatePresence>
                    {filteredUrls.length > 0 ? (
                        filteredUrls.map((url, index) => (
                            <motion.div
                                key={url._id}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05, type: "spring" }}
                                className="col-md-6 col-lg-4"
                            >
                                <div className="card h-100 shadow-sm border-0 hover-effect">
                                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            <i className="bi bi-link-45deg me-2"></i>
                                            URL #{index + 1}
                                        </h5>
                                        <span className="badge bg-light text-dark">ID: {url._id.slice(-6)}</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <h6 className="text-muted d-flex align-items-center">
                                                <i className="bi bi-link-45deg me-2"></i>
                                                URL
                                            </h6>
                                            <p className="mb-0 text-truncate">
                                                <a
                                                    href={url.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary"
                                                >
                                                    {url.url}
                                                </a>
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted d-flex align-items-center">
                                                <i
                                                    className={`bi ${
                                                        url.isSafe
                                                            ? "bi-shield-check"
                                                            : "bi-exclamation-triangle"
                                                    } me-2`}
                                                ></i>
                                                Status
                                            </h6>
                                            <p
                                                className={`mb-0 font-semibold ${
                                                    url.isSafe ? "text-green-600" : "text-red-600"
                                                }`}
                                            >
                                                {url.isSafe ? "Safe" : "Danger"}
                                            </p>
                                        </div>
                                        <div>
                                            <h6 className="text-muted d-flex align-items-center">
                                                <i className="bi bi-graph-up me-2"></i>
                                                Confidence
                                            </h6>
                                            <p className="mb-0">{url.confidence.toFixed(2)}%</p>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-light d-flex justify-content-between">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => viewDetails(url)}
                                        >
                                            <i className="bi bi-eye-fill me-1"></i>
                                            View
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => confirmDelete(url)}
                                        >
                                            <i className="bi bi-trash-fill me-1"></i>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="col-12 text-center py-5 text-muted"
                        >
                            <i className="bi bi-link-45deg fs-1"></i>
                            <p className="mt-3">
                                {searchTerm ? "No matching URLs found" : "No URLs available"}
                            </p>
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-secondary mt-2"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                                    Clear search
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* URL Details Modal */}
            {showDetailsModal && selectedUrl && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="modal-dialog modal-dialog-centered modal-lg"
                    >
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-link-45deg me-2"></i>
                                    URL Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowDetailsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <h6 className="text-muted">
                                            <i className="bi bi-link-45deg me-2"></i>
                                            URL
                                        </h6>
                                        <p className="fs-5">
                                            <a
                                                href={selectedUrl.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary"
                                            >
                                                {selectedUrl.url}
                                            </a>
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <h6 className="text-muted">
                                            <i
                                                className={`bi ${
                                                    selectedUrl.isSafe
                                                        ? "bi-shield-check"
                                                        : "bi-exclamation-triangle"
                                                } me-2`}
                                            ></i>
                                            Status
                                        </h6>
                                        <p
                                            className={`fs-5 ${
                                                selectedUrl.isSafe ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            {selectedUrl.isSafe ? "Safe" : "Danger"}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <h6 className="text-muted">
                                        <i className="bi bi-graph-up me-2"></i>
                                        Confidence
                                    </h6>
                                    <p>{selectedUrl.confidence.toFixed(2)}%</p>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <h6 className="text-muted">
                                            <i className="bi bi-calendar-fill me-2"></i>
                                            Created At
                                        </h6>
                                        <p>{new Date(selectedUrl.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <h6 className="text-muted">
                                            <i className="bi bi-calendar-check-fill me-2"></i>
                                            Updated At
                                        </h6>
                                        <p>{new Date(selectedUrl.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    <i className="bi bi-x-circle-fill me-1"></i>
                                    Close
                                </button>
                                <a
                                    href={selectedUrl.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-success"
                                >
                                    <i className="bi bi-box-arrow-up-right me-1"></i>
                                    Visit URL
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && urlToDelete && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="modal-dialog modal-dialog-centered"
                    >
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Confirm Deletion
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to delete this URL:{" "}
                                    <strong>{urlToDelete.url}</strong>?
                                </p>
                                <div className="alert alert-warning d-flex align-items-center">
                                    <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                                    <div>
                                        This action cannot be undone. All URL data will be permanently
                                        removed.
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <i className="bi bi-x-circle-fill me-1"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    <i className="bi bi-trash3-fill me-1"></i>
                                    Delete Permanently
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Urls;