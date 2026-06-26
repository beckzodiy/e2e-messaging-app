import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return isAuthenticated ? children : null;
};

export default PrivateRoute;
