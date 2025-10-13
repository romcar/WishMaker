# 🔑 WebAuthn Types Reference

Complete reference for WebAuthn (Web Authentication) types used for passwordless authentication.

## 🎯 Overview

WebAuthn enables secure, passwordless authentication using biometrics, security keys, or platform authenticators. This document covers all TypeScript types related to WebAuthn implementation.

## 🔐 Core WebAuthn Types

### Authenticator Transport Types
```typescript
type AuthenticatorTransport =
    | "ble"        // Bluetooth Low Energy
    | "hybrid"     // Hybrid transport protocol
    | "internal"   // Platform authenticator (TouchID, FaceID, Windows Hello)
    | "nfc"        // Near Field Communication
    | "usb";       // USB Security Key (YubiKey, etc.)
```

### WebAuthn Credential Storage
```typescript
interface WebAuthnCredential {
    id: number;
    user_id: number;
    credential_id: string; // Base64URL encoded credential ID
    public_key: Buffer; // Raw public key bytes
    counter: bigint; // Signature counter for replay protection
    device_type: "platform" | "cross-platform";
    transports: AuthenticatorTransport[];
    backup_eligible: boolean; // Can be backed up across devices
    backup_state: boolean; // Currently backed up
    attestation_type: "none" | "basic" | "self" | "attca";
    aaguid?: string; // Authenticator Attestation GUID
    device_name?: string; // User-friendly device name
    is_active: boolean;
    created_at: Date;
    last_used_at?: Date;
}
```

## 📝 W3C WebAuthn Specification Types

### Registration Options (Create Credential)
```typescript
interface PublicKeyCredentialCreationOptionsJSON {
    rp: {
        name: string; // Relying Party name (e.g., "WishMaker")
        id?: string;  // Relying Party ID (e.g., "localhost" or "wishmaker.com")
    };
    user: {
        id: string; // Base64URL encoded user identifier
        name: string; // User's username or email
        displayName: string; // User's display name
    };
    challenge: string; // Base64URL encoded random challenge
    pubKeyCredParams: {
        alg: number; // Cryptographic algorithm (-7 for ES256, -257 for RS256)
        type: "public-key";
    }[];
    timeout?: number; // Timeout in milliseconds
    excludeCredentials?: {
        id: string; // Existing credential ID to exclude
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
```

**Usage Example:**
```typescript
const registrationOptions: PublicKeyCredentialCreationOptionsJSON = {
    rp: {
        name: "WishMaker",
        id: "localhost"
    },
    user: {
        id: "dXNlcklkMTIz", // Base64URL("userId123")
        name: "john@example.com",
        displayName: "John Doe"
    },
    challenge: "Y2hhbGxlbmdlMTIz", // Random challenge
    pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" }  // RS256
    ],
    timeout: 60000,
    authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred"
    },
    attestation: "direct"
};
```

### Authentication Options (Get Credential)
```typescript
interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string; // Base64URL encoded challenge
    timeout?: number; // Timeout in milliseconds
    rpId?: string; // Relying Party ID
    allowCredentials?: {
        id: string; // Credential ID to allow
        type: "public-key";
        transports?: AuthenticatorTransport[];
    }[];
    userVerification?: "required" | "preferred" | "discouraged";
}
```

**Usage Example:**
```typescript
const authenticationOptions: PublicKeyCredentialRequestOptionsJSON = {
    challenge: "YXV0aENoYWxsZW5nZQ==", // Random challenge
    timeout: 60000,
    rpId: "localhost",
    allowCredentials: [{
        id: "Y3JlZGVudGlhbElk", // Existing credential ID
        type: "public-key",
        transports: ["internal", "usb"]
    }],
    userVerification: "required"
};
```

## 📥 WebAuthn Response Types

### Registration Response (From Browser)
```typescript
interface RegistrationCredentialJSON {
    id: string; // Base64URL credential ID
    rawId: string; // Base64URL raw credential ID
    response: {
        clientDataJSON: string; // Base64URL client data
        attestationObject: string; // Base64URL attestation object
        transports?: AuthenticatorTransport[]; // Supported transports
    };
    type: "public-key";
    clientExtensionResults?: Record<string, any>;
}
```

### Authentication Response (From Browser)
```typescript
interface AuthenticationCredentialJSON {
    id: string; // Base64URL credential ID
    rawId: string; // Base64URL raw credential ID
    response: {
        authenticatorData: string; // Base64URL authenticator data
        clientDataJSON: string; // Base64URL client data
        signature: string; // Base64URL signature
        userHandle?: string; // Base64URL user handle (optional)
    };
    type: "public-key";
    clientExtensionResults?: Record<string, any>;
}
```

### Generic Credential Response
```typescript
interface PublicKeyCredentialJSON {
    id: string;
    rawId: string;
    response: AuthenticatorResponse;
    type: "public-key";
    clientExtensionResults?: Record<string, any>;
}

interface AuthenticatorResponse {
    clientDataJSON: string;
    authenticatorData?: string; // For authentication
    signature?: string; // For authentication
    userHandle?: string; // For authentication
    attestationObject?: string; // For registration
    transports?: AuthenticatorTransport[]; // For registration
}
```

## 🔄 API Request/Response Types

### WebAuthn Registration Request
```typescript
interface WebAuthnRegistrationRequest {
    userId: number;
    deviceName?: string; // Optional user-friendly name
}
```

### WebAuthn Verification Request
```typescript
interface WebAuthnVerificationRequest {
    credential: AuthenticationCredentialJSON;
    challenge: string; // Original challenge for verification
}
```

### WebAuthn API Responses
```typescript
interface WebAuthnVerificationResponse {
    success: boolean;
    verified: boolean;
    userId?: number;
    credentialId?: string;
    message: string;
}

interface WebAuthnRegistrationResponse {
    success: boolean;
    credentialId?: string;
    message: string;
}
```

## 🗄️ Database Query Types

### WebAuthn Credential Query Result
```typescript
// Database returns some fields differently than the interface
interface WebAuthnCredentialQueryResult extends Omit<WebAuthnCredential, "created_at" | "last_used_at" | "counter"> {
    created_at: string; // Dates come as strings from DB
    last_used_at?: string;
    counter: string; // BigInt comes as string from DB
}
```

## ❌ WebAuthn Error Types

### WebAuthn Error Class
```typescript
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
```

### Common WebAuthn Error Codes
```typescript
type WebAuthnErrorCode =
    | "WEBAUTHN_NOT_SUPPORTED"
    | "INVALID_CHALLENGE"
    | "CREDENTIAL_NOT_FOUND"
    | "VERIFICATION_FAILED"
    | "TIMEOUT_ERROR"
    | "USER_CANCELLED"
    | "INVALID_SIGNATURE"
    | "COUNTER_ERROR"
    | "DEVICE_NOT_TRUSTED";
```

## 🔍 Type Guards & Validation

### WebAuthn Type Guards
```typescript
function isRegistrationCredential(obj: any): obj is RegistrationCredentialJSON {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.rawId === 'string' &&
        obj.response &&
        typeof obj.response.clientDataJSON === 'string' &&
        typeof obj.response.attestationObject === 'string' &&
        obj.type === 'public-key';
}

function isAuthenticationCredential(obj: any): obj is AuthenticationCredentialJSON {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.rawId === 'string' &&
        obj.response &&
        typeof obj.response.authenticatorData === 'string' &&
        typeof obj.response.clientDataJSON === 'string' &&
        typeof obj.response.signature === 'string' &&
        obj.type === 'public-key';
}

function isValidTransport(transport: string): transport is AuthenticatorTransport {
    return ['ble', 'hybrid', 'internal', 'nfc', 'usb'].includes(transport);
}
```

## 📚 Implementation Examples

### WebAuthn Registration Flow
```typescript
class WebAuthnService {
    async startRegistration(userId: number, deviceName?: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
        const response = await fetch('/api/webauthn/register/begin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceName })
        });

        if (!response.ok) {
            throw new WebAuthnError('Registration initiation failed', 'REGISTRATION_INIT_FAILED');
        }

        return response.json();
    }

    async completeRegistration(
        credential: RegistrationCredentialJSON,
        challenge: string
    ): Promise<WebAuthnRegistrationResponse> {
        const response = await fetch('/api/webauthn/register/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential, challenge })
        });

        if (!response.ok) {
            throw new WebAuthnError('Registration completion failed', 'REGISTRATION_COMPLETE_FAILED');
        }

        return response.json();
    }
}
```

### WebAuthn Authentication Flow
```typescript
class WebAuthnAuth {
    async authenticate(email: string): Promise<LoginResponse> {
        try {
            // Get authentication options
            const optionsResponse = await fetch('/api/webauthn/authenticate/begin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const options: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

            // Get credential from browser
            const credential = await navigator.credentials.get({
                publicKey: {
                    ...options,
                    challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0))
                }
            }) as PublicKeyCredential;

            if (!credential) {
                throw new WebAuthnError('No credential returned', 'NO_CREDENTIAL');
            }

            // Convert credential to JSON format
            const credentialJSON: AuthenticationCredentialJSON = {
                id: credential.id,
                rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                response: {
                    authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credential.response.authenticatorData))),
                    clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                    signature: btoa(String.fromCharCode(...new Uint8Array(credential.response.signature))),
                    userHandle: credential.response.userHandle ?
                        btoa(String.fromCharCode(...new Uint8Array(credential.response.userHandle))) : undefined
                },
                type: 'public-key'
            };

            // Verify credential
            const verificationResponse = await fetch('/api/webauthn/authenticate/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: credentialJSON,
                    challenge: options.challenge
                })
            });

            return verificationResponse.json();

        } catch (error) {
            if (error instanceof WebAuthnError) {
                throw error;
            }
            throw new WebAuthnError('WebAuthn authentication failed', 'WEBAUTHN_AUTH_FAILED');
        }
    }
}
```

### React Hook for WebAuthn
```typescript
interface UseWebAuthnReturn {
    register: (deviceName?: string) => Promise<boolean>;
    authenticate: () => Promise<boolean>;
    isSupported: boolean;
    isLoading: boolean;
    error: string | null;
}

function useWebAuthn(): UseWebAuthnReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const isSupported = useMemo(() => {
        return !!(window.navigator && window.navigator.credentials && window.PublicKeyCredential);
    }, []);

    const register = useCallback(async (deviceName?: string): Promise<boolean> => {
        if (!isSupported || !user) {
            throw new WebAuthnError('WebAuthn not supported or user not logged in', 'NOT_SUPPORTED');
        }

        setIsLoading(true);
        setError(null);

        try {
            const webauthnService = new WebAuthnService();
            const options = await webauthnService.startRegistration(user.id, deviceName);

            // Convert challenge and user ID from base64url
            const publicKeyOptions = {
                ...options,
                challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
                user: {
                    ...options.user,
                    id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0))
                }
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions
            }) as PublicKeyCredential;

            if (!credential) {
                throw new WebAuthnError('No credential created', 'NO_CREDENTIAL_CREATED');
            }

            // Convert to JSON format for transmission
            const credentialJSON: RegistrationCredentialJSON = {
                id: credential.id,
                rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                response: {
                    clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                    attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject)))
                },
                type: 'public-key'
            };

            const result = await webauthnService.completeRegistration(credentialJSON, options.challenge);
            return result.success;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'WebAuthn registration failed';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, user]);

    return {
        register,
        authenticate: async () => false, // Implement authentication logic
        isSupported,
        isLoading,
        error
    };
}
```

## 🔐 Security Considerations

### Credential Validation
```typescript
interface CredentialValidationResult {
    isValid: boolean;
    counter: bigint;
    userVerified: boolean;
    backupEligible: boolean;
    backupState: boolean;
    errors: string[];
}

function validateWebAuthnCredential(
    credential: AuthenticationCredentialJSON,
    storedCredential: WebAuthnCredential,
    challenge: string
): CredentialValidationResult {
    const errors: string[] = [];

    // Validate counter (prevent replay attacks)
    const currentCounter = BigInt(/* extract from authenticatorData */);
    if (currentCounter <= storedCredential.counter) {
        errors.push('Invalid signature counter - possible replay attack');
    }

    // Validate origin
    const clientData = JSON.parse(atob(credential.response.clientDataJSON));
    if (clientData.challenge !== challenge) {
        errors.push('Challenge mismatch');
    }

    return {
        isValid: errors.length === 0,
        counter: currentCounter,
        userVerified: true, // Extract from authenticatorData
        backupEligible: true, // Extract from authenticatorData
        backupState: false, // Extract from authenticatorData
        errors
    };
}
```

## 🎫 Related Linear Tickets

- **[ROM-5](https://linear.app/romcar/issue/ROM-5/)** - WebAuthn implementation and security
- **[ROM-6](https://linear.app/romcar/issue/ROM-6/)** - Advanced authentication features

---

**File Locations:**
- Types: `backend/src/types/auth.types.ts`, `frontend/src/types/auth.types.ts`
- Service: `backend/src/services/webauthn.service.ts`
- Components: `frontend/src/components/Login.tsx`, `frontend/src/components/Register.tsx`

**Standards Compliance:**
- [W3C WebAuthn Level 2](https://w3c.github.io/webauthn/)
- [FIDO2 CTAP2](https://fidoalliance.org/specs/fido-v2.0-ps-20190130/)