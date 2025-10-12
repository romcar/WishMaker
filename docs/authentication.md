# 🔐 Authentication System Documentation

This document provides comprehensive information about the authentication system implemented in the WishMaker application.

## 🎯 Overview

The WishMaker authentication system provides secure user registration, login, and session management with support for:

- **JWT-based authentication** with session and refresh tokens
- **WebAuthn passwordless authentication**
- **Multi-Factor Authentication (MFA)** with TOTP
- **Protected routes** with authentication context
- **Comprehensive security measures** and rate limiting

## 🏗️ System Architecture

### Frontend Components

```
src/
├── components/
│   ├── Login.tsx          # Login form component
│   ├── Register.tsx       # User registration component
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── services/
│   └── auth.service.ts    # Authentication API calls
└── types/
    └── auth.types.ts      # TypeScript definitions
```

### Backend Structure

```
src/
├── controllers/
│   └── auth.controller.ts # Authentication endpoints
├── services/
│   └── webauthn.service.ts # WebAuthn implementation
├── models/
│   └── auth.models.ts     # Data models and validation
├── routes/
│   └── auth.routes.ts     # Authentication routing
└── types/
    └── auth.types.ts      # Backend type definitions
```

## 🔑 Authentication Flow

### 1. User Registration

```typescript
POST /auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. User Login

```typescript
POST /auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "Login successful",
  "session_token": "jwt_session_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 3. Token Refresh

```typescript
POST /auth/refresh
{
  "refresh_token": "jwt_refresh_token"
}
```

## 🛡️ Security Features

### Password Security
- **bcrypt hashing** with salt rounds for password storage
- **Password validation** with minimum requirements
- **Rate limiting** on authentication endpoints

### JWT Implementation
- **Session tokens** with short expiration (1 hour)
- **Refresh tokens** with longer expiration (7 days)
- **Token rotation** on refresh for enhanced security
- **Secure HTTP-only cookies** (production recommendation)

### WebAuthn Support
- **Passwordless authentication** using biometrics or security keys
- **FIDO2 compliance** for cross-platform compatibility
- **Challenge-response** authentication flow

### Multi-Factor Authentication (MFA)
- **TOTP-based** second factor authentication
- **QR code generation** for authenticator app setup
- **Backup codes** for account recovery

## 🔧 Implementation Details

### Frontend Authentication Context

```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication methods
  const login = async (email: string, password: string) => { ... };
  const logout = () => { ... };
  const register = async (userData: RegisterData) => { ... };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Route Implementation

```typescript
// ProtectedRoute.tsx
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Backend Authentication Middleware

```typescript
// auth.middleware.ts
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### WebAuthn Credentials Table
```sql
CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Usage Examples

### Frontend Usage

```tsx
// Login Component
const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect handled by AuthContext
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        required 
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Backend API Usage

```typescript
// Protected route example
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 🔍 Troubleshooting

### Common Issues

1. **Token Expiration**: Implement automatic token refresh in frontend
2. **CORS Issues**: Ensure proper CORS configuration for authentication endpoints
3. **WebAuthn Support**: Check browser compatibility and HTTPS requirements
4. **Rate Limiting**: Handle rate limit responses gracefully

### Debugging

```typescript
// Enable debug logging
const DEBUG_AUTH = process.env.NODE_ENV === 'development';

if (DEBUG_AUTH) {
  console.log('Auth request:', { email, timestamp: new Date() });
}
```

## 🎫 Related Linear Tickets

- **[ROM-5](https://linear.app/romcar/issue/ROM-5/)** - Security vulnerabilities and authentication fixes
- **[ROM-6](https://linear.app/romcar/issue/ROM-6/)** - Authentication features and user management enhancements

## 📝 TODO Items

### High Priority
- [ ] Implement password reset functionality
- [ ] Add email verification for new registrations  
- [ ] Enhance MFA with backup codes
- [ ] Implement session management dashboard

### Medium Priority
- [ ] Add OAuth integration (Google, GitHub)
- [ ] Implement remember me functionality
- [ ] Add audit logging for authentication events
- [ ] Create admin user management interface

### Low Priority  
- [ ] Add biometric authentication options
- [ ] Implement single sign-on (SSO)
- [ ] Add device management for users
- [ ] Create authentication analytics dashboard

---

**Last Updated**: October 12, 2025  
**Related PRs**: #7 - Comprehensive Authentication System  
**Status**: ✅ Implemented and Deployed