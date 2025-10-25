// Authentication Types and Interfaces for TypeScript
// This file defines all the types used in the authentication system

// WebAuthn related types
/**
 * AuthenticatorTransport
 *
 * Describes the transport(s) an authenticator can use to communicate with the client.
 *
 * - "ble":   Bluetooth Low Energy — typically used by mobile or external authenticators that connect over BLE.
 * - "hybrid": Hybrid transport — authenticators that may support multiple transport mechanisms (vendor-specific).
 * - "internal": Platform/internal authenticator — built-in authenticators (e.g., device biometrics).
 * - "nfc":   Near Field Communication — used by contactless authenticators (cards, tokens).
 * - "usb":   USB — external authenticators connected over USB (including USB-C / USB-A keys).
 */
export type AuthenticatorTransport =
    | 'ble' // Bluetooth Low Energy
    | 'hybrid'
    | 'internal'
    | 'nfc'
    | 'usb'
    | 'smart-card';

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    display_name?: string;
    first_name?: string | null;
    last_name?: string | null;
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

export interface CreateUserInput {
    username: string;
    email: string;
    password?: string; // Plain text password (will be hashed)
    password_hash?: string; // Hashed password
    display_name?: string;
    first_name?: string | null;
    last_name?: string | null;
    two_factor_enabled?: boolean;
    account_locked_until?: Date;
    failed_login_attempts?: number;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface WebAuthnCredential {
    id: number;
    user_id: number;
    credential_id: string; // Base64URL encoded
    public_key: Buffer; // Raw public key bytes
    counter: bigint; // Signature counter for replay protection
    device_type: 'platform' | 'cross-platform'; // Biometric vs USB key
    transports: AuthenticatorTransport[]; // usb, nfc, ble, internal
    backup_eligible: boolean; // Can be backed up across devices
    backup_state: boolean; // Currently backed up
    attestation_type: 'none' | 'basic' | 'self' | 'attca';
    aaguid?: string; // Authenticator Attestation GUID
    device_name?: string; // User-friendly name
    is_active: boolean;
    created_at: Date;
    last_used_at?: Date;
}

export interface AuthSession {
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

export interface TwoFactorBackup {
    id: number;
    user_id: number;
    totp_secret?: string; // Encrypted TOTP secret
    recovery_codes: string[]; // Array of encrypted recovery codes
    recovery_codes_used: number[]; // Indices of used codes
    created_at: Date;
    updated_at: Date;
}

export interface AuthChallenge {
    id: number;
    challenge: string; // Base64URL encoded challenge
    user_id?: number;
    challenge_type: 'registration' | 'authentication';
    origin: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
}

export interface SecurityEvent {
    id: number;
    user_id?: number;
    event_type: SecurityEventType;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, any>; // Additional event-specific data
    created_at: Date;
}

export type SecurityEventType =
    | 'login_success'
    | 'login_failed'
    | 'login_locked'
    | 'failed_login'
    | 'user_registered'
    | 'password_changed'
    | '2fa_enabled'
    | '2fa_disabled'
    | 'webauthn_registered'
    | 'webauthn_credential_added'
    | 'webauthn_used'
    | 'webauthn_login_success'
    | 'webauthn_login_failed'
    | 'recovery_code_used'
    | 'account_created'
    | 'account_deleted'
    | 'suspicious_activity';

export interface UserPreferences {
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

// WebAuthn specific types based on the W3C WebAuthn specification
export interface PublicKeyCredentialCreationOptionsJSON {
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
    challenge: string; // Base64URL encoded challenge
    timeout?: number;
    rpId?: string;
    allowCredentials?: {
        id: string;
        type: 'public-key';
        transports?: AuthenticatorTransport[];
    }[];
    userVerification?: 'required' | 'preferred' | 'discouraged';
}

// WebAuthn response types (what comes back from the browser)
export interface RegistrationCredentialJSON {
    id: string;
    rawId: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
        transports?: AuthenticatorTransport[];
    };
    type: 'public-key';
    clientExtensionResults?: Record<string, any>;
}

export interface AuthenticationCredentialJSON {
    id: string;
    rawId: string;
    response: {
        authenticatorData: string;
        clientDataJSON: string;
        signature: string;
        userHandle?: string;
    };
    type: 'public-key';
    clientExtensionResults?: Record<string, any>;
}

// JWT Payload structure
export interface JWTPayload {
    sub: string; // User ID
    email: string;
    username: string;
    session_id: string;
    two_factor_verified: boolean;
    iat: number; // Issued at
    exp: number; // Expiration
}

// API Request/Response types
export interface LoginResponse {
    success: boolean;
    require_2fa: boolean;
    challenge?: PublicKeyCredentialRequestOptionsJSON; // WebAuthn challenge for 2FA
    session_token?: string; // Only if 2FA not required
    refresh_token?: string;
    user?: Partial<User>;
    message?: string;
}

export interface RegistrationResponse {
    success: boolean;
    challenge?: PublicKeyCredentialCreationOptionsJSON;
    message?: string;
}

export interface WebAuthnVerificationResponse {
    success: boolean;
    verified: boolean;
    userId?: number;
    credentialId?: string;
    message: string;
}

// Request/Response Types for Controllers
export interface RegisterRequest {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface WebAuthnRegistrationRequest {
    userId: number;
    deviceName?: string;
}

export interface WebAuthnVerificationRequest {
    credential: AuthenticationCredentialJSON;
    challenge: string;
}

export interface TOTPSetupResponse {
    secret: string; // Base32 encoded TOTP secret
    qr_code: string; // Data URL for QR code
    recovery_codes: string[];
}

// Database query result types
export interface UserQueryResult
    extends Omit<
        User,
        'created_at' | 'updated_at' | 'last_login_at' | 'account_locked_until'
    > {
    created_at: string;
    updated_at: string;
    last_login_at?: string;
    account_locked_until?: string;
}

export interface WebAuthnCredentialQueryResult
    extends Omit<
        WebAuthnCredential,
        'created_at' | 'last_used_at' | 'counter'
    > {
    created_at: string;
    last_used_at?: string;
    counter: string; // BigInt comes as string from DB
}

// Error types for better error handling
export class AuthenticationError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 401
    ) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class ValidationError extends Error {
    constructor(
        message: string,
        public field?: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class WebAuthnError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'WebAuthnError';
    }
}
