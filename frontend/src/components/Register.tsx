import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/auth.service";
import {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialJSON,
    RegisterRequest,
} from "../types/auth.types";
import "./Register.css";

type WebAuthnCredentialState = PublicKeyCredentialJSON | { success: true };

interface RegisterProps {
    onSwitchToLogin?: () => void;
    onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onSuccess }) => {
    const { register, error, isLoading, clearError } = useAuth();

    const [formData, setFormData] = useState<RegisterRequest>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
    });

    const [validationErrors, setValidationErrors] = useState<
        Partial<RegisterRequest & { confirmPassword: string }>
    >({});
    const [webAuthnOptions, setWebAuthnOptions] =
        useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

    const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
    const [
        isPlatformAuthenticatorAvailable,
        setIsPlatformAuthenticatorAvailable,
    ] = useState(false);
    const [webAuthnCredential, setWebAuthnCredential] =
        useState<WebAuthnCredentialState | null>(null);
    const [registrationStep, setRegistrationStep] = useState<
        "form" | "webauthn-setup" | "complete"
    >("form");

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

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear validation error for this field
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
        }

        // Clear auth error
        if (error) {
            clearError();
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<RegisterRequest & { confirmPassword: string }> =
            {};

        if (!formData.username.trim()) {
            errors.username = "Username is required";
        } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.username)) {
            errors.username =
                "Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens";
        }

        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required";
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = "First name must be at least 2 characters";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required";
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = "Last name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }

        if (!formData.password.trim()) {
            errors.password = "Password is required";
        } else if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            // TODO: ENHANCEMENT - Expand password validation rules
            // Add special character requirement: (?=.*[!@#$%^&*])
            // Consider password strength meter with visual feedback
            // Add check against common passwords list
            errors.password =
                "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }

        if (!formData.confirmPassword.trim()) {
            errors.confirmPassword = "Password confirmation is required";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
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
            const response = await register(formData);

            // If WebAuthn is supported and available, offer to set up biometric authentication
            if (
                isWebAuthnSupported &&
                isPlatformAuthenticatorAvailable &&
                response.webauthn_options
            ) {
                setWebAuthnOptions(response.webauthn_options);
                setRegistrationStep("webauthn-setup");
            } else {
                setRegistrationStep("complete");
            }
        } catch (error) {
            // Error is handled by the context and displayed via the error state
            console.error("Registration error:", error);
        }
    };

    // Handle WebAuthn credential creation
    const handleWebAuthnSetup = async () => {
        if (!webAuthnOptions) {
            return;
        }

        try {
            // Register WebAuthn credential for the current user
            const success = await AuthService.registerWebAuthnCredential();

            if (success) {
                setWebAuthnCredential({ success: true });
            }

            setRegistrationStep("complete");
        } catch (error: any) {
            console.error("WebAuthn setup error:", error);
            // Allow user to skip WebAuthn setup and continue
            setRegistrationStep("complete");
        }
    };

    // Skip WebAuthn setup
    const handleSkipWebAuthn = () => {
        setRegistrationStep("complete");
    };

    // Render WebAuthn setup prompt
    const renderWebAuthnSetup = () => (
        <div className="webauthn-setup">
            <div className="webauthn-icon">🛡️</div>
            <h2>Set up Biometric Authentication</h2>
            <p>
                Secure your account with biometric authentication using your
                device's Face ID, Touch ID, or Windows Hello for enhanced
                security.
            </p>

            <div className="webauthn-benefits">
                <h3>Benefits:</h3>
                <ul>
                    <li>✅ Enhanced security without passwords</li>
                    <li>✅ Quick and convenient access</li>
                    <li>✅ Protected by your device's hardware</li>
                    <li>✅ Works across all your devices</li>
                </ul>
            </div>

            <div className="webauthn-actions">
                <button
                    type="button"
                    onClick={handleWebAuthnSetup}
                    className="webauthn-button primary"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Setting up..."
                        : "Set up Biometric Authentication"}
                </button>

                <button
                    type="button"
                    onClick={handleSkipWebAuthn}
                    className="webauthn-button secondary"
                    disabled={isLoading}
                >
                    Skip for now
                </button>
            </div>

            <div className="webauthn-help">
                <p>
                    <strong>Note:</strong> You can always set this up later in
                    your account settings.
                </p>
            </div>
        </div>
    );

    // Render registration complete screen
    const renderRegistrationComplete = () => (
        <div className="registration-complete">
            <div className="success-icon">🎉</div>
            <h2>Welcome to WishMaker!</h2>
            <p>
                Your account has been created successfully.
                {webAuthnCredential &&
                    " Biometric authentication has been set up for your account."}
            </p>

            <div className="next-steps">
                <h3>What's next?</h3>
                <ul>
                    <li>Start creating and managing your wishes</li>
                    <li>Explore the WishMaker features</li>
                    {!webAuthnCredential && (
                        <li>Set up biometric authentication in settings</li>
                    )}
                </ul>
            </div>

            <button
                type="button"
                onClick={() => {
                    onSuccess?.();
                    onSwitchToLogin?.();
                }}
                className="complete-button primary"
            >
                Continue to WishMaker
            </button>
        </div>
    );

    // Render registration form
    const renderRegistrationForm = () => (
        <form onSubmit={handleSubmit} className="register-form" noValidate>
            <h1>Join WishMaker</h1>
            <p className="register-subtitle">
                Create your account to start making wishes come true
            </p>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={validationErrors.username ? "error" : ""}
                    placeholder="Choose a unique username"
                    autoComplete="username"
                    disabled={isLoading}
                />
                {validationErrors.username && (
                    <span className="field-error">
                        {validationErrors.username}
                    </span>
                )}
            </div>

            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={validationErrors.firstName ? "error" : ""}
                        placeholder="Enter your first name"
                        autoComplete="given-name"
                        disabled={isLoading}
                    />
                    {validationErrors.firstName && (
                        <span className="field-error">
                            {validationErrors.firstName}
                        </span>
                    )}
                </div>

                <div className="form-group half">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={validationErrors.lastName ? "error" : ""}
                        placeholder="Enter your last name"
                        autoComplete="family-name"
                        disabled={isLoading}
                    />
                    {validationErrors.lastName && (
                        <span className="field-error">
                            {validationErrors.lastName}
                        </span>
                    )}
                </div>
            </div>

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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={isLoading}
                />
                {validationErrors.password && (
                    <span className="field-error">
                        {validationErrors.password}
                    </span>
                )}
                <div className="password-requirements">
                    <small>
                        Password must be at least 8 characters with uppercase,
                        lowercase, and number
                    </small>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={validationErrors.confirmPassword ? "error" : ""}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                />
                {validationErrors.confirmPassword && (
                    <span className="field-error">
                        {validationErrors.confirmPassword}
                    </span>
                )}
            </div>

            <button
                type="submit"
                className="register-button primary"
                disabled={isLoading}
            >
                {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {isWebAuthnSupported && isPlatformAuthenticatorAvailable && (
                <div className="webauthn-preview">
                    <div className="webauthn-badge">
                        🛡️ Biometric authentication will be available
                    </div>
                    <p className="webauthn-description">
                        After creating your account, you'll have the option to
                        set up secure biometric authentication for enhanced
                        security.
                    </p>
                </div>
            )}

            <div className="register-footer">
                <p>
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="link-button"
                        disabled={isLoading}
                    >
                        Sign in here
                    </button>
                </p>
            </div>
        </form>
    );

    const renderCurrentStep = () => {
        switch (registrationStep) {
            case "webauthn-setup":
                return renderWebAuthnSetup();
            case "complete":
                return renderRegistrationComplete();
            case "form":
            default:
                return renderRegistrationForm();
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">{renderCurrentStep()}</div>
        </div>
    );
};

export default Register;
