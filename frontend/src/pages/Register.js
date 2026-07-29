import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    roomNumber: '',
    phone: '',
    parentContact: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated, user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {

    if (isAuthenticated && user) {
      navigate(
        user.role === 'admin'
          ? '/admin'
          : '/student'
      );
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

    // VALIDATION

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Please enter a valid full name');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.roomNumber) {
      setError('Room number is required');
      return;
    }

    if (formData.parentContact.length < 10) {
      setError('Parent contact is required');
      return;
    }

    setLoading(true);

    try {

      const {
        confirmPassword,
        role,
        ...registrationData
      } = formData;

      const dataToSend = {
        ...registrationData,
        role: 'student',
        studentType: 'hosteller',
        collegeRegistrationNumber: `REG${Date.now()}`
      };

      const result = await register(dataToSend);

      if (result && result.success) {
        navigate('/student');
      }

    } catch (err) {

      setError(
        err.message ||
        'Registration failed'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-left">

        <div className="auth-brand">

          <div className="logo-circle">
            🏠
          </div>

          <h1>(HMS)Hostel Management System

          </h1>

          <p>
            Smart hostel ecosystem designed
            for students, wardens, and admins.
          </p>

          <div className="auth-features">



            <div className="feature-item">
              ✅ Smart Attendance
            </div>

            <div className="feature-item">
              ✅ AI Room Allocation
            </div>

            <div className="feature-item">
              ✅ Complaint Monitoring
            </div>

            <div className="feature-item">
              ✅ Digital Hostel Dashboard
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">

        <div className="auth-card register-card">

          <div className="auth-header">

            <h2>Create Account ✨</h2>

            <p>
              Register to access (HMS)Hostel Management System
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

            <div className="grid-two">

              <div className="form-group">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">

                <label className="form-label">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="grid-two">

              <div className="form-group">

                <label className="form-label">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label className="form-label">
                  Room Number
                </label>

                <input
                  type="text"
                  name="roomNumber"
                  className="form-control"
                  placeholder="Enter room number"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label className="form-label">
                Parent Contact
              </label>

              <input
                type="tel"
                name="parentContact"
                className="form-control"
                placeholder="Enter parent contact"
                value={formData.parentContact}
                onChange={handleChange}
                required
              />

            </div>

            <div className="grid-two">

              <div className="form-group">

                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label className="form-label">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {
                loading
                  ? 'Creating Account...'
                  : 'Create Account'
              }
            </button>

          </form>

          <div className="auth-footer">

            <p>
              Already have an account?
              <Link to="/login">
                Login
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Register;