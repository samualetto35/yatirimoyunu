import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthenticatedHeader from './components/AuthenticatedHeader';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import UserPage from './components/UserPage';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Investments from './components/Investments';
import Ranking from './components/Ranking';
import Community from './components/Community';
import PrivateRoute from './components/PrivateRoute';
import MarketHistory from './components/MarketHistory';
import './App.css';

function AppContent() {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Header'ı login, register, verify-email ve forgot-password sayfalarında gizle
  const hideHeader = ["/login", "/register", "/verify-email", "/forgot-password"].includes(location.pathname);

  // Giriş yapmış kullanıcılar için authenticated header göster
  const showAuthenticatedHeader = currentUser && !hideHeader && ["/user", "/dashboard", "/investments", "/ranking", "/community", "/gecmis-veriler"].includes(location.pathname);

  // Giriş yapmamış kullanıcılar için normal header göster
  const showNormalHeader = !currentUser && !hideHeader;

  // Auth sayfaları için özel class
  const isAuthPage = hideHeader;

  // Authenticated kullanıcılar için class
  const isAuthenticated = currentUser && !hideHeader;

  return (
    <div className={`App ${isAuthPage ? 'auth-page' : ''} ${isAuthenticated ? 'authenticated' : ''}`}>
      {showAuthenticatedHeader && <AuthenticatedHeader />}
      {showNormalHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/gecmis-veriler" element={
          <PrivateRoute>
            <MarketHistory />
          </PrivateRoute>
        } />
        <Route path="/investments" element={
          <PrivateRoute>
            <Investments />
          </PrivateRoute>
        } />
        <Route path="/ranking" element={
          <PrivateRoute>
            <Ranking />
          </PrivateRoute>
        } />
        <Route path="/community" element={
          <PrivateRoute>
            <Community />
          </PrivateRoute>
        } />
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
