import axios, { AxiosResponse } from "axios";
import {
    AuthSession,
    LoginRequest,
    LoginResponse,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegisterRequest,
    RegistrationResponse,
    User,
    WebAuthnRegistrationRequest,
} from "../types/auth.types";

const API_BASE_URL = `${
    process.env.REACT_APP_API_URL || "http://localhost:8000"
}/api/auth`;

// Create dedicated axios instance for auth
const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// TODO: SECURITY ENHANCEMENT - Consider secure token storage
// Current localStorage approach vulnerable to XSS attacks
// Options: 1) HTTPOnly cookies with SameSite=Strict, 2) Secure memory storage
// 3) IndexedDB with encryption, 4) Service worker for token management
class TokenManager {
    private static TOKEN_KEY = "wishmaker_token";
    private static REFRESH_TOKEN_KEY = "wishmaker_refresh_token";
    private static USER_KEY = "wishmaker_user";

    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    static setRefreshToken(refreshToken: string): void {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    static getUser(): User | null {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    static setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static clearTokens(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    static isTokenExpired(token: string): boolean {
        try {
            // TODO: ENHANCEMENT - Add token validation improvements
            // 1) Verify JWT signature locally if public key available
            // 2) Add buffer time (e.g., refresh 5 minutes before expiry)
            // 3) Validate token structure (header.payload.signature)
            // 4) Add issuer (iss) and audience (aud) validation
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            // TODO: IMPROVEMENT - Log token parsing errors for debugging
            // Consider different error handling for malformed vs expired tokens
            return true;
        }
    }
}

// WebAuthn utility functions
class WebAuthnUtils {
    /**
     * Convert base64url to ArrayBuffer
     */
    static base64urlToBuffer(base64url: string): ArrayBuffer {
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Convert ArrayBuffer to base64url
     */
    static bufferToBase64url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    }

    /**
     * Convert JSON options to WebAuthn PublicKeyCredentialCreationOptions
     */
    static createOptionsFromJSON(
        optionsJSON: PublicKeyCredentialCreationOptionsJSON
    ): PublicKeyCredentialCreationOptions {
        return {
            ...optionsJSON,
            challenge: this.base64urlToBuffer(optionsJSON.challenge),
            user: {
                ...optionsJSON.user,
                id: this.base64urlToBuffer(optionsJSON.user.id),
            },
            excludeCredentials: optionsJSON.excludeCredentials?.map((cred) => ({
                ...cred,
                id: this.base64urlToBuffer(cred.id),
            })),
        };
    }

    /**
     * Convert JSON options to WebAuthn PublicKeyCredentialRequestOptions
     */
    static requestOptionsFromJSON(
        optionsJSON: PublicKeyCredentialRequestOptionsJSON
    ): PublicKeyCredentialRequestOptions {
        return {
            ...optionsJSON,
            challenge: this.base64urlToBuffer(optionsJSON.challenge),
            allowCredentials: optionsJSON.allowCredentials?.map((cred) => ({
                ...cred,
                id: this.base64urlToBuffer(cred.id),
            })),
        };
    }

    /**
     * Convert WebAuthn credential to JSON format
     */
    static credentialToJSON(
        credential: PublicKeyCredential
    ): PublicKeyCredentialJSON {
        const response = credential.response as
            | AuthenticatorAttestationResponse
            | AuthenticatorAssertionResponse;

        let responseData: any = {
            clientDataJSON: this.bufferToBase64url(response.clientDataJSON),
        };

        if ("attestationObject" in response) {
            // Registration response
            responseData.attestationObject = this.bufferToBase64url(
                response.attestationObject
            );
            if (response.getTransports) {
                responseData.transports = response.getTransports();
            }
        } else {
            // Authentication response
            responseData.authenticatorData = this.bufferToBase64url(
                response.authenticatorData
            );
            responseData.signature = this.bufferToBase64url(response.signature);
            if (response.userHandle) {
                responseData.userHandle = this.bufferToBase64url(
                    response.userHandle
                );
            }
        }

        return {
            id: credential.id,
            rawId: this.bufferToBase64url(credential.rawId),
            response: responseData,
            type: credential.type as "public-key",
            clientExtensionResults: credential.getClientExtensionResults(),
        };
    }
}

// Authentication service
export class AuthService {
    /**
     * Register a new user
     */
    static async register(
        userData: RegisterRequest
    ): Promise<RegistrationResponse> {
        try {
            const response: AxiosResponse<RegistrationResponse> =
                await authApi.post("/register", userData);

            if (response.data.success && response.data.user) {
                TokenManager.setUser(response.data.user);
            }

            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || "Registration failed"
            );
        }
    }

    /**
     * Login with email and password
     */
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response: AxiosResponse<LoginResponse> = await authApi.post(
                "/login",
                credentials
            );

            const data = response.data;

            // If 2FA is not required and we have session data
            if (
                data.success &&
                !data.require_2fa &&
                data.session_token &&
                data.user
            ) {
                TokenManager.setToken(data.session_token);
                if (data.refresh_token) {
                    TokenManager.setRefreshToken(data.refresh_token);
                }
                TokenManager.setUser(data.user);
            }

            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
    }

    /**
     * Initiate WebAuthn registration
     */
    static async initiateWebAuthnRegistration(
        request: WebAuthnRegistrationRequest
    ): Promise<PublicKeyCredentialCreationOptionsJSON> {
        try {
            const response = await authApi.post(
                "/register/webauthn/initiate",
                request
            );
            return response.data.options;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message ||
                    "WebAuthn registration initiation failed"
            );
        }
    }

    /**
     * Complete WebAuthn registration
     */
    static async completeWebAuthnRegistration(
        userId: number,
        credential: PublicKeyCredentialJSON,
        deviceName?: string
    ): Promise<boolean> {
        try {
            const response = await authApi.post("/register/webauthn/complete", {
                userId,
                credential,
                deviceName,
            });
            return response.data.success;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || "WebAuthn registration failed"
            );
        }
    }

    /**
     * Verify WebAuthn credential (for 2FA during login)
     */
    static async verifyWebAuthn(
        credential: PublicKeyCredentialJSON,
        challenge: string
    ): Promise<AuthSession> {
        try {
            const response = await authApi.post("/verify/biometric", {
                credential,
                challenge,
            });

            const data = response.data;

            if (data.success && data.session && data.user) {
                TokenManager.setToken(data.session.token);
                if (data.session.refresh_token) {
                    TokenManager.setRefreshToken(data.session.refresh_token);
                }
                TokenManager.setUser(data.user);

                return {
                    token: data.session.token,
                    refresh_token: data.session.refresh_token,
                    expires_in: data.session.expires_in,
                    user: data.user,
                };
            }

            throw new Error("WebAuthn verification failed");
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || "WebAuthn verification failed"
            );
        }
    }

    /**
     * Logout user
     */
    static async logout(): Promise<void> {
        try {
            const token = TokenManager.getToken();
            if (token) {
                // Optional: notify server of logout
                await authApi
                    .post(
                        "/logout",
                        {},
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    )
                    .catch(() => {
                        // Ignore logout errors - clear local storage anyway
                    });
            }
        } finally {
            TokenManager.clearTokens();
        }
    }

    /**
     * Refresh authentication token
     */
    static async refreshToken(): Promise<AuthSession | null> {
        try {
            const refreshToken = TokenManager.getRefreshToken();
            if (!refreshToken) {
                return null;
            }

            const response = await authApi.post("/refresh", {
                refreshToken,
            });

            const data = response.data;
            if (data.success && data.session && data.user) {
                TokenManager.setToken(data.session.token);
                if (data.session.refresh_token) {
                    TokenManager.setRefreshToken(data.session.refresh_token);
                }
                TokenManager.setUser(data.user);

                return {
                    token: data.session.token,
                    refresh_token: data.session.refresh_token,
                    expires_in: data.session.expires_in,
                    user: data.user,
                };
            }

            return null;
        } catch {
            TokenManager.clearTokens();
            return null;
        }
    }

    /**
     * Get current authentication state
     */
    static getAuthState(): {
        user: User | null;
        token: string | null;
        refreshToken: string | null;
        isAuthenticated: boolean;
    } {
        const user = TokenManager.getUser();
        const token = TokenManager.getToken();
        const refreshToken = TokenManager.getRefreshToken();

        const isAuthenticated = !!(
            user &&
            token &&
            !TokenManager.isTokenExpired(token)
        );

        return {
            user,
            token,
            refreshToken,
            isAuthenticated,
        };
    }

    /**
     * Register WebAuthn credential (for existing authenticated users)
     */
    static async registerWebAuthnCredential(
        deviceName?: string
    ): Promise<boolean> {
        try {
            const user = TokenManager.getUser();
            if (!user) {
                throw new Error("User not authenticated");
            }

            // Get registration options
            const options = await this.initiateWebAuthnRegistration({
                userId: user.id,
                deviceName,
            });

            // Create WebAuthn credential
            const credentialOptions =
                WebAuthnUtils.createOptionsFromJSON(options);
            const credential = (await navigator.credentials.create({
                publicKey: credentialOptions,
            })) as PublicKeyCredential;

            if (!credential) {
                throw new Error("WebAuthn credential creation failed");
            }

            // Convert to JSON and complete registration
            const credentialJSON = WebAuthnUtils.credentialToJSON(credential);
            return await this.completeWebAuthnRegistration(
                user.id,
                credentialJSON,
                deviceName
            );
        } catch (error: any) {
            throw new Error(
                error.message || "WebAuthn credential registration failed"
            );
        }
    }

    /**
     * Authenticate with WebAuthn (for 2FA)
     */
    static async authenticateWithWebAuthn(
        options: PublicKeyCredentialRequestOptionsJSON
    ): Promise<AuthSession> {
        try {
            // Convert options and request authentication
            const requestOptions =
                WebAuthnUtils.requestOptionsFromJSON(options);
            const credential = (await navigator.credentials.get({
                publicKey: requestOptions,
            })) as PublicKeyCredential;

            if (!credential) {
                throw new Error("WebAuthn authentication failed");
            }

            // Convert to JSON and verify
            const credentialJSON = WebAuthnUtils.credentialToJSON(credential);
            return await this.verifyWebAuthn(credentialJSON, options.challenge);
        } catch (error: any) {
            throw new Error(error.message || "WebAuthn authentication failed");
        }
    }

    /**
     * Check if WebAuthn is supported
     */
    static isWebAuthnSupported(): boolean {
        return !!(window.PublicKeyCredential && navigator.credentials);
    }

    /**
     * Check if platform authenticator is available (biometric)
     */
    static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
        try {
            if (!this.isWebAuthnSupported()) {
                return false;
            }
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch {
            return false;
        }
    }
}

// Add request interceptor for authentication
authApi.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for token refresh
authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            TokenManager.getRefreshToken()
        ) {
            originalRequest._retry = true;

            try {
                const newSession = await AuthService.refreshToken();
                if (newSession) {
                    originalRequest.headers.Authorization = `Bearer ${newSession.token}`;
                    return authApi(originalRequest);
                }
            } catch {
                TokenManager.clearTokens();
                window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token_refresh_failed' } })); // Gracefully handle logout
            }
        }

        return Promise.reject(error);
    }
);

// TODO: MISSING FEATURES - Authentication system gaps that need implementation:
// 1. Password reset functionality (forgot password flow)
// 2. Email verification system for new registrations
// 3. Account lockout after multiple failed attempts
// 4. Session management (view/revoke active sessions)
// 5. Two-factor authentication setup/management UI
// 6. WebAuthn credential management (add/remove authenticators)
// 7. Profile management (update name, email, password)
// 8. Privacy settings and data export/deletion
// 9. Login history and security audit log
// 10. Social login integration (Google, GitHub, etc.)

// TODO: SECURITY IMPROVEMENTS needed:
// 1. Implement CSRF protection
// 2. Add rate limiting for auth endpoints
// 3. Implement proper session invalidation
// 4. Add device fingerprinting for suspicious activity detection
// 5. Implement proper error handling without information leakage
// 6. Add security headers (CSP, HSTS, etc.)
// 7. Implement account recovery mechanisms
// 8. Add audit logging for all authentication events

export { TokenManager };
export default AuthService;
