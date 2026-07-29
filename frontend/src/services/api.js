import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Adding timeout to prevent hanging requests
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      console.error('Access forbidden:', error.response.data.message);
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data.message);
    } else if (!error.response) {
      // Handle network errors
      console.error('Network error:', error.message);
      // Add a more descriptive error message for network issues
      error.message = 'Unable to connect to server. Please check your internet connection and try again.';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.get('/auth/logout'),
};

// Student APIs
export const studentAPI = {
  getAllStudents: (params) => API.get('/students', { params }),
  getStudent: (id) => API.get(`/students/${id}`),
  updateStudent: (id, data) => API.put(`/students/${id}`, data),
  deleteStudent: (id) => API.delete(`/students/${id}`),
  getStudentStats: (id) => API.get(`/students/${id}/stats`),
};

// Admin APIs
export const adminAPI = {
  getAllAdmins: () => API.get('/admins'),
  getAdmin: (id) => API.get(`/admins/${id}`),
  createAdmin: (data) => API.post('/admins', data),
  updateAdmin: (id, data) => API.put(`/admins/${id}`, data),
  deleteAdmin: (id) => API.delete(`/admins/${id}`),
};

// Attendance APIs
export const attendanceAPI = {
  markAttendance: (data) => API.post('/attendance', data),
  getAllAttendance: (params) => API.get('/attendance', { params }),
  getAttendanceByStudent: (id) => API.get(`/attendance/student/${id || ''}`),
  getAttendanceStats: () => API.get('/attendance/stats'),
  deleteAttendance: (id) => API.delete(`/attendance/${id}`),
};

// Meal APIs
export const mealAPI = {
  submitFeedback: (data) => API.post('/meals/feedback', data),
  getAllFeedback: (params) => API.get('/meals/feedback', { params }),
  getFeedbackByStudent: (id) => API.get(`/meals/feedback/student/${id || ''}`),
  getFeedbackStats: () => API.get('/meals/feedback/stats'),
  getMealSchedule: () => API.get('/meals/schedule'),
};

// Leave APIs
export const leaveAPI = {
  createLeaveRequest: (data) => API.post('/leave', data),
  getAllLeaveRequests: (params) => API.get('/leave', { params }),
  getLeaveRequestsByStudent: (id) => API.get(`/leave/student/${id || ''}`),
  getLeaveRequest: (id) => API.get(`/leave/${id}`),
  updateLeaveRequest: (id, data) => API.put(`/leave/${id}`, data),
  deleteLeaveRequest: (id) => API.delete(`/leave/${id}`),
};
export const complaintAPI = {

  createComplaint: (data) =>
    API.post("/complaints", data),

  getStudentComplaints: (studentId) =>
    API.get(`/complaints/student/${studentId}`)

};

// Announcement APIs
export const announcementAPI = {
  createAnnouncement: (data) => API.post('/announcements', data),
  getAllAnnouncements: (params) => API.get('/announcements', { params }),
  getAnnouncement: (id) => API.get(`/announcements/${id}`),
  updateAnnouncement: (id, data) => API.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => API.delete(`/announcements/${id}`),
  toggleAnnouncementStatus: (id) => API.patch(`/announcements/${id}/toggle`),
};

// Food Wastage APIs
export const foodWastageAPI = {
  createFoodWastage: (data) => API.post('/foodwastage', data),
  getAllFoodWastage: (params) => API.get('/foodwastage', { params }),
  getFoodWastageStats: () => API.get('/foodwastage/stats'),
  getTrainingStats: () => API.get('/foodwastage/training-stats'),
  uploadCSV: (formData) => API.post('/foodwastage/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  predictFoodWastage: (data) => API.post('/foodwastage/predict', data),
  updateFoodWastage: (id, data) => API.put(`/foodwastage/${id}`, data),
  deleteFoodWastage: (id) => API.delete(`/foodwastage/${id}`),
};

// Wallet APIs
export const walletAPI = {
  getWallet: () => API.get('/wallet'),
  topUpWallet: (data) => API.post('/wallet/topup', data),
  getTransactions: (params) => API.get('/wallet/transactions', { params }),
  getAllWallets: () => API.get('/wallet/admin/all'),
  adjustWalletBalance: (userId, data) => API.post(`/wallet/${userId}/adjust`, data),
};

// Product APIs
export const productAPI = {
  getProducts: (params) => API.get('/products', { params }),
  getProduct: (id) => API.get(`/products/${id}`),
  createProduct: (data) => API.post('/products', data),
  updateProduct: (id, data) => API.put(`/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/products/${id}`),
  updateStock: (id, data) => API.patch(`/products/${id}/stock`, data),
  getProductsByCategory: (category) => API.get(`/products/category/${category}`),
};

// Cart APIs
export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (data) => API.post('/cart/items', data),
  updateCartItem: (itemId, data) => API.put(`/cart/items/${itemId}`, data),
  removeFromCart: (itemId) => API.delete(`/cart/items/${itemId}`),
  clearCart: () => API.delete('/cart'),
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders', { params }),
  getOrder: (id) => API.get(`/orders/${id}`),
  getAllOrders: (params) => API.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  cancelOrder: (id) => API.put(`/orders/${id}/cancel`),
};

export default API;
