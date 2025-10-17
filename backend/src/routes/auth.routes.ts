// Authentication Routes
// Defines all authentication-related HTTP routes

// TODO: ENHANCEMENT - Expand authentication routes and features
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-8/implement-complete-authentication-system
// 1. Add password reset endpoints (/forgot-password, /reset-password)
// 2. Add email verification endpoints (/verify-email, /resend-verification)
// 3. Add account management routes (/change-password, /update-profile)
// 4. Add OAuth provider routes (/oauth/google, /oauth/github, etc.)
// 5. Add session management routes (/sessions, /revoke-session)
// 6. Add device management routes (/devices, /revoke-device)
// 7. Add audit log routes (/auth-history)
// 8. Add account deletion and data export routes (GDPR compliance)
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// TODO: IMPROVEMENT - Enhance rate limiting and security
// 1. Add progressive rate limiting (increase penalties for repeat offenders)
// 2. Implement IP-based and user-based rate limiting separately
// 3. Add whitelist for trusted IP ranges
// 4. Store rate limit data in Redis for distributed systems
// 5. Add CAPTCHA integration after rate limit exceeded
// 6. Implement geolocation-based restrictions
// 7. Add suspicious activity detection and automatic blocking
// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: {
        success: false,
        error: "rate_limit_exceeded",
        message: "Too many authentication attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const registrationRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit registration attempts
    message: {
        success: false,
        error: "rate_limit_exceeded",
        message: "Too many registration attempts. Please try again later.",
    },
});

const webAuthnRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Allow more attempts for WebAuthn since it includes challenge generation
    message: {
        success: false,
        error: "rate_limit_exceeded",
        message: "Too many WebAuthn attempts. Please try again later.",
    },
});

// User registration
router.post("/register", registrationRateLimit, AuthController.register);

// Primary login (username/password)
router.post("/login", authRateLimit, AuthController.login);

// WebAuthn credential registration
router.post(
    "/register/webauthn/initiate",
    webAuthnRateLimit,
    AuthController.initiateWebAuthnRegistration
);
router.post(
    "/register/webauthn/complete",
    webAuthnRateLimit,
    AuthController.completeWebAuthnRegistration
);

// WebAuthn authentication (2FA)
router.post("/verify/biometric", authRateLimit, AuthController.verifyWebAuthn);

// Health check for auth service
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Authentication service is healthy",
        timestamp: new Date().toISOString(),
    });
});

export default router;
