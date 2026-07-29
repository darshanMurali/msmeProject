import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, attendanceAPI, mealAPI, leaveAPI, announcementAPI } from '../services/api';
import Shop from './Shop';
import Cart from './Cart';
import Wallet from './Wallet';
import FoodMenu from './FoodMenu';
import Orders from './Orders';
import EnhancedFeedback from './EnhancedFeedback';
import Chat from './Chat';
import QRCode from 'react-qr-code';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} />
      <div className="dashboard-content">
        <Header user={user} />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<StudentHome user={user} />} />
            <Route path="/attendance" element={<StudentAttendance user={user} />} />
            <Route path="/feedback" element={<MealFeedback user={user} />} />
            <Route path="/leave" element={<LeaveRequests user={user} />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/food-menu" element={<FoodMenu />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/enhanced-feedback" element={<EnhancedFeedback />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, user, logout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🏠 HostelEase</h2>
        <p className="user-name">{user?.name}</p>
        <span className="badge badge-info">Student</span>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/student" className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          <span>📊</span> Dashboard
        </Link>
        <Link to="/student/attendance" className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
          <span>✅</span> Attendance
        </Link>
        <Link to="/student/feedback" className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
          <span>🍽️</span> Meal Feedback
        </Link>
        <Link to="/student/shop" className={activeTab === 'shop' ? 'active' : ''} onClick={() => setActiveTab('shop')}>
          <span>🛒</span> Shop
        </Link>
        <Link to="/student/cart" className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>
          <span>🛍️</span> Cart
        </Link>
        <Link to="/student/wallet" className={activeTab === 'wallet' ? 'active' : ''} onClick={() => setActiveTab('wallet')}>
          <span>💰</span> Wallet
        </Link>
        <Link to="/student/food-menu" className={activeTab === 'food-menu' ? 'active' : ''} onClick={() => setActiveTab('food-menu')}>
          <span>🍽️</span> Food Menu
        </Link>
        <Link to="/student/orders" className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          <span>📦</span> My Orders
        </Link>
        <Link to="/student/enhanced-feedback" className={activeTab === 'enhanced-feedback' ? 'active' : ''} onClick={() => setActiveTab('enhanced-feedback')}>
          <span>📝</span> Feedback
        </Link>
        <Link to="/student/chat" className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
          <span>💬</span> Chat
        </Link>
        <Link to="/student/leave" className={activeTab === 'leave' ? 'active' : ''} onClick={() => setActiveTab('leave')}>
          <span>📝</span> Leave Requests
        </Link>
        <Link to="/student/announcements" className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>
          <span>📢</span> Announcements
        </Link>
        <Link to="/student/profile" className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          <span>👤</span> Profile
        </Link>
      </nav>
      
      <button className="btn btn-danger logout-btn" onClick={logout}>
        🚪 Logout
      </button>
    </div>
  );
};

const Header = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="dashboard-header">
      <div>
        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="date">{currentDate}</p>
      </div>
    </div>
  );
};

const StudentHome = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, announcementsRes] = await Promise.all([
        studentAPI.getStudentStats(user._id),
        announcementAPI.getAllAnnouncements({ limit: 3 })
      ]);
      setStats(statsRes.data.data);
      setAnnouncements(announcementsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>📊</div>
          <div className="stat-content">
            <h3>{stats?.attendancePercentage || 0}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
          <div className="stat-content">
            <h3>{stats?.attendanceCount || 0}</h3>
            <p>Days Present</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>🍽️</div>
          <div className="stat-content">
            <h3>{stats?.feedbackCount || 0}</h3>
            <p>Feedback Given</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>📝</div>
          <div className="stat-content">
            <h3>{stats?.pendingLeaves || 0}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📢 Recent Announcements</h2>
        </div>
        {announcements.length > 0 ? (
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-item">
                <div className="announcement-header">
                  <h4>{announcement.title}</h4>
                  <span className={`badge badge-${announcement.priority === 'urgent' ? 'danger' : announcement.priority === 'high' ? 'warning' : 'info'}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p>{announcement.message}</p>
                <small>{new Date(announcement.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>No announcements available</p>
        )}
      </div>
    </div>
  );
};

const StudentAttendance = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAttendanceByStudent(user._id);
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async () => {
    setLoading(true);
    setMessage('');
    try {
      await attendanceAPI.markAttendance({ method: 'qr' });
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      fetchAttendance();
      setShowQR(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to mark attendance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">✅ Mark Attendance</h2>
          <button className="btn btn-primary" onClick={() => setShowQR(!showQR)}>
            {showQR ? 'Hide QR' : 'Show QR Code'}
          </button>
        </div>

        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        {showQR && (
          <div className="qr-container">
            <QRCode value={`attendance-${user._id}-${Date.now()}`} size={200} />
            <p>Scan this QR code to mark your attendance</p>
            <button className="btn btn-success" onClick={markAttendance} disabled={loading}>
              {loading ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Attendance History</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.time}</td>
                <td>
                  <span className={`badge badge-${record.status === 'present' ? 'success' : 'danger'}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MealFeedback = ({ user }) => {
  const [formData, setFormData] = useState({
    mealType: 'lunch',
    rating: 3,
    taste: 3,
    quantity: 3,
    quality: 3,
    comment: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetchFeedbackHistory();
    fetchSchedule();
  }, []);

  const fetchFeedbackHistory = async () => {
    try {
      const response = await mealAPI.getFeedbackByStudent(user._id);
      setFeedbackHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await mealAPI.getMealSchedule();
      setSchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await mealAPI.submitFeedback(formData);
      setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
      setFormData({
        mealType: 'lunch',
        rating: 3,
        taste: 3,
        quantity: 3,
        quality: 3,
        comment: ''
      });
      fetchFeedbackHistory();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div>
      {schedule && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📅 Today's Menu - {todayDay}</h2>
          </div>
          <div className="menu-grid">
            <div className="menu-item">
              <h4>🌅 Breakfast</h4>
              <p>{schedule[todayDay]?.breakfast}</p>
            </div>
            <div className="menu-item">
              <h4>🌞 Lunch</h4>
              <p>{schedule[todayDay]?.lunch}</p>
            </div>
            <div className="menu-item">
              <h4>🌙 Dinner</h4>
              <p>{schedule[todayDay]?.dinner}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🍽️ Submit Meal Feedback</h2>
        </div>

        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Meal Type</label>
            <select name="mealType" className="form-control" value={formData.mealType} onChange={handleChange}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Overall Rating: {formData.rating}/5</label>
            <input
              type="range"
              name="rating"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              className="slider"
            />
          </div>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Taste: {formData.taste}/5</label>
              <input
                type="range"
                name="taste"
                min="1"
                max="5"
                value={formData.taste}
                onChange={handleChange}
                className="slider"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity: {formData.quantity}/5</label>
              <input
                type="range"
                name="quantity"
                min="1"
                max="5"
                value={formData.quantity}
                onChange={handleChange}
                className="slider"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quality: {formData.quality}/5</label>
              <input
                type="range"
                name="quality"
                min="1"
                max="5"
                value={formData.quality}
                onChange={handleChange}
                className="slider"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Comment (Optional)</label>
            <textarea
              name="comment"
              className="form-control"
              rows="3"
              placeholder="Share your thoughts..."
              value={formData.comment}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Feedback History</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Meal</th>
              <th>Rating</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {feedbackHistory.slice(0, 10).map((feedback) => (
              <tr key={feedback._id}>
                <td>{new Date(feedback.date).toLocaleDateString()}</td>
                <td>{feedback.mealType}</td>
                <td>⭐ {feedback.rating}/5</td>
                <td>{feedback.comment || 'No comment'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LeaveRequests = ({ user }) => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await leaveAPI.getLeaveRequestsByStudent(user._id);
      setLeaveRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await leaveAPI.createLeaveRequest(formData);
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
      setFormData({ fromDate: '', toDate: '', reason: '' });
      fetchLeaveRequests();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit leave request' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📝 Apply for Leave</h2>
        </div>

        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                name="fromDate"
                className="form-control"
                value={formData.fromDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                name="toDate"
                className="form-control"
                value={formData.toDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              name="reason"
              className="form-control"
              rows="4"
              placeholder="Provide reason for leave..."
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 Leave Request History</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Admin Comment</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave._id}>
                <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {leave.status}
                  </span>
                </td>
                <td>{leave.adminComment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAllAnnouncements();
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📢 All Announcements</h2>
      </div>
      {announcements.length > 0 ? (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-item">
              <div className="announcement-header">
                <h4>{announcement.title}</h4>
                <span className={`badge badge-${announcement.priority === 'urgent' ? 'danger' : announcement.priority === 'high' ? 'warning' : 'info'}`}>
                  {announcement.priority}
                </span>
              </div>
              <p>{announcement.message}</p>
              <small>Posted on {new Date(announcement.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      ) : (
        <p>No announcements available</p>
      )}
    </div>
  );
};

const Profile = ({ user }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">👤 Profile Information</h2>
      </div>
      <div className="profile-info">
        <div className="profile-item">
          <strong>Name:</strong>
          <span>{user?.name}</span>
        </div>
        <div className="profile-item">
          <strong>Email:</strong>
          <span>{user?.email}</span>
        </div>
        <div className="profile-item">
          <strong>Room Number:</strong>
          <span>{user?.roomNumber}</span>
        </div>
        <div className="profile-item">
          <strong>Phone:</strong>
          <span>{user?.phone}</span>
        </div>
        <div className="profile-item">
          <strong>Parent Contact:</strong>
          <span>{user?.parentContact}</span>
        </div>
        <div className="profile-item">
          <strong>Role:</strong>
          <span className="badge badge-info">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
