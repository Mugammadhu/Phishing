import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { motion, AnimatePresence } from 'framer-motion';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER}/contacts`);
        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER}/contacts/${contactToDelete._id}`);
      setContacts(contacts.filter(contact => contact._id !== contactToDelete._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const viewDetails = (contact) => {
    setSelectedContact(contact);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center my-5"
      >
        <i className="bi bi-envelope-arrow-up bi-spin fs-3 text-primary"></i>
        <p className="mt-2">Loading messages...</p>
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
            <i className="bi bi-envelope-paper-fill me-2 text-primary"></i>
            Contact Messages
          </h2>
          
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="alert alert-info d-flex align-items-center">
          <i className="bi bi-info-circle-fill me-2 fs-5"></i>
          <div>
            Showing <strong>{filteredContacts.length}</strong> of <strong>{contacts.length}</strong> messages
          </div>
        </div>
      </motion.div>

      <div className="row g-4">
        <AnimatePresence>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, type: 'spring' }}
                className="col-md-6 col-lg-4"
              >
                <div className="card h-100 shadow-sm border-0 hover-effect">
                  <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-person-fill me-2"></i>
                      {contact.name}
                    </h5>
                    <span className="badge bg-light text-dark">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <h6 className="text-muted d-flex align-items-center">
                        <i className="bi bi-envelope-at-fill me-2"></i>
                        Email
                      </h6>
                      <p className="mb-0 text-truncate">{contact.email}</p>
                    </div>
                    <div>
                      <h6 className="text-muted d-flex align-items-center">
                        <i className="bi bi-chat-square-text-fill me-2"></i>
                        Message Preview
                      </h6>
                      <p className="mb-0 text-truncate">{contact.message}</p>
                    </div>
                  </div>
                  <div className="card-footer bg-light d-flex justify-content-between">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => viewDetails(contact)}
                    >
                      <i className="bi bi-eye-fill me-1"></i>
                      View
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => confirmDelete(contact)}
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
              <i className="bi bi-envelope-x fs-1"></i>
              <p className="mt-3">
                {searchTerm ? 'No matching messages found' : 'No contact messages available'}
              </p>
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary mt-2"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Details Modal */}
      {showDetailsModal && selectedContact && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-dialog modal-dialog-centered modal-lg"
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-envelope-paper-fill me-2"></i>
                  Message Details
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
                      <i className="bi bi-person-fill me-2"></i>
                      From
                    </h6>
                    <p className="fs-5">{selectedContact.name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">
                      <i className="bi bi-envelope-fill me-2"></i>
                      Email
                    </h6>
                    <p className="fs-5">{selectedContact.email}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted">
                    <i className="bi bi-calendar-fill me-2"></i>
                    Received
                  </h6>
                  <p>{new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h6 className="text-muted">
                    <i className="bi bi-chat-left-text-fill me-2"></i>
                    Message
                  </h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
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
                  href={`mailto:${selectedContact.email}`}
                  className="btn btn-success"
                >
                  <i className="bi bi-reply-fill me-1"></i>
                  Reply
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
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
                <p>Are you sure you want to delete this message from <strong>{contactToDelete?.name}</strong>?</p>
                <div className="alert alert-warning d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                  <div>
                    This action cannot be undone. All message data will be permanently removed.
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

export default Contacts;