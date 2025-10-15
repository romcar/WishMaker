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
     * Initialize AuthController configuration.
     * Must be called at application startup before handling requests.
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
            if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
                errMsg = (err as { message: string }).message;
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
    private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
    private static readonly MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Register a new user
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const {
                username,
                email,
                password,
                confirmPassword,
            }: RegisterRequest = req.body;

            // Validate input
            if (!username || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Username, email, and password are required",
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

            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                res.status(409).json({
                    success: false,
                    message: "Username already taken",
                });
                return;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create user
            const user = await UserModel.create({
                username,
                email,
                password_hash: passwordHash,
                display_name: username,
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
                metadata: { username, email },
            });

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: user.id,
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

            // Create session (no 2FA required)
            const sessionData = await AuthController.createSession(
                user.id,
                req
            );

            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name,
                },
                session: sessionData,
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
