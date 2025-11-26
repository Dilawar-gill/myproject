# 🔐 Authentication System - Complete Guide

## Overview

Your Next.js 15 app now has a complete, production-ready authentication system using:
- **JWT tokens** stored in HTTP-only cookies
- **Middleware** for route protection
- **Automatic redirects** based on auth status
- **TypeScript** for type safety

---

## 🏗️ Architecture

### 1. **Middleware** (`src/middleware.ts`)
**Purpose:** Runs before every request to check authentication

**Flow:**
```
Request → Middleware → Check Cookie → Verify JWT → Redirect or Allow
```

**Logic:**
- ✅ If user is authenticated and visits `/login` → Redirect to `/`
- ✅ If user is NOT authenticated and visits protected route → Redirect to `/login`
- ✅ Stores original URL in query param for redirect after login
- ✅ Allows public routes: `/login`, `/api/auth/*`

**Code Highlights:**
```typescript
// Check if user has valid token
const token = req.cookies.get(COOKIE_NAME)?.value
const isAuthenticated = token ? verifyToken(token) !== null : false

// Redirect authenticated users away from login
if (pathname === '/login' && isAuthenticated) {
  return NextResponse.redirect(new URL('/', req.url))
}

// Redirect unauthenticated users to login
if (!isPublicPath && !isAuthenticated) {
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', pathname) // Save original URL
  return NextResponse.redirect(loginUrl)
}
```

---

### 2. **Login Page** (`src/app/login/page.tsx`)
**Purpose:** Handle user authentication

**Features:**
- ✅ Client-side form validation
- ✅ API call to `/api/auth/login`
- ✅ Automatic redirect after successful login
- ✅ Redirects to original page (from query param)
- ✅ Shows loading state during authentication
- ✅ Checks if already authenticated on mount

**Flow:**
```
User enters credentials → Submit form → API call → Set cookie → Redirect to home
```

**Code Highlights:**
```typescript
// Check if already authenticated on mount
useEffect(() => {
  const checkAuth = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      router.replace(from); // Already logged in, redirect
    }
  };
  checkAuth();
}, []);

// Handle login
const handleLogin = async (e: React.FormEvent) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important for cookies
  });

  if (res.ok) {
    router.replace(from); // Redirect to original page
    router.refresh(); // Force middleware to run
  }
};
```

---

### 3. **Home Page** (`src/app/page.tsx`)
**Purpose:** Protected route that requires authentication

**Features:**
- ✅ Client-side auth check (belt and suspenders)
- ✅ Shows loading state while checking auth
- ✅ Fetches data only after authentication confirmed
- ✅ Redirects to login if not authenticated

**Flow:**
```
Page loads → Check auth → Show loading → Fetch data → Render content
```

**Code Highlights:**
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  const checkAuth = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      setIsAuthenticated(true);
      fetchCompanies(); // Fetch data after auth confirmed
      fetchServices();
    } else {
      router.replace('/login');
    }
  };
  checkAuth();
}, []);

// Show loading while checking auth
if (!isAuthenticated) {
  return <LoadingSpinner />;
}
```

---

### 4. **Auth API Routes** (`src/app/api/auth/`)

#### `/api/auth/login` - Login endpoint
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: {...} }
Sets HTTP-only cookie: invoice_token
```

#### `/api/auth/me` - Check current user
```typescript
GET /api/auth/me
Response: { id, email, name, role }
Returns 401 if not authenticated
```

#### `/api/auth/logout` - Logout endpoint
```typescript
POST /api/auth/logout
Clears cookie
Response: { ok: true }
```

---

## 🔒 Security Features

### 1. **HTTP-Only Cookies**
- Token stored in HTTP-only cookie (not accessible via JavaScript)
- Prevents XSS attacks
- Automatically sent with every request

### 2. **JWT Verification**
- Every request verified by middleware
- Invalid tokens rejected
- Expired tokens handled

### 3. **Secure Cookie Settings**
```typescript
response.cookies.set('invoice_token', token, { 
  httpOnly: true,           // Not accessible via JS
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax',          // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/'                 // Available site-wide
})
```

### 4. **Password Hashing**
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Secure comparison

---

## 🚀 User Flow Examples

### Scenario 1: First Visit (Not Authenticated)
```
1. User visits http://localhost:3001/
2. Middleware checks cookie → No token found
3. Middleware redirects to /login?from=/
4. User sees login page
5. User enters credentials and submits
6. API validates credentials
7. API sets HTTP-only cookie with JWT
8. Login page redirects to / (from query param)
9. Middleware checks cookie → Valid token
10. User sees home page
```

### Scenario 2: Already Authenticated
```
1. User visits http://localhost:3001/
2. Middleware checks cookie → Valid token found
3. Middleware allows request
4. Home page checks auth (client-side)
5. User sees home page immediately
```

### Scenario 3: Visiting Login When Authenticated
```
1. User visits http://localhost:3001/login
2. Middleware checks cookie → Valid token found
3. Middleware redirects to /
4. User sees home page (can't access login)
```

### Scenario 4: Session Expired
```
1. User visits http://localhost:3001/admin
2. Middleware checks cookie → Token expired
3. Middleware redirects to /login?from=/admin
4. User logs in again
5. Redirected back to /admin
```

---

## 📝 Testing the Authentication

### 1. **Test Login Flow**
```bash
# Start server
npm run dev

# Visit home page (should redirect to login)
http://localhost:3001/

# Login with default credentials
Email: admin@example.com
Password: admin123

# Should redirect to home page
```

### 2. **Test Protected Routes**
```bash
# Try to access admin without login
http://localhost:3001/admin
# Should redirect to /login?from=/admin

# Login and should redirect back to /admin
```

### 3. **Test Logout**
```bash
# Click logout in sidebar
# Should redirect to /login
# Try to access home page
# Should redirect to /login
```

---

## 🛠️ Configuration

### Environment Variables
```env
# .env
JWT_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Cookie Name
```typescript
// src/lib/auth.ts
export const COOKIE_NAME = 'invoice_token'
```

### Token Expiry
```typescript
// src/lib/auth.ts
export function signToken(payload: Record<string, any>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}
```

---

## 🔧 Customization

### Add More Protected Routes
Edit `src/middleware.ts`:
```typescript
export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/invoices/:path*',
    '/your-new-route/:path*', // Add here
  ],
}
```

### Change Redirect Behavior
Edit `src/middleware.ts`:
```typescript
// Redirect to different page after login
if (!isPublicPath && !isAuthenticated) {
  return NextResponse.redirect(new URL('/custom-login', req.url))
}
```

### Add Role-Based Access
Edit `src/middleware.ts`:
```typescript
const payload = verifyToken(token) as { role: string }
if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
  return NextResponse.redirect(new URL('/unauthorized', req.url))
}
```

---

## ✅ Checklist

- ✅ Middleware protects all routes
- ✅ Login page handles authentication
- ✅ Home page checks auth status
- ✅ Automatic redirects work
- ✅ HTTP-only cookies used
- ✅ JWT tokens verified
- ✅ Loading states shown
- ✅ Error handling implemented
- ✅ TypeScript types defined
- ✅ Production-ready code

---

## 🎉 Result

Your authentication system is now:
- ✅ **Secure** - HTTP-only cookies, JWT verification
- ✅ **User-friendly** - Automatic redirects, loading states
- ✅ **Production-ready** - Error handling, TypeScript
- ✅ **Maintainable** - Clean code, well-documented

**Test it now:**
```bash
npm run dev
# Visit http://localhost:3001
```
