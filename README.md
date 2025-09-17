# BankEase Mobile Banking App

A complete mobile banking application built with Next.js frontend and Node.js/Express backend with MongoDB.

## 📱 Features

### Frontend (Next.js)
- **Authentication**: Secure login/register with phone number and 4-digit PIN
- **Dashboard**: Overview of account balance and recent transactions
- **Send Money**: Step-by-step money transfer process
- **Balance Management**: View current balance with transaction history
- **Responsive Design**: Optimized for mobile devices
- **Dark/Light Mode**: Theme toggle support

### Backend (Node.js/Express)
- **RESTful API**: Clean API endpoints for all banking operations
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Persistent data storage with Mongoose
- **Transaction Management**: Atomic transactions for money transfers
- **Security Features**: Rate limiting, CORS, helmet protection
- **Password Hashing**: bcryptjs for secure PIN storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bankease
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_EXPIRE=7d
   ```

4. **Start the backend server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to main directory:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📊 Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Database and collections will be created automatically

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bankease?retryWrites=true&w=majority
   ```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Transactions
- `GET /api/transactions/balance` - Get user balance
- `POST /api/transactions/send` - Send money to another user
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/recent` - Get last 5 transactions
- `GET /api/transactions/:transactionId` - Get specific transaction

## 🔧 API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "pin": "1234"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "pin": "1234"
  }'
```

### Send Money (requires JWT token)
```bash
curl -X POST http://localhost:5000/api/transactions/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "+0987654321",
    "amount": 100.50
  }'
```

### Get Balance (requires JWT token)
```bash
curl -X GET http://localhost:5000/api/transactions/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 💾 Data Models

### User Model
```javascript
{
  name: String (required),
  phone: String (unique, required),
  pin: String (hashed, required),
  balance: Number (default: 1000),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  type: String ("send" | "receive" | "pay"),
  amount: Number (required),
  to: String (phone number),
  from: String (phone number),
  description: String,
  status: String ("pending" | "completed" | "failed"),
  transactionId: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **PIN Hashing**: bcryptjs for secure PIN storage
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Configured for frontend domains
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error responses
- **Helmet**: Security headers middleware

## 🧪 Testing the Application

1. **Start both backend and frontend servers**
2. **Register a new account:**
   - Open `http://localhost:3000`
   - Navigate to auth page
   - Create account with name, phone, and 4-digit PIN
3. **Test transactions:**
   - View balance on dashboard
   - Send money to another user (need to register multiple accounts)
   - Check transaction history

## 📱 Frontend Features

### Authentication Flow
- Phone number + PIN login/register
- JWT token storage in localStorage
- Automatic token verification
- Redirect to login on token expiry

### API Integration
- Centralized API client (`lib/api.js`)
- Automatic JWT header injection
- Error handling with user-friendly messages
- Loading states and error displays

### UI Components
- Mobile-first responsive design
- Loading animations
- Error states
- Success confirmations
- Transaction step indicators

## 🔄 Development Workflow

1. **Backend changes:**
   ```bash
   cd backend
   npm run dev  # Auto-restart on changes
   ```

2. **Frontend changes:**
   ```bash
   npm run dev  # Hot reload enabled
   ```

3. **Check logs:**
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser console and terminal
   - Database: MongoDB logs or Atlas monitoring

## 🚦 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Use production MongoDB URI
3. Set secure JWT secret (long random string)
4. Configure proper CORS origins
5. Use process manager like PM2

### Frontend Deployment
1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or similar platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check MongoDB connection
   - Verify environment variables
   - Check port availability

2. **Frontend API calls fail:**
   - Verify backend is running
   - Check CORS configuration
   - Verify API URL in environment

3. **Authentication issues:**
   - Clear localStorage
   - Check JWT secret consistency
   - Verify token expiration

4. **Database connection errors:**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity for Atlas

For more help, check the console logs and error messages.
