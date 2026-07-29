================================================================================
HOSTELEASEAPP v2.0 - PRODUCTION DEPLOYMENT GUIDE
================================================================================

ABOUT:
------
HostelEase is a smart hostel management system with 12 complete modules:
- Student Panel: Attendance, Meal Feedback, Leave, Shop, Wallet, Orders, Chat
- Admin Panel: Dashboard, Analytics, Food Wastage, User Management, Exports
- AI System: Google Gemini AI for predictions and recommendations

TECH STACK:
-----------
- Backend: Node.js, Express.js, MongoDB
- Frontend: React.js
- AI: Google Gemini AI
- Real-time: Socket.IO
- Authentication: JWT

================================================================================
PRODUCTION DEPLOYMENT
================================================================================

OPTION 1: DOCKER DEPLOYMENT (Recommended)
------------------------------------------

1. Build Frontend:
   cd frontend
   docker build -t hosteleaseapp-frontend .
   docker run -p 80:80 hosteleaseapp-frontend

2. Run Backend:
   cd backend
   npm ci --only=production
   npm start


OPTION 2: MANUAL DEPLOYMENT
----------------------------

BACKEND SETUP:
--------------
1. cd backend
2. npm ci --only=production
3. Set environment variables (see .env.example below)
4. npm start

FRONTEND SETUP:
---------------
1. cd frontend
2. npm ci --only=production
3. npm run build
4. Serve 'build' folder with nginx/apache

MONGODB:
--------
- Install MongoDB or use MongoDB Atlas
- Create database: hostel-ease
- Connection string in backend .env


================================================================================
ENVIRONMENT VARIABLES
================================================================================

BACKEND (.env):
---------------
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://your-mongo-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

FRONTEND (.env):
----------------
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_SOCKET_URL=https://your-backend-api.com


================================================================================
DATABASE INITIALIZATION
================================================================================

After deployment, run these commands:

1. Seed Products:
   cd backend
   node scripts/seedProducts.js

2. Seed Food Menu:
   node scripts/seedFoodMenu.js

3. Verify Admin Account:
   node scripts/verifyAdmin.js


================================================================================
ADMIN CREDENTIALS
================================================================================

Email: admin123@gmail.com
Password: @admin123

⚠️ IMPORTANT: Change admin password after first login!


================================================================================
PRODUCTION CHECKLIST
================================================================================

SECURITY:
---------
☐ Change JWT_SECRET to strong random string
☐ Change admin password
☐ Set NODE_ENV=production
☐ Enable HTTPS/SSL
☐ Configure CORS for your domain only
☐ Set up rate limiting
☐ Review and secure all API endpoints
☐ Enable MongoDB authentication

PERFORMANCE:
------------
☐ Use npm ci --only=production (no dev dependencies)
☐ Enable gzip compression
☐ Configure CDN for static assets
☐ Set up MongoDB indexes
☐ Configure caching headers
☐ Use PM2 or similar for process management

MONITORING:
-----------
☐ Set up error logging (e.g., Sentry)
☐ Configure health checks
☐ Monitor API response times
☐ Track database performance
☐ Set up uptime monitoring

BACKUP:
-------
☐ Configure automated MongoDB backups
☐ Backup .env files securely
☐ Document recovery procedures


================================================================================
PRODUCTION COMMANDS
================================================================================

START BACKEND (with PM2):
-------------------------
pm2 start server.js --name hosteleaseapp-backend
pm2 startup
pm2 save

STOP:
-----
pm2 stop hosteleaseapp-backend

RESTART:
--------
pm2 restart hosteleaseapp-backend

LOGS:
-----
pm2 logs hosteleaseapp-backend

MONITOR:
--------
pm2 monit


================================================================================
NGINX CONFIGURATION (Optional)
================================================================================

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/hosteleaseapp/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}


================================================================================
API ENDPOINTS
================================================================================

PUBLIC:
-------
POST /api/auth/login - User login
POST /api/auth/register - Student registration

STUDENT:
--------
GET  /api/attendance - Get attendance
POST /api/attendance - Mark attendance
GET  /api/meals/feedback - Get meal feedback
POST /api/meals/feedback - Submit feedback
GET  /api/leave - Get leave requests
POST /api/leave - Create leave request
GET  /api/products - Get shop products
GET  /api/cart - Get cart
POST /api/cart/items - Add to cart
POST /api/orders - Place order
GET  /api/wallet - Get wallet balance
POST /api/wallet/topup - Top up wallet

ADMIN:
------
GET  /api/students - Get all students
GET  /api/attendance - Get all attendance
GET  /api/meals/feedback - Get all feedback
GET  /api/leave - Get all leave requests
PUT  /api/leave/:id - Approve/reject leave
GET  /api/foodwastage/stats - Food wastage analytics
POST /api/foodwastage/predict - AI prediction
GET  /api/export/students - Export students (Excel)

AI ENDPOINTS:
-------------
POST /api/ai/predict-wastage - Food wastage prediction
POST /api/ai/recommend-products - Product recommendations
POST /api/ai/analyze-attendance - Attendance analysis
POST /api/ai/optimize-menu - Menu optimization
POST /api/ai/sentiment-analysis - Feedback sentiment
POST /api/ai/chat - Smart chatbot


================================================================================
FILE STRUCTURE
================================================================================

hostel-ease/
├── backend/
│   ├── config/         - Database & configurations
│   ├── controllers/    - Business logic
│   ├── middleware/     - Auth, error handling
│   ├── models/         - MongoDB schemas
│   ├── routes/         - API routes
│   ├── scripts/        - Database seed scripts
│   ├── services/       - Gemini AI service
│   ├── utils/          - Helper functions
│   ├── .env            - Environment variables
│   ├── package.json    - Dependencies
│   └── server.js       - Main server file
│
├── frontend/
│   ├── public/         - Static files
│   ├── src/
│   │   ├── components/ - Reusable components
│   │   ├── context/    - React context
│   │   ├── pages/      - Page components
│   │   ├── services/   - API service layer
│   │   └── App.js      - Main app component
│   ├── Dockerfile      - Docker config
│   ├── nginx.conf      - Nginx config
│   └── package.json    - Dependencies
│
├── ADMIN_CREDENTIALS.txt
├── ERROR_SOLUTIONS.txt
└── PRODUCTION_README.txt (this file)


================================================================================
TROUBLESHOOTING
================================================================================

Backend won't start:
--------------------
- Check MongoDB connection
- Verify .env variables
- Check port 5000 is not in use
- Review backend logs

Frontend won't build:
---------------------
- Clear node_modules: rm -rf node_modules
- Reinstall: npm ci
- Check REACT_APP_API_URL is set

Database connection issues:
---------------------------
- Verify MongoDB is running
- Check MONGO_URI format
- Ensure network access to MongoDB
- Check MongoDB credentials

AI predictions not working:
---------------------------
- Verify GEMINI_API_KEY in .env
- Check Gemini API quota
- Review backend logs for AI errors


================================================================================
SUPPORT & MAINTENANCE
================================================================================

For issues or questions:
1. Check ERROR_SOLUTIONS.txt
2. Review backend logs
3. Check browser console (F12)
4. Verify environment variables

Regular Maintenance:
- Update dependencies monthly
- Review and rotate JWT secrets
- Monitor database size and performance
- Backup database weekly
- Review access logs for security


================================================================================
VERSION HISTORY
================================================================================

v2.0 - Production Ready
- Gemini AI fully integrated
- 12 complete modules
- Production optimized
- Security hardened
- Docker support added

v1.0 - Initial Release
- Basic MERN stack
- Student and admin panels


================================================================================
LICENSE & CREDITS
================================================================================

HostelEase v2.0
Smart Hostel Management System
All Rights Reserved

Powered by:
- MongoDB, Express.js, React.js, Node.js
- Google Gemini AI
- Socket.IO


================================================================================
DEPLOYMENT COMPLETE - HOSTELEASEAPP v2.0 READY FOR PRODUCTION!
================================================================================
