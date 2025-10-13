# 🔐 Authentication Types Reference

Complete reference for all authentication-related TypeScript types and interfaces.

## 🎯 Core Authentication Interfaces

### User Entity Types

#### Frontend User Interface
```typescript
interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    two_factor_enabled: boolean;
    email_verified: boolean;
    created_at: string;
    last_login_at?: string;
}
```

#### Backend User Interface (Extended)
```typescript
interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    display_name?: string;
    is_active: boolean;
    email_verified: boolean;
    two_factor_enabled: boolean;
    backup_codes_generated: boolean;
    failed_login_attempts: number;
    account_locked_until?: Date;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
}
```

### Authentication Request Types

#### Login Request
```typescript
interface LoginRequest {
    email: string;
    password: string;
}
```

#### Registration Request
```typescript
interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}
```

### Authentication Response Types

#### Login Response
```typescript
interface LoginResponse {
    success: boolean;
    require_2fa: boolean;
    challenge?: PublicKeyCredentialRequestOptionsJSON;
    session_token?: string; // Only if 2FA not required
    refresh_token?: string;
    user?: User;
    message?: string;
}
```

#### Registration Response
```typescript
interface RegistrationResponse {
    success: boolean;
    challenge?: PublicKeyCredentialCreationOptionsJSON;
    webauthn_options?: PublicKeyCredentialCreationOptionsJSON;
    user?: User;
    message?: string;
}
```

## 🔑 Session Management Types

### Authentication Session
```typescript
interface AuthSession {
    id: number;
    user_id: number;
    session_token: string; // JWT token ID or session identifier
    refresh_token_hash?: string; // Hashed refresh token
    device_fingerprint?: string; // Browser/device identifier
    ip_address?: string;
    user_agent?: string;
    is_active: boolean;
    expires_at: Date;
    created_at: Date;
    last_activity_at: Date;
}
```

### JWT Payload Structure
```typescript
interface JWTPayload {
    sub: string; // User ID
    email: string;
    username: string;
    session_id: string;
    two_factor_verified: boolean;
    iat: number; // Issued at
    exp: number; // Expiration
}
```

### Authentication State Management
```typescript
interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    register: (userData: RegisterRequest) => Promise<RegistrationResponse>;
    logout: () => void;
    verifyWebAuthn: (credential: PublicKeyCredentialJSON, challenge: string) => Promise<boolean>;
    setupWebAuthn: (deviceName?: string) => Promise<PublicKeyCredentialCreationOptionsJSON>;
    clearError: () => void;
    refreshSession: () => Promise<boolean>;
}
```

## 🛡️ Security & Audit Types

### Security Event Tracking
```typescript
type SecurityEventType =
    | "login_success"
    | "login_failed"
    | "login_locked"
    | "user_registered"
    | "password_changed"
    | "2fa_enabled"
    | "2fa_disabled"
    | "webauthn_registered"
    | "webauthn_used"
    | "recovery_code_used"
    | "account_created"
    | "account_deleted"
    | "suspicious_activity";

interface SecurityEvent {
    id: number;
    user_id?: number;
    event_type: SecurityEventType;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, any>;
    created_at: Date;
}
```

### User Preferences & Settings
```typescript
interface UserPreferences {
    id: number;
    user_id: number;
    require_biometric_2fa: boolean;
    allow_fallback_methods: boolean;
    session_timeout_minutes: number;
    require_fresh_auth_minutes: number; // Re-auth for sensitive operations
    email_notifications: boolean;
    security_alerts: boolean;
    created_at: Date;
    updated_at: Date;
}
```

## 🔄 Two-Factor Authentication Types

### TOTP & Backup Codes
```typescript
interface TwoFactorBackup {
    id: number;
    user_id: number;
    totp_secret?: string; // Encrypted TOTP secret
    recovery_codes: string[]; // Array of encrypted recovery codes
    recovery_codes_used: number[]; // Indices of used codes
    created_at: Date;
    updated_at: Date;
}

interface TOTPSetupResponse {
    secret: string; // Base32 encoded TOTP secret
    qr_code: string; // Data URL for QR code
    recovery_codes: string[];
}
```

### Authentication Challenges
```typescript
interface AuthChallenge {
    id: number;
    challenge: string; // Base64URL encoded challenge
    user_id?: number;
    challenge_type: "registration" | "authentication";
    origin: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
}
```

## ❌ Authentication Error Types

### Custom Error Classes
```typescript
class AuthenticationError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 401
    ) {
        super(message);
        this.name = "AuthenticationError";
    }
}

class ValidationError extends Error {
    constructor(
        message: string,
        public field?: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = "ValidationError";
    }
}

interface AuthError {
    message: string;
    code?: string;
    statusCode?: number;
}
```

## 🗄️ Database Input Types

### User Creation
```typescript
interface CreateUserInput {
    username: string;
    email: string;
    password?: string; // Plain text password (will be hashed)
    password_hash?: string; // Hashed password
    display_name?: string;
    two_factor_enabled?: boolean;
    account_locked_until?: Date;
    failed_login_attempts?: number;
}
```

### Query Result Types
```typescript
// Database returns dates as strings, not Date objects
interface UserQueryResult extends Omit<User, "created_at" | "updated_at" | "last_login_at" | "account_locked_until"> {
    created_at: string;
    updated_at: string;
    last_login_at?: string;
    account_locked_until?: string;
}
```

## 🔍 Type Guards & Validation

### Runtime Type Checking
```typescript
function isUser(obj: any): obj is User {
    return obj &&
        typeof obj.id === 'number' &&
        typeof obj.email === 'string' &&
        typeof obj.firstName === 'string' &&
        typeof obj.lastName === 'string' &&
        typeof obj.two_factor_enabled === 'boolean' &&
        typeof obj.email_verified === 'boolean';
}

function isLoginRequest(obj: any): obj is LoginRequest {
    return obj &&
        typeof obj.email === 'string' &&
        typeof obj.password === 'string' &&
        obj.email.includes('@'); // Basic email validation
}

function isValidAuthResponse(obj: any): obj is LoginResponse {
    return obj &&
        typeof obj.success === 'boolean' &&
        (!obj.user || isUser(obj.user));
}
```

## 📚 Usage Examples

### Authentication Flow Implementation
```typescript
// Login implementation
const handleLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const loginResponse: LoginResponse = await response.json();

        if (loginResponse.success && loginResponse.session_token) {
            // Store authentication state
            setAuthState({
                user: loginResponse.user!,
                token: loginResponse.session_token,
                refreshToken: loginResponse.refresh_token!,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
        }

        return loginResponse;
    } catch (error) {
        throw new AuthenticationError('Login failed', 'LOGIN_ERROR');
    }
};
```

### Type-Safe Context Usage
```typescript
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
    });

    const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
        return handleLogin(credentials);
    }, []);

    const contextValue: AuthContextType = {
        ...authState,
        login,
        register,
        logout,
        verifyWebAuthn,
        setupWebAuthn,
        clearError,
        refreshSession
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
```

## 🎫 Related Linear Tickets

- **[ROM-5](https://linear.app/romcar/issue/ROM-5/)** - Security vulnerabilities and authentication implementation
- **[ROM-6](https://linear.app/romcar/issue/ROM-6/)** - User management and advanced security features

---

**File Locations:**
- Frontend: `frontend/src/types/auth.types.ts`
- Backend: `backend/src/types/auth.types.ts`
- Context: `frontend/src/contexts/AuthContext.tsx`