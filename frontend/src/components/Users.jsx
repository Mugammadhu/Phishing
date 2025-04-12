import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/users/${userToDelete._id}`);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center my-5"
      >
        <motion.i
          className="bi bi-arrow-repeat fs-3 text-primary"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.p
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
          className="mt-2"
        >
          Loading users...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container p-4"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3"
      >
        <h2 className="m-0">
          <i className="bi bi-people-fill me-2 text-primary"></i>
          User Management
        </h2>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="input-group"
          style={{ maxWidth: '400px' }}
        >
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
      </motion.div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>
                <i className="bi bi-person-badge me-2"></i>
                Name
              </th>
              <th>
                <i className="bi bi-envelope me-2"></i>
                Email
              </th>
              <th>
                <i className="bi bi-check-circle me-2"></i>
                Status
              </th>
              <th>
                <i className="bi bi-trash me-2"></i>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <motion.span
                        className="badge bg-success"
                        whileHover={{ scale: 1.05 }}
                      >
                        <i className="bi bi-check-lg me-1"></i>
                        Active
                      </motion.span>
                    </td>
                    <td>
                      <motion.button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => confirmDelete(user)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1"></i>
                    <p className="mt-3">
                      {searchTerm ? 'No matching users found' : 'No users available'}
                    </p>
                    {searchTerm && (
                      <motion.button
                        className="btn btn-outline-secondary mt-2"
                        onClick={() => setSearchTerm('')}
                        whileHover={{ scale: 1.05 }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                        Clear search
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop fade show"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal d-block"
              tabIndex="-1"
              style={{ display: 'block' }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <motion.div
                  className="modal-content"
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  transition={{ type: 'spring', damping: 25 }}
                >
                  <div className="modal-header bg-danger text-white">
                    <h5 className="modal-title">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Confirm Delete
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to delete user: <strong>{userToDelete?.name}</strong>?</p>
                    <div className="alert alert-warning d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <div>This action cannot be undone.</div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteModal(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDelete}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-trash me-1"></i> Delete
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Users;