import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Urls.css";

const Urls = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("authToken");

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
            setLoading(false);
            setError("");
        } catch (err) {
            console.error("Error fetching URLs:", err.response?.data || err.message);
            setError("Failed to fetch URLs. Please try again.");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER}/urls/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            setUrls(urls.filter((url) => url._id !== id));
            setError("");
        } catch (err) {
            console.error("Error deleting URL:", err.response?.data || err.message);
            setError("Failed to delete URL. Please try again.");
        }
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    if (loading) {
        return (
            <motion.div
                className="flex items-center justify-center min-h-screen bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.div
                        className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="mt-4 text-lg text-gray-300">Loading URLs...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-900 text-gray-100 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Phishing URL Records
                </h1>
                {error && (
                    <motion.p
                        className="text-center text-red-500 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error}
                    </motion.p>
                )}
                {urls.length === 0 ? (
                    <p className="text-center text-gray-400">No URLs found.</p>
                ) : (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="w-full bg-gray-800 rounded-lg">
                            <thead>
                                <tr className="bg-gray-700 text-gray-200">
                                    <th className="p-4 text-left">URL</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Confidence</th>
                                    <th className="p-4 text-center">Created At</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {urls.map((url) => (
                                        <motion.tr
                                            key={url._id}
                                            className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className="p-4">
                                                <a
                                                    href={url.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline truncate max-w-xs block"
                                                >
                                                    {url.url}
                                                </a>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        url.isSafe
                                                            ? "bg-green-600 text-green-100"
                                                            : "bg-red-600 text-red-100"
                                                    }`}
                                                >
                                                    {url.isSafe ? "Safe" : "Phishing"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">{url.confidence.toFixed(2)}%</td>
                                            <td className="p-4 text-center">
                                                {new Date(url.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <motion.button
                                                    onClick={() => handleDelete(url._id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Delete
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Urls;