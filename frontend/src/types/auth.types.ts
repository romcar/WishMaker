// TODO: ENHANCEMENT - Expand User interface and auth types
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-8/implement-complete-authentication-system
// 1. Add user profile fields (avatar, bio, preferences, timezone)
// 2. Add role-based access control fields (roles, permissions)
// 3. Add security fields (login_attempts, locked_until, etc.)
// 4. Add social provider linking fields
// 5. Add subscription/billing related fields
// 6. Add user preference settings (theme, notifications, etc.)
// 7. Add privacy settings and data sharing preferences
// 8. Add account verification and compliance fields
// Authentication types for the frontend
export interface User {
    id: string; // User identifier
    email: string;
    firstName: string;
    lastName: string;
    two_factor_enabled?: boolean;
    email_verified?: boolean;
    created_at: string;
    last_login_at?: string;
    avatar_url?: string;
}

// Profile interface (separate from User for database storage)
export interface Profile {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

// TODO: IMPROVEMENT - Enhance request interfaces
// 1. Add optional "remember me" field to LoginRequest
// 2. Add CAPTCHA fields for bot protection
// 3. Add device fingerprinting fields
// 4. Add referral and marketing consent fields to RegisterRequest
// 5. Add terms of service and privacy policy acceptance
// 6. Add optional phone number and additional contact methods
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}

export interface LoginResponse {
    success: boolean;
    require_2fa: boolean;
    challenge?: PublicKeyCredentialRequestOptionsJSON; // WebAuthn challenge for 2FA
    session_token?: string; // Only if 2FA not required
    refresh_token?: string;
    user?: User;
    message?: string;
}

export interface RegistrationResponse {
    success: boolean;
    challenge?: PublicKeyCredentialCreationOptionsJSON;
    webauthn_options?: PublicKeyCredentialCreationOptionsJSON;
    user?: User;
    message?: string;
}

export interface AuthSession {
    token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
}

// WebAuthn types
export interface PublicKeyCredentialCreationOptionsJSON {
    rp: {
        name: string;
        id?: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    challenge: string;
    pubKeyCredParams: {
        alg: number;
        type: 'public-key';
    }[];
    timeout?: number;
    excludeCredentials?: {
        id: string;
        type: 'public-key';
        transports?: AuthenticatorTransport[];
    }[];
    authenticatorSelection?: {
        authenticatorAttachment?: 'platform' | 'cross-platform';
        userVerification?: 'required' | 'preferred' | 'discouraged';
        residentKey?: 'discouraged' | 'preferred' | 'required';
    };
    attestation?: 'none' | 'indirect' | 'direct';
}

export interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string;
    timeout?: number;
    rpId?: string;
    allowCredentials?: {
        id: string;
        type: 'public-key';
        transports?: AuthenticatorTransport[];
    }[];
    userVerification?: 'required' | 'preferred' | 'discouraged';
}

export interface AuthenticatorResponse {
    clientDataJSON: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string;
    attestationObject?: string;
    transports?: AuthenticatorTransport[];
}

export interface PublicKeyCredentialJSON {
    id: string;
    rawId: string;
    response: AuthenticatorResponse;
    type: 'public-key';
    clientExtensionResults?: Record<string, any>;
}

export type AuthenticatorTransport =
    | 'ble'
    | 'hybrid'
    | 'internal'
    | 'nfc'
    | 'usb';

export interface WebAuthnRegistrationRequest {
    userId: string | number; // Support both string and number backend types
    deviceName?: string;
}

export interface WebAuthnVerificationRequest {
    credential: PublicKeyCredentialJSON;
    challenge: string;
}

export interface AuthError {
    message: string;
    code?: string;
    statusCode?: number;
}

// Authentication state
export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    register: (userData: RegisterRequest) => Promise<RegistrationResponse>;
    logout: () => void;
    verifyWebAuthn: (
        credential: PublicKeyCredentialJSON,
        challenge: string
    ) => Promise<boolean>;
    setupWebAuthn: (
        deviceName?: string
    ) => Promise<PublicKeyCredentialCreationOptionsJSON>;
    clearError: () => void;
    refreshSession: () => Promise<boolean>;
}
