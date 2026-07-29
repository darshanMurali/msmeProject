import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, attendanceAPI, mealAPI, leaveAPI, announcementAPI, foodWastageAPI, adminAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import AdminChat from './AdminChat';

const AdminDashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} isSuperAdmin={isSuperAdmin} />
      <div className="dashboard-content">
        <Header user={user} />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/students" element={<Students />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/feedback" element={<FeedbackManagement />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/announcements" element={<AnnouncementManagement />} />
            <Route path="/foodwastage" element={<FoodWastageManagement />} />
            <Route path="/chat" element={<AdminChat />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AdminSidebar = ({ activeTab, setActiveTab, user, logout, isSuperAdmin }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>(HMS)Hostel Management System</h2>
        <p className="user-name">{user?.name}</p>
        <span className="badge badge-danger">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/admin" className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          <span>📊</span> Dashboard
        </Link>
        <Link to="/admin/students" className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
          <span>👥</span> Students
        </Link>
        {isSuperAdmin && (
          <Link to="/admin/admins" className={activeTab === 'admins' ? 'active' : ''} onClick={() => setActiveTab('admins')}>
            <span>👨‍💼</span> Admin Management
          </Link>
        )}
        <Link to="/admin/attendance" className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
          <span>✅</span> Attendance
        </Link>
        <Link to="/admin/feedback" className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
          <span>🍽️</span> Meal Feedback
        </Link>
        <Link to="/admin/leave" className={activeTab === 'leave' ? 'active' : ''} onClick={() => setActiveTab('leave')}>
          <span>📝</span> Leave Requests
        </Link>
        <Link to="/admin/announcements" className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>
          <span>📢</span> Announcements
        </Link>
        <Link to="/admin/foodwastage" className={activeTab === 'foodwastage' ? 'active' : ''} onClick={() => setActiveTab('foodwastage')}>
          <span>🗑️</span> Food Wastage
        </Link>
        <Link to="/admin/chat" className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
          <span>💬</span> Student Chat
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
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="dashboard-header">
      <div>
        <h1>Admin Dashboard 🎯</h1>
        <p className="date">{currentDate}</p>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [attendanceStats, feedbackStats, wastageStats] = await Promise.all([
        attendanceAPI.getAttendanceStats(),
        mealAPI.getFeedbackStats(),
        foodWastageAPI.getFoodWastageStats()
      ]);
      
      setStats({
        attendance: attendanceStats.data.data,
        feedback: feedbackStats.data.data,
        wastage: wastageStats.data.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>👥</div>
          <div className="stat-content">
            <h3>{stats.attendance?.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
          <div className="stat-content">
            <h3>{stats.attendance?.attendancePercentage || 0}%</h3>
            <p>Today's Attendance</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>⭐</div>
          <div className="stat-content">
            <h3>{stats.feedback?.todayFeedback?.length || 0}</h3>
            <p>Feedback Received</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>🗑️</div>
          <div className="stat-content">
            <h3>{Math.round(stats.wastage?.overallStats?.averageWastage || 0)} kg</h3>
            <p>Avg Food Wastage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.attendance?.weeklyAttendance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#667eea" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Food Wastage by Meal Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.wastage?.wastageByMealType || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalWastage" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Students = () => {
  const { isSuperAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAllStudents();
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.deleteStudent(id);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>👥 Student Management</h2>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Room</th>
            <th>Phone</th>
            {isSuperAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.roomNumber}</td>
              <td>{student.phone}</td>
              {isSuperAdmin && (
                <td>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteStudent(student._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.getAllAdmins();
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await adminAPI.updateAdmin(editingAdmin._id, formData);
      } else {
        await adminAPI.createAdmin(formData);
      }
      setFormData({ name: '', email: '', password: '', phone: '' });
      setEditingAdmin(null);
      setShowForm(false);
      fetchAdmins();
      alert(editingAdmin ? 'Admin updated successfully!' : 'Admin created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await adminAPI.deleteAdmin(id);
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Error deleting admin: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>👨‍💼 Admin Management</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingAdmin(null);
              setFormData({ name: '', email: '', password: '', phone: '' });
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : 'Create Admin'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingAdmin && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingAdmin}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">
              {editingAdmin ? 'Update Admin' : 'Create Admin'}
            </button>
          </form>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>
                  <span className={`badge badge-${admin.role === 'superadmin' ? 'warning' : 'info'}`}>
                    {admin.role}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginRight: '5px' }}
                    onClick={() => handleEdit(admin)}
                  >
                    Edit
                  </button>
                  {admin.role !== 'superadmin' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(admin._id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAllAttendance();
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ Attendance Records</h2>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record._id}>
              <td>{record.student?.name}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.time}</td>
              <td>
                <span className={`badge badge-${record.status === 'present' ? 'success' : 'danger'}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await mealAPI.getAllFeedback();
      setFeedback(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>🍽️ Meal Feedback</h2>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Date</th>
            <th>Meal</th>
            <th>Rating</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {feedback.map((fb) => (
            <tr key={fb._id}>
              <td>{fb.student?.name}</td>
              <td>{new Date(fb.date).toLocaleDateString()}</td>
              <td>{fb.mealType}</td>
              <td>⭐ {fb.rating}/5</td>
              <td>{fb.comment || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getAllLeaveRequests();
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await leaveAPI.updateLeaveRequest(id, { status });
      fetchLeaves();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>📝 Leave Requests</h2>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave._id}>
              <td>{leave.student?.name}</td>
              <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
              <td>{new Date(leave.toDate).toLocaleDateString()}</td>
              <td>{leave.reason}</td>
              <td>
                <span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}`}>
                  {leave.status}
                </span>
              </td>
              <td>
                {leave.status === 'pending' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleUpdate(leave._id, 'approved')}>
                      Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(leave._id, 'rejected')}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnnouncementManagement = () => {
  const { isSuperAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'medium', targetAudience: 'all' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAllAnnouncements();
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementAPI.createAnnouncement(formData);
      setFormData({ title: '', message: '', priority: 'medium', targetAudience: 'all' });
      setShowForm(false);
      fetchAnnouncements();
      alert('Announcement posted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to post announcement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementAPI.deleteAnnouncement(id);
        fetchAnnouncements();
        alert('Announcement deleted successfully!');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete announcement: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>📢 Announcements</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <select
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">Post</button>
          </form>
        )}

        <div className="announcements-list">
          {announcements.map((ann) => (
            <div key={ann._id} className="announcement-item">
              <div className="announcement-header">
                <h4>{ann.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge badge-${ann.priority === 'urgent' ? 'danger' : 'info'}`}>
                    {ann.priority}
                  </span>
                  {isSuperAdmin && (
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(ann._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p>{ann.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FoodWastageManagement = () => {
  const [prediction, setPrediction] = useState(null);
  const [trainingStats, setTrainingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    studentsPresent: 100,
    foodPrepared: 80,
    weather: 'sunny'
  });

  useEffect(() => {
    fetchTrainingStats();
  }, []);

  const fetchTrainingStats = async () => {
    try {
      const response = await foodWastageAPI.getTrainingStats();
      setTrainingStats(response.data.data);
    } catch (error) {
      console.error('Error fetching training stats:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);

    try {
      // Step 1: Upload CSV if file is selected
      if (csvFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', csvFile);
        
        await foodWastageAPI.uploadCSV(formDataUpload);
        setCsvFile(null);
        document.getElementById('csv-file-input').value = '';
        
        // Refresh training stats after upload
        await fetchTrainingStats();
      }
      
      // Step 2: Make prediction
      const response = await foodWastageAPI.predictFoodWastage(formData);
      const predictionData = response.data.data;
      setPrediction(predictionData);
      
      // Refresh training stats to show updated data
      fetchTrainingStats();
    } catch (error) {
      console.error('Prediction error:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('❌ Prediction failed: ' + errorMsg + '\n\n' +
            'Make sure:\n' +
            '• Training data has been uploaded (CSV)\n' +
            '• GEMINI_API_KEY is configured in backend\n' +
            '• All form fields are filled correctly');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* CSV Upload Section */}
      <div className="card" style={{marginBottom: '20px'}}>
        <h3 style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span>📤</span>
          <span>Upload Training Data (CSV)</span>
        </h3>
        <p style={{color: '#666', fontSize: '14px', marginBottom: '15px'}}>
          Upload a CSV file with columns: date, meal_type, students_present, food_prepared, food_consumed, wastage, weather
        </p>
        <div className="form-group" style={{marginBottom: 0}}>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="form-control"
            disabled={isLoading}
            style={{padding: '8px'}}
          />
          {csvFile && (
            <p style={{marginTop: '8px', color: '#27ae60', fontSize: '13px'}}>
              ✓ File selected: {csvFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Prediction Section */}
      <div className="card">
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0}}>🗑️ Food Wastage Prediction (Gemini AI)</h2>
        </div>
        
        <form onSubmit={handlePredict}>
          <div className="grid grid-2" style={{gap: '20px'}}>
            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                style={{padding: '10px'}}
              />
            </div>
            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Meal Type</label>
              <select
                className="form-control"
                value={formData.mealType}
                onChange={(e) => setFormData({...formData, mealType: e.target.value})}
                style={{padding: '10px'}}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Students Present</label>
              <input
                type="number"
                className="form-control"
                value={formData.studentsPresent}
                onChange={(e) => setFormData({...formData, studentsPresent: e.target.value})}
                required
                placeholder="e.g., 150"
                style={{padding: '10px'}}
              />
            </div>
            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Food Prepared (kg)</label>
              <input
                type="number"
                className="form-control"
                value={formData.foodPrepared}
                onChange={(e) => setFormData({...formData, foodPrepared: e.target.value})}
                required
                placeholder="e.g., 80"
                style={{padding: '10px'}}
              />
            </div>
            <div className="form-group">
              <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Weather</label>
              <select
                className="form-control"
                value={formData.weather}
                onChange={(e) => setFormData({...formData, weather: e.target.value})}
                style={{padding: '10px'}}
              >
                <option value="sunny">☀️ Sunny</option>
                <option value="rainy">🌧️ Rainy</option>
                <option value="cloudy">☁️ Cloudy</option>
              </select>
            </div>
          </div>
          
          <div style={{marginTop: '25px', textAlign: 'center'}}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{
                padding: '12px 40px',
                fontSize: '16px',
                fontWeight: '600',
                minWidth: '200px'
              }}
            >
              {isLoading ? (
                csvFile ? '📤 Uploading & Predicting...' : '🔄 Predicting...'
              ) : (
                csvFile ? '📤 Upload & Predict Wastage' : '🎯 Predict Wastage'
              )}
            </button>
            {csvFile && !isLoading && (
              <p style={{marginTop: '10px', fontSize: '13px', color: '#666'}}>
                ℹ️ CSV will be uploaded before prediction
              </p>
            )}
          </div>
        </form>

        {prediction && (
          <div className="prediction-result" style={{marginTop: '30px', paddingTop: '30px', borderTop: '2px solid #eee'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0, color: '#2c3e50'}}>🤖 AI Prediction Results</h3>
              {prediction.savedToDatabase && (
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>✓</span>
                  <span>Saved to Database</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-3" style={{gap: '20px', marginBottom: '25px'}}>
              <div className="stat-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center'}}>
                <h4 style={{color: 'white', fontSize: '14px', marginBottom: '10px'}}>Predicted Wastage</h4>
                <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                  {prediction.predictedWastage} kg
                </p>
              </div>
              <div className="stat-card" style={{background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center'}}>
                <h4 style={{color: 'white', fontSize: '14px', marginBottom: '10px'}}>Wastage %</h4>
                <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                  {prediction.wastagePercentage}%
                </p>
              </div>
              <div className="stat-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center'}}>
                <h4 style={{color: 'white', fontSize: '14px', marginBottom: '10px'}}>Confidence</h4>
                <p style={{fontSize: '36px', fontWeight: 'bold', margin: 0}}>
                  {prediction.confidence || 'N/A'}%
                </p>
              </div>
            </div>
            
            <div className="alert alert-info" style={{padding: '20px', background: '#e8f4fd', borderLeft: '4px solid #2196F3', borderRadius: '8px'}}>
              <strong style={{fontSize: '16px'}}>💡 Recommendation:</strong>
              <p style={{marginTop: '10px', marginBottom: 0, fontSize: '15px'}}>{prediction.recommendation}</p>
            </div>
            
            {prediction.factors && prediction.factors.length > 0 && (
              <div style={{marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
                <strong style={{fontSize: '16px', color: '#2c3e50'}}>🔑 Key Factors:</strong>
                <ul style={{marginTop: '12px', paddingLeft: '25px'}}>
                  {prediction.factors.map((factor, idx) => (
                    <li key={idx} style={{marginBottom: '8px', fontSize: '14px'}}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{marginTop: '20px', padding: '15px', background: '#f1f3f5', borderRadius: '6px', fontSize: '13px', color: '#666', textAlign: 'center'}}>
              <strong>Model:</strong> {prediction.predictionSource || 'Gemini AI'} • 
              <strong> Training Data:</strong> {prediction.trainingDataUsed || 'N/A'} records • 
              <strong> Day:</strong> {prediction.dayOfWeek}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
