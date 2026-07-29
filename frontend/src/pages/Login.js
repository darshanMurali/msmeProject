import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const result = await login(formData);

      if (result.success) {
        navigate(
          result.role === 'admin'
            ? '/admin'
            : '/student'
        );
      }

    } catch (err) {

      setError(
        err.message ||
        'Login failed. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-left">

        <div className="overlay"></div>

        <div className="auth-brand">

          <div className="logo-circle">
            🏠
          </div>

          <h1>(HMS)Hostel Management Systema</h1>

          <p>
            Smart Hostel Management System
            for modern campuses and hostels.
          </p>

          <div className="auth-features">

            <div className="feature-item">
              ✅ Student Management
            </div>

            <div className="feature-item">
              ✅ Attendance Tracking
            </div>

            <div className="feature-item">
              ✅ Room Allocation
            </div>

            <div className="feature-item">
              ✅ Complaint Monitoring
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">

        <div className="auth-card">

          <div className="auth-header">

            <h2>Welcome Back 👋</h2>

            <p>
              Login to continue your dashboard
            </p>

          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            <div className="form-group">

              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {
                loading
                  ? 'Logging in...'
                  : 'Login'
              }
            </button>

          </form>

          <div className="auth-footer">

            <p>
              Don’t have an account?
              <Link to="/register">
                Register
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>

  );
};

export default Login;