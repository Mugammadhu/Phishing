import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';

const Notfound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="d-flex flex-column justify-content-center align-items-center vh-100 "
    >
      <div 
        className="text-center p-5 rounded-3 position-relative"
        style={{ 
          width: '600px',
          minHeight: '400px',
          background:"linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingBottom: '3.5rem',
          border: 'none'
        }}
      >
        <div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            <h1 className="display-1 text-danger mb-4">404</h1>
          </motion.div>
          
          <h2 className="mb-3">Oops! Page Not Found</h2>
          <p className="lead mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="mb-4">
          <p>You'll be automatically redirected to the homepage in <span className="fw-bold">5 seconds</span>.</p>
          <div className="progress mt-2" style={{ height: '5px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div 
              className="progress-bar bg-danger progress-bar-striped progress-bar-animated" 
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 3rem)',
            background: 'linear-gradient(to right, #1976d2, #2196f3)',
            border: 'none',
            fontWeight: '500'
          }}
        >
          <i className="bi bi-house-door me-2"></i>
          Go to Homepage
        </Button>
      </div>
    </motion.div>
  );
};

export default Notfound;