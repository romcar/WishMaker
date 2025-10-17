import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/auth.service";
import {
    LoginRequest,
    PublicKeyCredentialRequestOptionsJSON,
} from "../types/auth.types";
import "./Login.css";

// TODO: ENHANCEMENT - Improve Login component functionality
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-8/implement-complete-authentication-system
// 1. Add "Remember Me" checkbox with persistent sessions
// 2. Implement password visibility toggle
// 3. Add "Forgot Password" link and functionality
// 4. Social login options (Google, GitHub, etc.)
// 5. Rate limiting and brute force protection feedback
// 6. Progressive enhancement for WebAuthn
// 7. Offline support with service worker integration
// 8. Biometric authentication options
// 9. Multi-factor authentication support
// 10. Login attempt history and security notifications
interface LoginProps {
    onSwitchToRegister?: () => void;
    onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSuccess }) => {
    const { login, error, isLoading, clearError } = useAuth();

    const [formData, setFormData] = useState<LoginRequest>({
        email: "",
        password: "",
    });

    const [validationErrors, setValidationErrors] = useState<
        Partial<LoginRequest>
    >({});
    const [webAuthnChallenge, setWebAuthnChallenge] =
        useState<PublicKeyCredentialRequestOptionsJSON | null>(null);
    const [showWebAuthn, setShowWebAuthn] = useState(false);
    const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
    const [
        isPlatformAuthenticatorAvailable,
        setIsPlatformAuthenticatorAvailable,
    ] = useState(false);

    // TODO: IMPROVEMENT - Enhanced WebAuthn and component initialization
    // 1. Add fallback UI for unsupported browsers
    // 2. Detect and handle WebAuthn transport methods (USB, NFC, BLE)
    // 3. Add device registration management interface
    // 4. Implement conditional UI based on available authenticators
    // 5. Cache support detection to avoid repeated checks
    // 6. Add error handling for WebAuthn API failures
    // Check WebAuthn support on component mount
    React.useEffect(() => {
        const checkWebAuthnSupport = async () => {
            const supported = AuthService.isWebAuthnSupported();
            const platformAvailable =
                await AuthService.isPlatformAuthenticatorAvailable();

            setIsWebAuthnSupported(supported);
            setIsPlatformAuthenticatorAvailable(platformAvailable);
        };

        checkWebAuthnSupport();
    }, []);

    // TODO: ENHANCEMENT - Improve input handling and validation
    // 1. Add debounced real-time validation
    // 2. Implement auto-complete suggestions for known users
    // 3. Add input masking and formatting
    // 4. Implement keyboard shortcuts (Enter to submit)
    // 5. Add input sanitization and XSS protection
    // 6. Support for paste detection and validation
    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear validation error for this field
        if (validationErrors[name as keyof LoginRequest]) {
            setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
        }

        // Clear auth error
        if (error) {
            clearError();
        }
    };

    // TODO: IMPROVEMENT - Enhanced form validation
    // 1. Add email domain validation against known providers
    // 2. Implement progressive password strength indicators
    // 3. Add CAPTCHA integration for suspicious login attempts
    // 4. Validate against known compromised passwords (HaveIBeenPwned API)
    // 5. Add custom validation rules and configurable policies
    // 6. Implement server-side validation confirmation
    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<LoginRequest> = {};

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }

        if (!formData.password.trim()) {
            errors.password = "Password is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await login(formData);

            if (response.require_2fa && response.challenge) {
                setWebAuthnChallenge(response.challenge);
                setShowWebAuthn(true);
            } else {
                // Login successful without 2FA
                onSuccess?.();
            }
        } catch (error) {
            // Error is handled by the context and displayed via the error state
            console.error("Login error:", error);
        }
    };

    // Handle WebAuthn authentication
    const handleWebAuthnAuth = async () => {
        if (!webAuthnChallenge) {
            return;
        }

        try {
            await AuthService.authenticateWithWebAuthn(webAuthnChallenge);
            // WebAuthn authentication successful
            onSuccess?.();
        } catch (error: any) {
            console.error("WebAuthn authentication error:", error);
            // Reset to password form on WebAuthn failure
            setShowWebAuthn(false);
            setWebAuthnChallenge(null);
        }
    };

    // Handle WebAuthn cancellation
    const handleWebAuthnCancel = () => {
        setShowWebAuthn(false);
        setWebAuthnChallenge(null);
    };

    // Render WebAuthn prompt
    const renderWebAuthnPrompt = () => (
        <div className="webauthn-prompt">
            <div className="webauthn-icon">🔐</div>
            <h2>Biometric Authentication</h2>
            <p>
                Complete your login using your device's biometric authentication
                (Face ID, Touch ID, or Windows Hello).
            </p>

            <div className="webauthn-actions">
                <button
                    type="button"
                    onClick={handleWebAuthnAuth}
                    className="webauthn-button primary"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Authenticating..."
                        : "Authenticate with Biometrics"}
                </button>

                <button
                    type="button"
                    onClick={handleWebAuthnCancel}
                    className="webauthn-button secondary"
                    disabled={isLoading}
                >
                    Cancel
                </button>
            </div>

            <div className="webauthn-help">
                <p>
                    <strong>Tip:</strong> You may see a prompt from your browser
                    or device to authenticate using your fingerprint, face, or
                    PIN.
                </p>
            </div>
        </div>
    );

    // Render login form
    const renderLoginForm = () => (
        <form onSubmit={handleSubmit} className="login-form" noValidate>
            <h1>Welcome Back</h1>
            <p className="login-subtitle">Sign in to your WishMaker account</p>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={validationErrors.email ? "error" : ""}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isLoading}
                />
                {validationErrors.email && (
                    <span className="field-error">
                        {validationErrors.email}
                    </span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={validationErrors.password ? "error" : ""}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                />
                {validationErrors.password && (
                    <span className="field-error">
                        {validationErrors.password}
                    </span>
                )}
            </div>

            <button
                type="submit"
                className="login-button primary"
                disabled={isLoading}
            >
                {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {isWebAuthnSupported && isPlatformAuthenticatorAvailable && (
                <div className="webauthn-info">
                    <div className="webauthn-badge">
                        🔐 Biometric authentication available
                    </div>
                    <p className="webauthn-description">
                        This account may use biometric authentication for
                        enhanced security. Complete your login to access all
                        features.
                    </p>
                </div>
            )}

            <div className="login-footer">
                <p>
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="link-button"
                        disabled={isLoading}
                    >
                        Sign up here
                    </button>
                </p>
            </div>
        </form>
    );

    return (
        <div className="login-container">
            <div className="login-card">
                {showWebAuthn ? renderWebAuthnPrompt() : renderLoginForm()}
            </div>
        </div>
    );
};

export default Login;
