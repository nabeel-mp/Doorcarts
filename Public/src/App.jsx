import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Login from './Pages/Login';

// 1. Define ProtectedRoute directly in this file
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Dummy component for demonstration
const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F7FA]">
    <h1 className="text-3xl font-bold text-[#004AAD] font-['Plus_Jakarta_Sans']">Doorcarts Dashboard</h1>
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating an initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      // Replace with actual token validation logic
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center font-['Plus_Jakarta_Sans'] text-[#004AAD]">Loading...</div>; 
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}