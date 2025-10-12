// Authentication Controller
// Handles all authentication-related HTTP endpoints

import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
    AuthSessionModel,
    SecurityEventModel,
    UserModel,
    UserPreferencesModel,
    WebAuthnCredentialModel,
} from "../models/auth.models";
import { WebAuthnService } from "../services/webauthn.service";
import {
    LoginRequest,
    RegisterRequest,
    WebAuthnError,
    WebAuthnRegistrationRequest,
    WebAuthnVerificationRequest,
} from "../types/auth.types";
import { validateHighEntropySecret } from "../utils/entropy";

export class AuthController {
    // JWT secret is initialized at application startup via init()
    private static JWT_SECRET: string;

    /**
     * Initializes the AuthController configuration by setting the JWT secret.
     *
     * This method <b>must</b> be called exactly once at application startup, before any authentication-related
     * requests are handled. It should be invoked in your application's entry point (e.g., before starting the
     * HTTP server), as follows:
     *
     *     AuthController.init();
     *
     * The method reads the JWT secret from the environment variable <code>JWT_SECRET</code>, validates its
     * entropy and length, and stores it for use in signing and verifying JWT tokens.
     *
     * <b>Failure to call this method before handling requests will result in authentication failures, as the
     * JWT secret will be undefined.</b>
     *
     * @throws {Error} If <code>JWT_SECRET</code> is not set or does not meet entropy requirements.
     */
    public static init(): void {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET environment variable must be set.");
        }
        try {
            // Validate secret entropy & length using shared utility
            validateHighEntropySecret(secret);
        } catch (err: unknown) {
            let errMsg: string;
            if (err instanceof Error) {
                errMsg = err.message;
            } else {
                errMsg = String(err);
            }
            throw new Error(
                "JWT_SECRET does not meet entropy requirements: " +
                errMsg +
                ". Please set a strong, high-entropy secret (e.g., at least 32 random characters)."
            );
        }
        AuthController.JWT_SECRET = secret;
    }
=======

export class AuthController {
    // TODO: SECURITY CRITICAL - JWT secret must be from environment in production
    // Remove fallback "your-secret-key" - application should fail if not set
    // Use crypto.randomBytes(64).toString('hex') to generate secure secret
    private static readonly JWT_SECRET =
        process.env.JWT_SECRET || "your-secret-key";
<<<<<<< HEAD
>>>>>>> 7d092da (feat: Add comprehensive authentication system with WebAuthn & developer toolbar)
=======

    // TODO: ENHANCEMENT - Make security parameters configurable
    // Move to environment variables or configuration service
    // Consider different limits for different user types
>>>>>>> b62056a (feat: Implement comprehensive authentication system with Linear integration)
    private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
    private static readonly MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Register a new user
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
            }: RegisterRequest = req.body;

            // Validate input
            if (!firstName || !lastName || !email || !password) {
                res.status(400).json({
                    success: false,
                    message:
                        "First name, last name, email, and password are required",
                });
                return;
            }

            if (password !== confirmPassword) {
                res.status(400).json({
                    success: false,
                    message: "Passwords do not match",
                });
                return;
            }

            if (password.length < 8) {
                res.status(400).json({
                    success: false,
                    message: "Password must be at least 8 characters long",
                });
                return;
            }

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
                return;
            }

            // TODO: IMPROVEMENT - Enhanced username generation algorithm
            // Consider more sophisticated username generation:
            // 1. Handle unicode characters properly (use slugify library)
            // 2. Add minimum username length validation (e.g., 3 characters)
            // 3. Reserve list of inappropriate/system usernames
            // 4. Consider using UUID suffix instead of incremental counter
            const baseUsername =
                `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(
                    /[^a-z0-9]/g,
                    ""
                );
            let username = baseUsername;
            let counter = 1;

            // TODO: PERFORMANCE - Optimize username uniqueness check
            // Current implementation has N+1 query problem for popular names
            // Consider batch checking or using database constraints
            while (await UserModel.findByUsername(username)) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create user
            const user = await UserModel.create({
                username,
                email,
                password_hash: passwordHash,
                display_name: `${firstName} ${lastName}`,
                two_factor_enabled: false,
                account_locked_until: undefined,
                failed_login_attempts: 0,
            });

            // Create user preferences
            await UserPreferencesModel.create(user.id);

            // Log security event
            await SecurityEventModel.create({
                user_id: user.id,
                event_type: "user_registered",
                ip_address: req.ip,
                user_agent: req.get("User-Agent"),
                metadata: { firstName, lastName, username, email },
            });

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: user.id,
                    firstName,
                    lastName,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name,
                },
            });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * User login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password }: LoginRequest = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
                return;
            }

            // Get user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }

            // Check if account is locked
            if (
                user.account_locked_until &&
                user.account_locked_until > new Date()
            ) {
                res.status(423).json({
                    success: false,
                    message:
                        "Account is temporarily locked due to too many failed login attempts",
                });
                return;
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password_hash
            );
            if (!isPasswordValid) {
                // Increment failed login attempts
                const failedAttempts = user.failed_login_attempts + 1;
                const shouldLockAccount =
                    failedAttempts >= AuthController.MAX_LOGIN_ATTEMPTS;

                await UserModel.update(user.id, {
                    failed_login_attempts: failedAttempts,
                    account_locked_until: shouldLockAccount
                        ? new Date(
                              Date.now() + AuthController.RATE_LIMIT_WINDOW
                          )
                        : undefined,
                });

                // Log security event
                await SecurityEventModel.create({
                    user_id: user.id,
                    event_type: "failed_login",
                    ip_address: req.ip,
                    user_agent: req.get("User-Agent"),
                    metadata: { failed_attempts: failedAttempts },
                });

                res.status(401).json({
                    success: false,
                    message: shouldLockAccount
                        ? "Too many failed attempts. Account locked for 15 minutes."
                        : "Invalid credentials",
                });
                return;
            }

            // Reset failed login attempts on successful password verification
            if (user.failed_login_attempts > 0) {
                await UserModel.update(user.id, {
                    failed_login_attempts: 0,
                    account_locked_until: undefined,
                });
            }

            // Update last login timestamp
            await UserModel.updateLastLogin(user.id);

            // Check if 2FA is required
            const webauthnCredentials =
                await WebAuthnCredentialModel.findByUserId(user.id);
            const has2FA =
                user.two_factor_enabled && webauthnCredentials.length > 0;

            if (has2FA) {
                // Generate WebAuthn challenge for 2FA
                const authOptions =
                    await WebAuthnService.generateAuthenticationOptions(
                        user.id
                    );

                res.json({
                    success: true,
                    require_2fa: true,
                    challenge: authOptions,
                    message: "Password verified. Complete 2FA to continue.",
                });
                return;
            }

            // Log successful login security event
            await SecurityEventModel.create({
                user_id: user.id,
                event_type: "login_success",
                ip_address: req.ip,
                user_agent: req.get("User-Agent"),
                metadata: { email },
            });

            // Create session (no 2FA required)
            const sessionData = await AuthController.createSession(
                user.id,
                req
            );

            // TODO: MISMATCH - Fragile firstName/lastName extraction
            // This approach assumes display_name is always "First Last" format
            // Problems: 1) Users with single names, 2) Multiple middle names, 3) Cultural naming differences
            // SOLUTION: Store firstName/lastName as separate database columns
            // OR: Add proper name parsing library (e.g., humanparser)
            const displayNameParts = (user.display_name || user.username).split(
                " "
            );
            const firstName = displayNameParts[0] || user.username;
            const lastName =
                displayNameParts.length > 1
                    ? displayNameParts.slice(1).join(" ")
                    : "";

            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName,
                    lastName,
                    two_factor_enabled: user.two_factor_enabled,
                    email_verified: user.email_verified,
                    created_at: user.created_at.toISOString(),
                    last_login_at: user.last_login_at?.toISOString(),
                },
                session_token: sessionData.token,
                refresh_token: sessionData.refresh_token,
                expires_in: sessionData.expires_in,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * Initiate WebAuthn registration
     */
    static async initiateWebAuthnRegistration(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { userId }: WebAuthnRegistrationRequest = req.body;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            // Verify user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            // Generate registration options
            const registrationOptions =
                await WebAuthnService.generateRegistrationOptions(userId);

            res.json({
                success: true,
                options: registrationOptions,
                message: "WebAuthn registration options generated",
            });
        } catch (error) {
            console.error("WebAuthn registration initiation error:", error);
            if (error instanceof WebAuthnError) {
                res.status(error.statusCode || 400).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        }
    }

    /**
     * Complete WebAuthn registration
     */
    static async completeWebAuthnRegistration(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const { userId, credential, deviceName, challenge } = req.body;

            if (!userId || !credential || !challenge) {
                res.status(400).json({
                    success: false,
                    message: "User ID, credential, or challenge are required",
                });
                return;
            }

            // Verify registration
            const result = await WebAuthnService.verifyRegistrationResponse(
                userId,
                credential,
                challenge,
                deviceName
            );

            if (result.verified) {
                // Enable 2FA for user if not already enabled
                await UserModel.update(userId, {
                    two_factor_enabled: true,
                });

                // Log security event
                await SecurityEventModel.create({
                    user_id: userId,
                    event_type: "webauthn_credential_added",
                    ip_address: req.ip,
                    user_agent: req.get("User-Agent"),
                    metadata: { device_name: deviceName },
                });

                res.json({
                    success: true,
                    message: "WebAuthn credential registered successfully",
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "WebAuthn registration verification failed",
                });
            }
        } catch (error) {
            console.error("WebAuthn registration completion error:", error);
            if (error instanceof WebAuthnError) {
                res.status(error.statusCode || 400).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        }
    }

    /**
     * Verify WebAuthn (for 2FA during login)
     */
    static async verifyWebAuthn(req: Request, res: Response): Promise<void> {
        try {
            const { credential, challenge }: WebAuthnVerificationRequest =
                req.body;

            if (!credential || !challenge) {
                res.status(400).json({
                    success: false,
                    message: "Credential and challenge are required",
                });
                return;
            }

            // Verify authentication
            const result = await WebAuthnService.verifyAuthenticationResponse(
                credential,
                challenge
            );

            if (result.verified && result.userId) {
                // Get user
                const user = await UserModel.findById(result.userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: "User not found",
                    });
                    return;
                }

                // Create session
                const sessionData = await AuthController.createSession(
                    result.userId,
                    req
                );

                // Log security event
                await SecurityEventModel.create({
                    user_id: result.userId,
                    event_type: "webauthn_login_success",
                    ip_address: req.ip,
                    user_agent: req.get("User-Agent"),
                    metadata: { credential_id: result.credentialId },
                });

                res.json({
                    success: true,
                    message: "2FA verification successful",
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        display_name: user.display_name,
                    },
                    session: sessionData,
                });
            } else {
                // Log failed 2FA attempt
                await SecurityEventModel.create({
                    user_id: undefined,
                    event_type: "webauthn_login_failed",
                    ip_address: req.ip,
                    user_agent: req.get("User-Agent"),
                    metadata: { challenge },
                });

                res.status(401).json({
                    success: false,
                    message: "2FA verification failed",
                });
            }
        } catch (error) {
            console.error("WebAuthn verification error:", error);
            if (error instanceof WebAuthnError) {
                res.status(error.statusCode || 400).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        }
    }

    /**
     * Helper method to create a session
     */
    private static async createSession(
        userId: number,
        req: Request
    ): Promise<any> {
        // Use cryptographically secure random UUID for session ID
        const sessionId = `session_${crypto.randomUUID()}`;
        const payload = {
            userId,
            sessionId,
            iat: Math.floor(Date.now() / 1000),
        };

        const sessionToken = jwt.sign(payload, AuthController.JWT_SECRET);
        // Use cryptographically secure random bytes for refresh token
        const refreshToken = `refresh_${crypto
            .randomBytes(32)
            .toString("hex")}`;

        // Store session in database
        await AuthSessionModel.create({
            user_id: userId,
            session_token: sessionId,
            refresh_token_hash: await bcrypt.hash(refreshToken, 10),
            device_fingerprint: AuthController.generateDeviceFingerprint(req),
            ip_address: req.ip,
            user_agent: req.get("User-Agent"),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            is_active: true,
        });

        return {
            token: sessionToken,
            refresh_token: refreshToken,
            expires_in: 24 * 60 * 60, // 24 hours in seconds
        };
    }

    /**
     * Generate device fingerprint
     */
    private static generateDeviceFingerprint(req: Request): string {
        const userAgent = req.get("User-Agent") || "";
        const acceptLanguage = req.get("Accept-Language") || "";
        const acceptEncoding = req.get("Accept-Encoding") || "";

        const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
        return Buffer.from(fingerprint).toString("base64").substring(0, 64);
    }
}
