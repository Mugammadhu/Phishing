import  { useState } from 'react';
import axios from 'axios';

const DarkWeb = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!query) {
      alert('Please enter an email, phone number, or username');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const apiKey = '354cc08602368fdbb81c7193074c8818d4b8ad24'; // Replace with your LeakCheck API key
      const response = await axios.get(
        `https://leakcheck.net/api?key=${apiKey}&check=${encodeURIComponent(query)}`
      );

      if (response.data.success) {
        if (response.data.result.length > 0) {
          setResult(response.data.result);
        } else {
          setResult('No breaches found.');
        }
      } else {
        setResult(response.data.message || 'An error occurred.');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setResult('Error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Dark Web Monitor</h2>
      <div className="mb-3">
        <label className="form-label">Enter Email, Phone, or Username:</label>
        <input
          type="text"
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="example@example.com or +123456789"
        />
      </div>
      <button className="btn btn-primary" onClick={handleCheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check for Breaches'}
      </button>
      <div className="mt-3">
        {result && (
          typeof result === 'string' ? <p>{result}</p> :
          result.map((item, index) => (
            <div key={index} className="alert alert-danger">
              <h4>Breach Found</h4>
              <p><strong>Source:</strong> {item.name}</p>
              <p><strong>Data Compromised:</strong> {item.data}</p>
              <p><strong>Verified:</strong> {item.verified ? 'Yes' : 'No'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DarkWeb;
