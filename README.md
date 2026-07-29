# HostelEase v2.0

**Smart Hostel Management System with AI**

A complete MERN stack application with Google Gemini AI integration for smart hostel management.

---

## 🎯 Overview

HostelEase is a comprehensive hostel management system featuring:

- **12 Complete Modules** for students and administrators
- **Google Gemini AI** integration for predictions and recommendations
- **Real-time features** with Socket.IO
- **E-commerce** with digital wallet
- **QR-based attendance** system
- **70+ API endpoints**
---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or extract the project**
   ```bash
   cd hostel-ease
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.production.example .env
   # Edit .env with your values
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Seed Database** (First time only)
   ```bash
   cd backend
   npm run seed:products
   npm run seed:menu
   npm run verify:admin
   ```

---

## 📚 Documentation

- **[START_HERE.txt](START_HERE.txt)** - Main guide and overview
- **[PRODUCTION_README.txt](PRODUCTION_README.txt)** - Complete deployment guide
- **[DEPLOY_CHECKLIST.txt](DEPLOY_CHECKLIST.txt)** - Step-by-step deployment
- **[ERROR_SOLUTIONS.txt](ERROR_SOLUTIONS.txt)** - Troubleshooting guide
- **[ADMIN_CREDENTIALS.txt](ADMIN_CREDENTIALS.txt)** - Admin login (keep secure!)

---

## 🏗️ Tech Stack

**Frontend:**
- React.js 18
- React Router 6
- Axios
- Socket.IO Client
- Recharts (Analytics)

**Backend:**
- Node.js 16+
- Express.js
- MongoDB + Mongoose
- Socket.IO
- Google Gemini AI
- JWT Authentication
- Multer (File uploads)

**Security:**
- Helmet
- CORS
- Rate Limiting
- XSS Protection
- Input Sanitization

---

## 📦 Modules

### Student Panel
1. Dashboard with analytics
2. QR-based attendance
3. Meal feedback system
4. Leave request management
5. E-commerce shop (29 products)
6. Shopping cart & orders
7. Digital wallet
8. 7-day food menu
9. Order history
10. Feedback submission
11. Real-time chat

### Admin Panel
12. Analytics dashboard
13. Student management
14. Attendance monitoring
15. Feedback review
16. Leave approval system
17. Food wastage tracking
18. AI predictions & recommendations
19. Excel exports
20. Announcements

---

## 🤖 AI Features

Powered by **Google Gemini AI**:

- 🔮 Food wastage prediction
- 🛍️ Product recommendations
- 📊 Attendance pattern analysis
- 🍽️ Menu optimization
- 💭 Sentiment analysis
- 💬 Smart chatbot
- 📈 Demand forecasting
- 🎯 Behavior analytics

---

## 🔐 Default Credentials

**Admin:**
- Email: `admin123@gmail.com`
- Password: `@admin123`

⚠️ **Important:** Change admin password after first login!

---

## 📁 Project Structure

```
hostel-ease/
├── backend/                  # Node.js backend
│   ├── config/              # Database & configuration
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth, error handling
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── scripts/             # Database utilities
│   ├── services/            # Gemini AI service
│   ├── utils/               # Helper functions
│   ├── .env                 # Environment variables
│   ├── package.json         # Dependencies
│   └── server.js            # Main server
│
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js           # Main app
│   ├── Dockerfile           # Docker config
│   ├── nginx.conf           # Nginx config
│   └── package.json         # Dependencies
│
└── Documentation/            # Complete guides
```

---

## 🌐 Deployment

### Docker (Recommended)

**Frontend:**
```bash
cd frontend
docker build -t hosteleaseapp-frontend .
docker run -p 80:80 hosteleaseapp-frontend
```

**Backend:**
```bash
cd backend
npm ci --only=production
npm start
```

### Manual Deployment

See **[PRODUCTION_README.txt](PRODUCTION_README.txt)** for detailed instructions.

---

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-mongodb-connection
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=https://yourdomain.com
```

### Frontend
```env
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_SOCKET_URL=https://your-backend-api.com
```

---

## 📊 API Endpoints

### Public
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration

### Student
- `GET /api/attendance` - Get attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/products` - Browse products
- `POST /api/cart/items` - Add to cart
- `POST /api/orders` - Place order
- `GET /api/wallet` - Get wallet balance

### Admin
- `GET /api/students` - Get all students
- `GET /api/meals/feedback` - Get all feedback
- `PUT /api/leave/:id` - Approve/reject leave
- `GET /api/foodwastage/stats` - Analytics

### AI
- `POST /api/ai/predict-wastage` - Food wastage prediction
- `POST /api/ai/recommend-products` - Product recommendations
- `POST /api/ai/analyze-attendance` - Attendance analysis
- `POST /api/ai/chat` - Smart chatbot

---

## 🧪 Testing

```bash
# Backend
cd backend
npm run verify:admin    # Verify admin account
npm run verify:db       # Check database connection

# Frontend
cd frontend
npm start               # Start development server
```

---

## 🛠️ Maintenance

### Update Dependencies
```bash
npm update              # Update packages
npm audit fix           # Fix vulnerabilities
```

### Database Management
```bash
npm run seed:products   # Seed products
npm run seed:menu       # Seed food menu
npm run clean:students  # Clear student data
```

---

## 📞 Support

For issues or questions:
1. Check **[ERROR_SOLUTIONS.txt](ERROR_SOLUTIONS.txt)**
2. Review application logs
3. Check browser console (F12)
4. Verify environment variables

---

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ XSS protection
- ✅ Input sanitization
- ✅ Helmet security headers
- ✅ MongoDB injection prevention

---

## 📈 Performance

- ✅ MongoDB indexing
- ✅ Connection pooling
- ✅ Caching strategies
- ✅ Optimized queries
- ✅ Gzip compression
- ✅ CDN-ready static assets

---

## 📝 License

All Rights Reserved © 2024 HostelEase

---

## 🎉 Version History

### v2.0 - Current (Production Ready)
- ✅ Google Gemini AI integration
- ✅ 12 complete modules
- ✅ Production optimized
- ✅ Security hardened
- ✅ Docker support
- ✅ Comprehensive documentation

### v1.0 - Initial Release
- Basic MERN stack
- Student and admin panels
- Core functionality

---

## 🚀 Getting Started

1. Read **[START_HERE.txt](START_HERE.txt)** - Main overview
2. Review **[PRODUCTION_README.txt](PRODUCTION_README.txt)** - Deployment guide
3. Follow **[DEPLOY_CHECKLIST.txt](DEPLOY_CHECKLIST.txt)** - Step-by-step
4. Set up environment variables
5. Deploy and go live!

---

**Built with ❤️ using MERN Stack + Google Gemini AI**
