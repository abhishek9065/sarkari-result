# Sarkari Results Portal

A comprehensive job portal for government job seekers, featuring job listings, results, and admit card information.

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sarkari-results
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   **Server (.env):**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
   **Client (.env):**
   ```bash
   cd client
   cp .env.example .env
   # Edit .env with your API URL
   ```

### Development

1. **Start MongoDB** (make sure MongoDB is running)

2. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Production Deployment

### Build for Production

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server in production mode**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

### Environment Variables

**Server Environment Variables:**
- `NODE_ENV`: Set to 'production'
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Strong secret key for JWT tokens
- `JWT_EXPIRE`: Token expiration time
- `ADMIN_EMAIL`: Admin user email
- `ADMIN_PASSWORD`: Admin user password

**Client Environment Variables:**
- `REACT_APP_API_URL`: Backend API URL

### Deployment Checklist

- [ ] Update JWT_SECRET to a strong, unique value
- [ ] Change default admin credentials
- [ ] Set MONGODB_URI to production database
- [ ] Update REACT_APP_API_URL to production API URL
- [ ] Remove or disable console.log statements
- [ ] Set up HTTPS for production
- [ ] Configure proper CORS settings
- [ ] Set up database backups
- [ ] Configure error monitoring
- [ ] Set up CI/CD pipeline

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── types/          # TypeScript types
│   └── public/
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Entry point
```

## 🔧 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/jobs` - Get jobs list
- `GET /api/results` - Get results list
- `GET /api/admit-cards` - Get admit cards list
- `GET /api/admin/*` - Admin endpoints

## 🛡️ Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- CORS protection
- Rate limiting (recommended for production)

## 📱 Features

- **User Management**: Registration, login, profile management
- **Job Listings**: Browse and search government jobs
- **Results**: Check exam results
- **Admit Cards**: Download admit cards
- **Admin Panel**: Manage jobs, results, and admit cards
- **Responsive Design**: Mobile-friendly interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
