import { Link, Outlet, useLocation } from 'react-router-dom';

const Admin = () => {
  const location = useLocation();
  const activeTab = location.pathname.includes('contacts') ? 'contacts' : location.pathname.includes('users') ? 'users' : 'urls';

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <Link
            to="/admin" 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
          >
            <i className="bi bi-people-fill me-2"></i>
            Users
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/admin/contacts"
            className={`nav-link ${activeTab === 'contacts' ? 'active' : ''}`}
          >
            <i className="bi bi-envelope-fill me-2"></i>
            Contacts
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/admin/urls"
            className={`nav-link ${activeTab === 'urls' ? 'active' : ''}`}
          >
            <i className="bi bi-envelope-fill me-2"></i>
            URLS
          </Link>
        </li>
      </ul>

      <div className="tab-content p-4 border border-top-0 rounded-bottom bg-white">
        <Outlet /> {/* This will render either Users or Contacts component */}
      </div>
    </div>
  );
};

export default Admin;