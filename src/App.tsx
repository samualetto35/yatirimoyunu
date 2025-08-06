import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import UserPage from './components/UserPage';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './components/ForgotPassword';
import './App.css';

function AppContent() {
  const location = useLocation();
  // Header'ı login, register, verify-email ve forgot-password sayfalarında gizle
  const hideHeader = ["/login", "/register", "/verify-email", "/forgot-password"].includes(location.pathname);
  return (
    <div className="App">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={
          <div className="content">
            <h1>Yatırım Oyunu'na Hoş Geldiniz</h1>
            <p>Başlamak için giriş yapın veya kayıt olun.</p>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user" element={
          <PrivateRoute>
            <UserPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
