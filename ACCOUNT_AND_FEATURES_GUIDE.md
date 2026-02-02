# DBMS Web App - Complete Documentation

## 🔐 Account Creation Process

### Registration Flow
1. **User visits registration page** (`/register` or `/signup`)
2. **User fills out registration form** with required fields:
   - Email address
   - Password (with confirmation)
   - Username/Full name
   - Other profile information

3. **Form validation** (client-side & server-side):
   - Email format validation
   - Password strength requirements
   - Duplicate email/username check

4. **Backend processing**:
   - Password hashing (using bcrypt or similar)
   - User record creation in database
   - Session/JWT token generation

5. **Post-registration**:
   - Email verification (optional)
   - Redirect to dashboard/login

### Typical Database Schema for Users

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') DEFAULT 'user'
);
```

---

## 🌟 Web Application Features

### Core Features
| Feature | Description |
|---------|-------------|
| **User Authentication** | Login, logout, password reset |
| **User Registration** | Account creation with validation |
| **Dashboard** | Main user interface after login |
| **Profile Management** | Update user information |
| **Role-Based Access** | Different permissions for users/admins |
| **Request Management** | Create, view, and manage requests |
| **Staff Functions** | Manage requests and users |
| **Student Functions** | Submit and track requests |

### CRUD Operations
- **Create** - Add new records to database
- **Read** - View/query existing data
- **Update** - Modify existing records
- **Delete** - Remove records from database

---

## 🗄️ DBMS Usage Explanation

### What is DBMS?
A **Database Management System (DBMS)** is software that manages databases, allowing users to store, retrieve, and manipulate data efficiently.

### Key DBMS Functions
1. **Data Storage** - Securely store all application data
2. **Data Retrieval** - Query and fetch data efficiently
3. **Data Integrity** - Ensure data consistency and accuracy
4. **Data Security** - Protect sensitive information
5. **Transaction Management** - Handle multi-step operations safely

### How This Web App Uses DBMS

#### 1. **Connection Setup**
The application connects to the database using connection pooling:

```javascript
// filepath: server/src/utils/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

#### 2. **Database Schema (Prisma)**
The application uses Prisma as the ORM (Object-Relational Mapping) tool with the schema defined in:

```
server/prisma/schema.prisma
```

#### 3. **Common Database Operations**

**Creating a User (INSERT)**
```javascript
const createUser = async (email, username, hashedPassword, role) => {
    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            role
        }
    });
    return user;
};
```

**Reading User Data (SELECT)**
```javascript
const getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });
    return user;
};
```

**Updating User (UPDATE)**
```javascript
const updateUser = async (userId, newData) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: newData
    });
    return user;
};
```

**Deleting User (DELETE)**
```javascript
const deleteUser = async (userId) => {
    const result = await prisma.user.delete({
        where: { id: userId }
    });
    return result;
};
```

---

## 📋 Step-by-Step Processes

### User Registration Process
```
1. Navigate to /register page
2. Fill in email, username, password, and other details
3. Click "Submit" or "Register" button
4. Client-side validation checks form fields
5. Request sent to backend API (/api/auth/register)
6. Backend validates input again (server-side)
7. Check if email already exists in database
8. Password is hashed using bcrypt
9. New user record created in database
10. JWT token generated and stored
11. Session created
12. User redirected to dashboard
13. Confirmation message displayed
```

### User Login Process
```
1. Navigate to /login page
2. Enter email and password
3. Click "Login" button
4. Client sends credentials to /api/auth/login
5. Backend queries database for user by email
6. Retrieved password hash compared with provided password
7. If match found:
   - JWT token generated
   - Token stored in session/cookies
   - User redirected to dashboard
8. If no match:
   - Error message displayed
   - User remains on login page
```

### Data Request Management (Student Perspective)
```
1. Student logs in to dashboard
2. Navigate to "Create New Request" or "My Requests"
3. Fill in request details (title, description, type, etc.)
4. Submit form
5. Request data stored in database
6. Student receives confirmation
7. Request appears in "My Requests" list
8. Student can track status in real-time
```

### Request Management (Staff Perspective)
```
1. Staff member logs in to dashboard
2. Navigate to "All Requests"
3. View list of pending requests from database
4. Click on request to view details
5. Update request status (Pending → Approved/Rejected)
6. Add comments or notes
7. Changes saved to database
8. Student receives notification
9. Request status updated in their view
```

### Admin/Staff User Management
```
1. Admin logs in and navigates to "User Management"
2. View list of all users from database
3. Perform actions:
   - Edit user details
   - Change user role (Student ↔ Staff ↔ Admin)
   - Deactivate/Delete user account
   - Reset user password
4. Changes committed to database
5. Activity logged for audit trail
```

---

## 🔧 Environment Configuration

Your `.env` file should contain:
```
# Database Configuration
DATABASE_URL=your_database_connection_string

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Client Configuration
VITE_API_URL=http://localhost:3000/api
```

---

## 📁 Project Structure

### Frontend (`client/`)
- **Components** - Reusable UI elements
- **Pages** - Main application pages
  - `auth/` - Login and Register pages
  - `student/` - Student-specific pages
  - `staff/` - Staff-specific pages
- **Services** - API communication (`api.js`)
- **Context** - State management (`AuthContext.jsx`)

### Backend (`server/`)
- **Routes** - API endpoints
  - `auth.js` - Authentication routes
  - `requests.js` - Request management routes
  - `students.js` - Student data routes
  - `status.js` - Status update routes
- **Middleware** - Request processing
  - `auth.js` - JWT validation
  - `roles.js` - Role-based access control
- **Database** - Prisma ORM configuration

### Database Migrations
Located in `server/prisma/migrations/`:
- `20260127162815_dbms/` - Initial schema setup
- `20260128030743_update_schema/` - Schema updates

---

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Secure token management

### Authorization
- Role-based access control (RBAC)
- Route protection middleware
- Permission validation

### Data Protection
- Input validation and sanitization
- SQL injection prevention (via Prisma)
- CORS configuration
- Environment variable protection

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Run both frontend and backend concurrently
npm run dev

# Or run individually:
npm run dev:client
npm run dev:server
```

---

## 📚 API Endpoints Overview

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Request Routes
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get specific request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Student Routes
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student profile

### Status Routes
- `GET /api/status` - Get status information
- `PUT /api/status/:id` - Update status

---

## 💡 Key Concepts

### ORM (Object-Relational Mapping)
The application uses **Prisma** as an ORM, which allows developers to interact with the database using JavaScript objects instead of writing raw SQL queries.

### JWT (JSON Web Tokens)
Used for stateless authentication. Tokens contain encoded user information and are verified on each request.

### Role-Based Access Control (RBAC)
Different user roles (Student, Staff, Admin) have different permissions and access levels throughout the application.

### Middleware
Functions that process requests before they reach route handlers, used for authentication, validation, and error handling.

---

## 🔄 Data Flow Example: Creating a Request

```
1. Student fills form on frontend (NewRequest.jsx)
   ↓
2. Form submitted via API call (services/api.js)
   ↓
3. Request reaches backend server
   ↓
4. Authentication middleware validates JWT token (middleware/auth.js)
   ↓
5. Role middleware checks if user is Student (middleware/roles.js)
   ↓
6. Route handler processes request (routes/requests.js)
   ↓
7. Prisma creates record in database (schema.prisma)
   ↓
8. Database returns new record ID
   ↓
9. API returns success response to frontend
   ↓
10. Frontend updates UI and shows confirmation
   ↓
11. Request now visible in student's request list
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**
- Check `.env` file has correct `DATABASE_URL`
- Ensure database server is running
- Verify database credentials

**Authentication Failed**
- Clear browser cookies/local storage
- Check JWT secret in `.env`
- Ensure token hasn't expired

**API Not Responding**
- Check server is running (`npm run dev:server`)
- Verify API URL in frontend `.env`
- Check network connectivity

---

Last Updated: February 2, 2026
