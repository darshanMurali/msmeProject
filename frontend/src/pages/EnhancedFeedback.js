import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EnhancedFeedback.css';

const EnhancedFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'food',
    subject: '',
    description: '',
    rating: 5,
    isAnonymous: false
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/feedback/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(response.data.data);
    } catch (error) {
      console.error('Failed to load feedbacks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/feedback', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Feedback submitted successfully!');
      setShowForm(false);
      setFormData({
        category: 'food',
        subject: '',
        description: '',
        rating: 5,
        isAnonymous: false
      });
      fetchFeedbacks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>📝 Feedback System</h1>
        <button className="btn-new-feedback" onClick={() => setShowForm(!showForm)}>
          + New Feedback
        </button>
      </div>

      {showForm && (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <h2>Submit Feedback</h2>
          
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="food">🍽️ Food</option>
              <option value="service">👨‍💼 Service</option>
              <option value="cleanliness">🧹 Cleanliness</option>
              <option value="facilities">🏢 Facilities</option>
              <option value="staff">👥 Staff</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Rating: {formData.rating} ⭐</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
              />
              Submit anonymously
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Submit Feedback</button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="feedbacks-list">
        <h2>My Feedback History</h2>
        {feedbacks.length === 0 ? (
          <p className="no-feedbacks">No feedback submitted yet</p>
        ) : (
          feedbacks.map(feedback => (
            <div key={feedback._id} className="feedback-card">
              <div className="feedback-header-card">
                <span className="feedback-category">{feedback.category}</span>
                <span className="feedback-status">{feedback.status}</span>
              </div>
              <h3>{feedback.subject}</h3>
              <p>{feedback.description}</p>
              <div className="feedback-meta">
                <span>{'⭐'.repeat(feedback.rating)}</span>
                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
              </div>
              {feedback.adminResponse && (
                <div className="admin-response">
                  <strong>Admin Response:</strong>
                  <p>{feedback.adminResponse.message}</p>
                  <small>{new Date(feedback.adminResponse.respondedAt).toLocaleString()}</small>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedFeedback;
