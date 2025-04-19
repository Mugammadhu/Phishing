import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Urls.css";

const Urls = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [urlToDelete, setUrlToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const urlsPerPage = 6;
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchUrls();
    }, []);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ ...toast, show: false });
        }, 3000);
    };

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
            showToast("URLs loaded successfully!", "success");
        } catch (error) {
            console.error("Error fetching URLs:", error.response?.data || error.message);
            showToast("Failed to fetch URLs", "error");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("URL copied to clipboard!", "success");
    };

    const exportToCSV = () => {
        const headers = ["URL", "Status", "Confidence", "Created At", "Updated At"];
        const rows = urls.map((url) => [
            `"${url.url}"`,
            url.isSafe ? "Safe" : "Danger",
            url.confidence.toFixed(2),
            new Date(url.createdAt).toLocaleString(),
            new Date(url.updatedAt).toLocaleString(),
        ]);
        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "urls.csv";
        a.click();
        window.URL.revokeObjectURL(url);
        showToast("URLs exported to CSV!", "success");
    };

    const filteredUrls = urls
        .filter(
            (url) =>
                url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (url.isSafe ? "safe" : "danger").includes(searchTerm.toLowerCase())
        )
        .filter((url) =>
            statusFilter === "all" ||
            (statusFilter === "safe" && url.isSafe) ||
            (statusFilter === "danger" && !url.isSafe)
        )
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            if (sortField === "confidence") {
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return sortOrder === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });

    const totalPages = Math.ceil(filteredUrls.length / urlsPerPage);
    const paginatedUrls = filteredUrls.slice(
        (currentPage - 1) * urlsPerPage,
        currentPage * urlsPerPage
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
            showToast("URL deleted successfully!", "success");
        } catch (error) {
            console.error("Error deleting URL:", error.response?.data || error.message);
            showToast("Failed to delete URL", "error");
        }
    };

    const viewDetails = (url) => {
        setSelectedUrl(url);
        setShowDetailsModal(true);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center my-5"
            >
                <i className="bi bi-link-45deg bi-spin fs-3 text-primary"></i>
                <p className="mt-2 text-muted">Loading URLs...</p>
            </motion.div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className={`position-fixed top-0 end-0 m-3 alert alert-${
                            toast.type === "success" ? "success" : "danger"
                        } d-flex align-items-center shadow`}
                        style={{ zIndex: 1050 }}
                    >
                        <i
                            className={`bi bi-${
                                toast.type === "success" ? "check-circle" : "exclamation-triangle"
                            } me-2`}
                        ></i>
                        <div>{toast.message}</div>
                        <button
                            type="button"
                            className="btn-close ms-3"
                            onClick={() => setToast({ ...toast, show: false })}
                        ></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 bg-white p-4 rounded shadow-sm"
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
                    <h2 className="m-0 text-dark">
                        <i className="bi bi-link-45deg me-2 text-primary"></i>
                        Phishing URL Records
                    </h2>
                    <div className="d-flex gap-3 flex-wrap">
                        <div className="input-group" style={{ maxWidth: "300px" }}>
                            <span className="input-group-text bg-light">
                                <i className="bi bi-search text-secondary"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control bg-white"
                                placeholder="Search URLs or status..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <select
                            className="form-select bg-white"
                            style={{ maxWidth: "150px" }}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="safe">Safe</option>
                            <option value="danger">Danger</option>
                        </select>
                        <motion.button
                            className="btn btn-outline-primary"
                            onClick={fetchUrls}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="bi bi-arrow-repeat me-1"></i>
                            Refresh
                        </motion.button>
                        <motion.button
                            className="btn btn-primary"
                            onClick={exportToCSV}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="bi bi-file-earmark-arrow-down me-1"></i>
                            Export CSV
                        </motion.button>
                    </div>
                </div>
                <div className="alert alert-info d-flex align-items-center bg-light border-start border-primary border-5">
                    <i className="bi bi-info-circle-fill me-2 fs-5 text-primary"></i>
                    <div>
                        Showing <strong>{filteredUrls.length}</strong> of <strong>{urls.length}</strong> URLs
                    </div>
                </div>
            </motion.div>

            <div className="row g-4">
                <AnimatePresence>
                    {paginatedUrls.length > 0 ? (
                        paginatedUrls.map((url, index) => (
                            <motion.div
                                key={url._id}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1, type: "spring" }}
                                className="col-md-6 col-lg-4"
                            >
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            <i className="bi bi-link-45deg me-2"></i>
                                            URL #{(currentPage - 1) * urlsPerPage + index + 1}
                                        </h5>
                                        <span className="badge bg-white text-primary">
                                            ID: {url._id.slice(-6)}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <h6 className="text-muted d-flex align-items-center">
                                                <i className="bi bi-link-45deg me-2"></i>
                                                URL
                                            </h6>
                                            <p className="mb-0 url-truncate" title={url.url}>
                                                {url.url}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted d-flex align-items-center">
                                                <i
                                                    className={`bi ${
                                                        url.isSafe
                                                            ? "bi-shield-check text-success"
                                                            : "bi-exclamation-triangle text-danger"
                                                    } me-2`}
                                                ></i>
                                                Status
                                            </h6>
                                            <p
                                                className={`mb-0 fw-semibold ${
                                                    url.isSafe
                                                        ? "text-success"
                                                        : "text-danger"
                                                }`}
                                            >
                                                {url.isSafe ? "Safe" : "Danger"}
                                            </p>
                                        </div>
                                        <div>
                                            <h6 className="text-muted d-flex align-items-center">
                                                <i className="bi bi-graph-up me-2 text-info"></i>
                                                Confidence
                                            </h6>
                                            <p className="mb-0">{url.confidence.toFixed(2)}%</p>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-light d-flex justify-content-between">
                                        <motion.button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => viewDetails(url)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className="bi bi-eye-fill me-1"></i>
                                            View
                                        </motion.button>
                                        <motion.button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => copyToClipboard(url.url)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className="bi bi-clipboard me-1"></i>
                                            Copy
                                        </motion.button>
                                        <motion.button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => confirmDelete(url)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className="bi bi-trash-fill me-1"></i>
                                            Delete
                                        </motion.button>
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
                            <i className="bi bi-link-45deg fs-1 text-primary"></i>
                            <p className="mt-3">
                                {searchTerm || statusFilter !== "all"
                                    ? "No matching URLs found"
                                    : "No URLs available"}
                            </p>
                            {(searchTerm || statusFilter !== "all") && (
                                <button
                                    className="btn btn-outline-primary mt-2"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setCurrentPage(1);
                                    }}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                                    Clear filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="d-flex justify-content-center mt-4"
                >
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li
                                className={`page-item ${
                                    currentPage === totalPages ? "disabled" : ""
                                }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </motion.div>
            )}

            {/* Sorting Controls */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="d-flex justify-content-end mt-3"
            >
                <div className="input-group" style={{ maxWidth: "300px" }}>
                    <span className="input-group-text bg-light">
                        Sort by
                    </span>
                    <select
                        className="form-select"
                        value={sortField}
                        onChange={(e) => handleSort(e.target.value)}
                    >
                        <option value="url">URL</option>
                        <option value="isSafe">Status</option>
                        <option value="confidence">Confidence</option>
                        <option value="createdAt">Created At</option>
                    </select>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleSort(sortField)}
                    >
                        <i
                            className={`bi bi-arrow-${
                                sortOrder === "asc" ? "up" : "down"
                            }`}
                        ></i>
                    </button>
                </div>
            </motion.div>

            {/* URL Details Modal */}
            {showDetailsModal && selectedUrl && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="modal-dialog modal-dialog-centered modal-lg"
                    >
                        <div className="modal-content border-0 shadow">
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
                                        <p className="fs-5 word-wrap">
                                            {selectedUrl.url}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <h6 className="text-muted">
                                            <i
                                                className={`bi ${
                                                    selectedUrl.isSafe
                                                        ? "bi-shield-check text-success"
                                                        : "bi-exclamation-triangle text-danger"
                                                } me-2`}
                                            ></i>
                                            Status
                                        </h6>
                                        <p
                                            className={`fs-5 fw-semibold ${
                                                selectedUrl.isSafe
                                                    ? "text-success"
                                                    : "text-danger"
                                            }`}
                                        >
                                            {selectedUrl.isSafe ? "Safe" : "Danger"}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <h6 className="text-muted">
                                        <i className="bi bi-graph-up me-2 text-info"></i>
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
                                <motion.button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowDetailsModal(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <i className="bi bi-x-circle-fill me-1"></i>
                                    Close
                                </motion.button>
                                <motion.button
                                    className="btn btn-primary"
                                    onClick={() => copyToClipboard(selectedUrl.url)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <i className="bi bi-clipboard me-1"></i>
                                    Copy URL
                                </motion.button>
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
                        transition={{ type: "spring", stiffness: 100 }}
                        className="modal-dialog modal-dialog-centered"
                    >
                        <div className="modal-content border-0 shadow">
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
                                    <strong className="url-truncate" title={urlToDelete.url}>
                                        {urlToDelete.url}
                                    </strong>
                                    ?
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
                                <motion.button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <i className="bi bi-x-circle-fill me-1"></i>
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <i className="bi bi-trash3-fill me-1"></i>
                                    Delete Permanently
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Urls;