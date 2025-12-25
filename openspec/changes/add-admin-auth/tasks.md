# Tasks: add-admin-auth

## 1. Data Model
- [x] 1.1 Create Admin model (email, password_hash, name)
- [x] 1.2 Create migration for admins table
- [x] 1.3 Create seeder for default admin

## 2. Authentication
- [x] 2.1 Configure session guard for admins
- [x] 2.2 Create AuthController (login, logout, me)
- [x] 2.3 Create validator for login
- [x] 2.4 Implement password hashing (argon2)

## 3. Route Protection
- [x] 3.1 Create AdminAuthMiddleware
- [x] 3.2 Apply middleware to /admin/* routes
- [x] 3.3 Configure httpOnly and secure cookies

## 4. API Routes
- [x] 4.1 POST /admin/login - Login
- [x] 4.2 POST /admin/logout - Logout
- [x] 4.3 GET /admin/me - Retrieve logged-in admin

## 5. Tests
- [x] 5.1 Test login with valid credentials
- [x] 5.2 Test login with invalid credentials
- [x] 5.3 Test access to protected routes without session