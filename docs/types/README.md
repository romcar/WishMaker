# 🔷 TypeScript Types Documentation

This document provides comprehensive documentation for all TypeScript types, interfaces, and type definitions used throughout the WishMaker application.

## 📋 Table of Contents

### 📚 Detailed Documentation
For comprehensive type documentation, see the dedicated reference files:

- **[🔐 Authentication Types](./authentication-types.md)** - Complete authentication, user management, and security types
- **[🎯 Wish Types](./wish-types.md)** - Wish management, categories, priorities, and filtering types
- **[🔑 WebAuthn Types](./webauthn-types.md)** - Passwordless authentication and security key types
- **[🎨 Component Types](./component-types.md)** - React component props, state, and event handler types
- **[🌐 API Types](./api-types.md)** - HTTP requests, responses, and API client types

### 📖 Quick Reference
- [Core Application Types](#core-application-types)
- [Authentication Types](#authentication-types)
- [Wish Management Types](#wish-management-types)
- [Component Props Types](#component-props-types)
- [WebAuthn Types](#webauthn-types)
- [API Response Types](#api-response-types)
- [Error Types](#error-types)
- [Database Types](#database-types)
- [Utility Types](#utility-types)

## 🎯 Core Application Types

### User Entity

The main user entity used across the application:

```typescript
// Frontend User Interface
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

// Backend User Interface (Extended)
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

**Usage Example:**
```typescript
// Frontend usage
const currentUser: User = {
    id: 1,
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    two_factor_enabled: true,
    email_verified: true,
    created_at: "2025-10-13T10:00:00Z"
};

// Backend usage with additional security fields
const backendUser: User = {
    // ... frontend fields plus:
    username: "johndoe",
    password_hash: "$2b$12$...",
    is_active: true,
    backup_codes_generated: false,
    failed_login_attempts: 0
};
```

### Wish Entity

The core wish data structure:

```typescript
// Frontend Wish Interface
interface Wish {
    id: number;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
}

// Backend Wish Interface
interface Wish {
    id: number;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    status: 'pending' | 'fulfilled' | 'cancelled';
}
```

**Status Values:**
- `'pending'` - Wish is active and unfulfilled
- `'fulfilled'` - Wish has been completed/achieved
- `'cancelled'` - Wish has been abandoned/cancelled

**Usage Example:**
```typescript
const myWish: Wish = {
    id: 1,
    title: "Learn TypeScript",
    description: "Complete a comprehensive TypeScript course",
    created_at: "2025-10-13T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z",
    status: 'pending'
};
```

## 🔐 Authentication Types

### Login & Registration

```typescript
// Login Request
interface LoginRequest {
    email: string;
    password: string;
}

// Registration Request
interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}

// Login Response
interface LoginResponse {
    success: boolean;
    require_2fa: boolean;
    challenge?: PublicKeyCredentialRequestOptionsJSON;
    session_token?: string;
    refresh_token?: string;
    user?: User;
    message?: string;
}

// Registration Response
interface RegistrationResponse {
    success: boolean;
    challenge?: PublicKeyCredentialCreationOptionsJSON;
    webauthn_options?: PublicKeyCredentialCreationOptionsJSON;
    user?: User;
    message?: string;
}
```

**Usage Example:**
```typescript
// Login flow
const loginData: LoginRequest = {
    email: "user@example.com",
    password: "securePassword123"
};

const loginResponse: LoginResponse = await authService.login(loginData);
if (loginResponse.success && !loginResponse.require_2fa) {
    // Store tokens and redirect
    localStorage.setItem('token', loginResponse.session_token!);
}
```

### Authentication State

```typescript
// Authentication Context State
interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Authentication Context Type
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

### Session Management

```typescript
// Authentication Session
interface AuthSession {
    id: number;
    user_id: number;
    session_token: string;
    refresh_token_hash?: string;
    device_fingerprint?: string;
    ip_address?: string;
    user_agent?: string;
    is_active: boolean;
    expires_at: Date;
    created_at: Date;
    last_activity_at: Date;
}

// JWT Payload
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

## 🎯 Wish Management Types

### CRUD Operations

```typescript
// Create Wish Input
interface CreateWishInput {
    title: string;
    description?: string;
}

// Update Wish Input
interface UpdateWishInput {
    title?: string;
    description?: string;
    status?: 'pending' | 'fulfilled' | 'cancelled';
}
```

**Usage Example:**
```typescript
// Creating a new wish
const newWish: CreateWishInput = {
    title: "Travel to Japan",
    description: "Visit Tokyo and experience the culture"
};

// Updating an existing wish
const wishUpdate: UpdateWishInput = {
    status: 'fulfilled',
    description: "Amazing trip! Visited Tokyo, Kyoto, and Osaka."
};
```

### Future Enhancement Types (Planned)

These types are documented for future implementation based on TODO comments:

```typescript
// Wish Filtering (Planned - ROM-7)
interface WishFilter {
    status?: 'pending' | 'fulfilled' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    userId?: number;
}

// Wish Sorting (Planned - ROM-7)
interface WishSort {
    field: 'created_at' | 'updated_at' | 'title' | 'priority' | 'target_date';
    direction: 'asc' | 'desc';
}

// Paginated Response (Planned - ROM-8)
interface PaginatedWishResponse {
    wishes: Wish[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Enhanced Wish (Future Implementation)
interface EnhancedWish extends Wish {
    user_id: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    categories: string[];
    target_date?: Date;
    progress_percentage: number; // 0-100
    privacy: 'private' | 'friends' | 'public';
    attachments: string[]; // File URLs
    cost_estimation?: number;
    location?: string;
    share_token?: string;
}
```

## 🎨 Component Props Types

### React Component Interfaces

```typescript
// Protected Route Props
interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

// Wish Form Props
interface WishFormProps {
    onSubmit: (wish: CreateWishInput) => void;
}

// Wish List Props
interface WishListProps {
    wishes: Wish[];
    onEdit?: (id: number, updates: UpdateWishInput) => void;
    onDelete?: (id: number) => void;
    loading?: boolean;
}

// Authentication Modal Props
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

// Login Component Props
interface LoginProps {
    onSuccess?: (user: User) => void;
    onError?: (error: string) => void;
    onSwitchToRegister?: () => void;
}

// Register Component Props
interface RegisterProps {
    onSuccess?: (user: User) => void;
    onError?: (error: string) => void;
    onSwitchToLogin?: () => void;
}

// Auth Provider Props
interface AuthProviderProps {
    children: React.ReactNode;
}
```

**Usage Example:**
```typescript
// Using component props
const WishForm: React.FC<WishFormProps> = ({ onSubmit }) => {
    const handleSubmit = (wishData: CreateWishInput) => {
        onSubmit(wishData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form implementation */}
        </form>
    );
};
```

## 🔑 WebAuthn Types

### WebAuthn Credential Management

```typescript
// WebAuthn Credential (Backend)
interface WebAuthnCredential {
    id: number;
    user_id: number;
    credential_id: string; // Base64URL encoded
    public_key: Buffer; // Raw public key bytes
    counter: bigint; // Signature counter
    device_type: "platform" | "cross-platform";
    transports: AuthenticatorTransport[];
    backup_eligible: boolean;
    backup_state: boolean;
    attestation_type: "none" | "basic" | "self" | "attca";
    aaguid?: string;
    device_name?: string;
    is_active: boolean;
    created_at: Date;
    last_used_at?: Date;
}

// Authenticator Transport Types
type AuthenticatorTransport =
    | "ble"        // Bluetooth Low Energy
    | "hybrid"     // Hybrid transport
    | "internal"   // Platform authenticator (TouchID, FaceID)
    | "nfc"        // Near Field Communication
    | "usb";       // USB Security Key
```

### WebAuthn API Types

```typescript
// Registration Options (W3C Standard)
interface PublicKeyCredentialCreationOptionsJSON {
    rp: {
        name: string;
        id?: string;
    };
    user: {
        id: string; // Base64URL encoded user ID
        name: string;
        displayName: string;
    };
    challenge: string; // Base64URL encoded challenge
    pubKeyCredParams: {
        alg: number; // Cryptographic algorithm
        type: "public-key";
    }[];
    timeout?: number;
    excludeCredentials?: {
        id: string;
        type: "public-key";
        transports?: AuthenticatorTransport[];
    }[];
    authenticatorSelection?: {
        authenticatorAttachment?: "platform" | "cross-platform";
        userVerification?: "required" | "preferred" | "discouraged";
        residentKey?: "discouraged" | "preferred" | "required";
    };
    attestation?: "none" | "indirect" | "direct";
}

// Authentication Options
interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string;
    timeout?: number;
    rpId?: string;
    allowCredentials?: {
        id: string;
        type: "public-key";
        transports?: AuthenticatorTransport[];
    }[];
    userVerification?: "required" | "preferred" | "discouraged";
}
```

### WebAuthn Response Types

```typescript
// Registration Response
interface RegistrationCredentialJSON {
    id: string;
    rawId: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
        transports?: AuthenticatorTransport[];
    };
    type: "public-key";
    clientExtensionResults?: Record<string, any>;
}

// Authentication Response
interface AuthenticationCredentialJSON {
    id: string;
    rawId: string;
    response: {
        authenticatorData: string;
        clientDataJSON: string;
        signature: string;
        userHandle?: string;
    };
    type: "public-key";
    clientExtensionResults?: Record<string, any>;
}

// Generic Credential Response
interface PublicKeyCredentialJSON {
    id: string;
    rawId: string;
    response: AuthenticatorResponse;
    type: "public-key";
    clientExtensionResults?: Record<string, any>;
}

// Authenticator Response
interface AuthenticatorResponse {
    clientDataJSON: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string;
    attestationObject?: string;
    transports?: AuthenticatorTransport[];
}
```

## 📡 API Response Types

### Standard API Responses

```typescript
// Generic API Response
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>; // Validation errors
}

// WebAuthn Verification Response
interface WebAuthnVerificationResponse {
    success: boolean;
    verified: boolean;
    userId?: number;
    credentialId?: string;
    message: string;
}

// TOTP Setup Response
interface TOTPSetupResponse {
    secret: string; // Base32 encoded TOTP secret
    qr_code: string; // Data URL for QR code
    recovery_codes: string[];
}
```

## ❌ Error Types

### Custom Error Classes

```typescript
// Authentication Error
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

// Validation Error
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

// WebAuthn Error
class WebAuthnError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = "WebAuthnError";
    }
}

// Generic Auth Error Interface
interface AuthError {
    message: string;
    code?: string;
    statusCode?: number;
}
```

## 🗄️ Database Types

### Query Result Types

Database queries return slightly different types due to serialization:

```typescript
// User Query Result (from database)
interface UserQueryResult extends Omit<User, "created_at" | "updated_at" | "last_login_at" | "account_locked_until"> {
    created_at: string; // Dates come as strings from DB
    updated_at: string;
    last_login_at?: string;
    account_locked_until?: string;
}

// WebAuthn Credential Query Result
interface WebAuthnCredentialQueryResult extends Omit<WebAuthnCredential, "created_at" | "last_used_at" | "counter"> {
    created_at: string;
    last_used_at?: string;
    counter: string; // BigInt comes as string from DB
}
```

### Database Input Types

```typescript
// User Creation Input
interface CreateUserInput {
    username: string;
    email: string;
    password?: string; // Plain text password (will be hashed)
    password_hash?: string; // Pre-hashed password
    display_name?: string;
    two_factor_enabled?: boolean;
    account_locked_until?: Date;
    failed_login_attempts?: number;
}
```

## 🛠️ Utility Types

### Security & Audit Types

```typescript
// Security Event Types
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

// Security Event
interface SecurityEvent {
    id: number;
    user_id?: number;
    event_type: SecurityEventType;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, any>;
    created_at: Date;
}

// User Preferences
interface UserPreferences {
    id: number;
    user_id: number;
    require_biometric_2fa: boolean;
    allow_fallback_methods: boolean;
    session_timeout_minutes: number;
    require_fresh_auth_minutes: number;
    email_notifications: boolean;
    security_alerts: boolean;
    created_at: Date;
    updated_at: Date;
}
```

### Two-Factor Authentication

```typescript
// Two-Factor Backup Codes
interface TwoFactorBackup {
    id: number;
    user_id: number;
    totp_secret?: string; // Encrypted TOTP secret
    recovery_codes: string[]; // Encrypted recovery codes
    recovery_codes_used: number[]; // Used code indices
    created_at: Date;
    updated_at: Date;
}

// Authentication Challenge
interface AuthChallenge {
    id: number;
    challenge: string; // Base64URL encoded
    user_id?: number;
    challenge_type: "registration" | "authentication";
    origin: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
}
```

## 🔄 Type Guards & Validation

### Runtime Type Checking

```typescript
// Type guard for User objects
function isUser(obj: any): obj is User {
    return obj &&
        typeof obj.id === 'number' &&
        typeof obj.email === 'string' &&
        typeof obj.firstName === 'string' &&
        typeof obj.lastName === 'string';
}

// Type guard for Wish objects
function isWish(obj: any): obj is Wish {
    return obj &&
        typeof obj.id === 'number' &&
        typeof obj.title === 'string' &&
        ['pending', 'fulfilled', 'cancelled'].includes(obj.status);
}

// Usage example
function processUserData(data: unknown): User | null {
    if (isUser(data)) {
        return data; // TypeScript knows this is User type
    }
    return null;
}
```

## 📝 Type Usage Best Practices

### 1. Import Organization
```typescript
// Group imports by category
import type { User, AuthState } from '../types/auth.types';
import type { Wish, CreateWishInput } from '../types/wish.types';
import type { ApiResponse } from '../types/api.types';
```

### 2. Consistent Naming
- Use `PascalCase` for interfaces and types
- Use `camelCase` for properties
- Use descriptive suffixes: `Props`, `Input`, `Response`, `Error`

### 3. Optional vs Required Properties
```typescript
// Clear distinction between required and optional fields
interface CreateWishInput {
    title: string;        // Required
    description?: string; // Optional
}
```

### 4. Union Types for Enums
```typescript
// Use union types instead of enums for better tree-shaking
type WishStatus = 'pending' | 'fulfilled' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
```

## 🎫 Related Linear Tickets

- **[ROM-5](https://linear.app/romcar/issue/ROM-5/)** - Security types and authentication interfaces
- **[ROM-6](https://linear.app/romcar/issue/ROM-6/)** - User management and advanced auth types
- **[ROM-7](https://linear.app/romcar/issue/ROM-7/)** - Frontend component types and wish enhancements
- **[ROM-8](https://linear.app/romcar/issue/ROM-8/)** - Database types and performance optimization
- **[ROM-9](https://linear.app/romcar/issue/ROM-9/)** - API types and developer experience
- **[ROM-10](https://linear.app/romcar/issue/ROM-10/)** - Testing types and validation

## 📚 References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WebAuthn API Specification](https://w3c.github.io/webauthn/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Last Updated**: October 13, 2025
**Total Types Documented**: 50+ interfaces and types
**Coverage**: Authentication, Wishes, Components, WebAuthn, Database, Errors