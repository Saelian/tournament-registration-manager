# Tasks: add-admin-auth

## 1. Data Model
- [ ] 1.1 Create Admin model (email, password_hash, name)
- [ ] 1.2 Create migration for admins table
- [ ] 1.3 Create seeder for default admin

## 2. Authentication
- [ ] 2.1 Configure session guard for admins
- [ ] 2.2 Create AuthController (login, logout, me)
- [ ] 2.3 Create validator for login
- [ ] 2.4 Implement password hashing (argon2)

## 3. Route Protection
- [ ] 3.1 Create AdminAuthMiddleware
- [ ] 3.2 Apply middleware to /admin/* routes
- [ ] 3.3 Configure httpOnly and secure cookies

## 4. API Routes
- [ ] 4.1 POST /admin/login - Login
- [ ] 4.2 POST /admin/logout - Logout
- [ ] 4.3 GET /admin/me - Retrieve logged-in admin

## 5. Tests
- [ ] 5.1 Test login with valid credentials
- [ ] 5.2 Test login with invalid credentials
- [ ] 5.3 Test access to protected routes without session