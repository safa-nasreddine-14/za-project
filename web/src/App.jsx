import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setToken(null);
  };

  return (
    <div className="admin-app-container">
      {token ? (
        <AdminDashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;

