// WebAuthn Service for handling biometric authentication
// Provides core WebAuthn functionality for registration and authentication

// TODO: ENHANCEMENT - Improve WebAuthn service functionality
// 1. Add support for multiple authenticator types (roaming, platform)
// 2. Implement authenticator attestation verification
// 3. Add support for conditional UI and passkey management
// 4. Implement backup and recovery for WebAuthn credentials
// 5. Add support for cross-device authentication flows
// 6. Implement credential management and device naming
// 7. Add WebAuthn analytics and usage tracking
// 8. Support for WebAuthn Level 3 features
// 9. Add enterprise features (attestation policies, etc.)
// 10. Implement WebAuthn credential migration tools

// Set up crypto polyfill for WebAuthn
import { Crypto } from "@peculiar/webcrypto";
global.crypto = new Crypto();

import type {
    GenerateRegistrationOptionsOpts,
    VerifyAuthenticationResponseOpts,
    VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
    AuthChallengeModel,
    UserModel,
    WebAuthnCredentialModel,
} from "../models/auth.models";
import {
    AuthenticationCredentialJSON,
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationCredentialJSON,
    WebAuthnError,
} from "../types/auth.types";

export class WebAuthnService {
    private static readonly RP_NAME = process.env.RP_NAME || "WishMaker";
    private static readonly RP_ID = process.env.RP_ID || "localhost";
    private static readonly ORIGIN =
        process.env.ORIGIN || "http://localhost:3000";
    private static readonly CHALLENGE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    /**
     * Generate registration options for a user to register a new WebAuthn credential
     */
    static async generateRegistrationOptions(
        userId: number
    ): Promise<PublicKeyCredentialCreationOptionsJSON> {
        try {
            // Get user information
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new WebAuthnError(
                    "User not found",
                    "USER_NOT_FOUND",
                    404
                );
            }

            // Generate registration options
            const options: GenerateRegistrationOptionsOpts = {
                rpName: WebAuthnService.RP_NAME,
                rpID: WebAuthnService.RP_ID,
                userID: new Uint8Array(Buffer.from(userId.toString())),
                userName: user.email,
                userDisplayName: user.display_name || user.username,
                timeout: 60000, // 1 minute
                attestationType: "none" as const, // For privacy, we don't need attestation
                excludeCredentials: [],
                authenticatorSelection: {
                    authenticatorAttachment: "platform", // Prefer built-in authenticators (biometrics)
                    userVerification: "required", // Require biometric verification
                    residentKey: "preferred", // Allow passwordless login if supported
                },
                supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
            };

            const registrationOptions = await generateRegistrationOptions(
                options
            );

            // Store the challenge for verification
            await AuthChallengeModel.create({
                challenge: registrationOptions.challenge,
                user_id: userId,
                challenge_type: "registration",
                origin: WebAuthnService.ORIGIN,
                expires_at: new Date(
                    Date.now() + WebAuthnService.CHALLENGE_TIMEOUT
                ),
            });

            // Convert to our JSON format
            return {
                rp: {
                    name: registrationOptions.rp.name,
                    id: registrationOptions.rp.id,
                },
                user: {
                    id: registrationOptions.user.id,
                    name: registrationOptions.user.name,
                    displayName: registrationOptions.user.displayName,
                },
                challenge: registrationOptions.challenge,
                pubKeyCredParams: registrationOptions.pubKeyCredParams.map(
                    (param) => ({
                        alg: param.alg,
                        type: param.type,
                    })
                ),
                timeout: registrationOptions.timeout,
                excludeCredentials: [],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "preferred",
                },
                attestation: "none",
            };
        } catch (error) {
            console.error("WebAuthn registration options error:", error);
            if (error instanceof WebAuthnError) {
                throw error;
            }
            throw new WebAuthnError(
                `Failed to generate registration options: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
                "REGISTRATION_OPTIONS_FAILED"
            );
        }
    }

    /**
     * Verify a WebAuthn registration response
     */
    static async verifyRegistrationResponse(
        userId: number,
        credential: RegistrationCredentialJSON,
        expectedChallenge: string,
        deviceName?: string
    ): Promise<{ verified: boolean; credentialId?: string }> {
        try {
            // Verify the challenge exists and is valid
            const challenge = await AuthChallengeModel.findByChallenge(
                expectedChallenge
            );
            if (
                !challenge ||
                challenge.used ||
                challenge.expires_at < new Date()
            ) {
                throw new WebAuthnError(
                    "Invalid or expired challenge",
                    "INVALID_CHALLENGE"
                );
            }

            if (
                challenge.user_id !== userId ||
                challenge.challenge_type !== "registration"
            ) {
                throw new WebAuthnError(
                    "Challenge mismatch",
                    "CHALLENGE_MISMATCH"
                );
            }

            // Verify the registration response
            const opts: VerifyRegistrationResponseOpts = {
                response: {
                    id: credential.id,
                    rawId: credential.rawId,
                    response: {
                        clientDataJSON: credential.response.clientDataJSON,
                        attestationObject:
                            credential.response.attestationObject,
                        transports: credential.response.transports,
                    },
                    type: credential.type,
                    clientExtensionResults:
                        credential.clientExtensionResults || {},
                },
                expectedChallenge,
                expectedOrigin: WebAuthnService.ORIGIN,
                expectedRPID: WebAuthnService.RP_ID,
                requireUserVerification: true,
            };

            const verification = await verifyRegistrationResponse(opts);

            if (!verification.verified || !verification.registrationInfo) {
                throw new WebAuthnError(
                    "Registration verification failed",
                    "VERIFICATION_FAILED"
                );
            }

            // Mark challenge as used
            await AuthChallengeModel.markUsed(challenge.id);

            // Store the credential in the database
            const {
                credentialPublicKey,
                credentialID,
                counter,
                credentialDeviceType,
                credentialBackedUp,
            } = verification.registrationInfo;

            await WebAuthnCredentialModel.create({
                user_id: userId,
                credential_id: credentialID,
                public_key: Buffer.from(credentialPublicKey),
                counter: BigInt(counter),
                device_type:
                    credentialDeviceType === "singleDevice"
                        ? "platform"
                        : "cross-platform",
                transports: credential.response.transports || ["internal"],
                backup_eligible: credentialBackedUp,
                backup_state: credentialBackedUp,
                attestation_type: "none",
                device_name: deviceName || "Biometric Device",
                is_active: true,
            });

            return {
                verified: true,
                credentialId: credentialID,
            };
        } catch (error) {
            if (error instanceof WebAuthnError) {
                throw error;
            }
            throw new WebAuthnError(
                "Registration verification failed",
                "VERIFICATION_ERROR"
            );
        }
    }

    /**
     * Generate authentication options for a user to authenticate with WebAuthn
     */
    static async generateAuthenticationOptions(userId: number): Promise<any> {
        try {
            // Get user's credentials
            const credentials = await WebAuthnCredentialModel.findByUserId(
                userId
            );

            if (credentials.length === 0) {
                throw new WebAuthnError(
                    "No WebAuthn credentials found for user"
                );
            }

            const allowCredentials = credentials.map((cred) => ({
                id: cred.credential_id,
                type: "public-key" as const,
            }));

            const options = await generateAuthenticationOptions({
                rpID: WebAuthnService.RP_ID,
                allowCredentials,
                userVerification: "preferred",
                timeout: 60000,
            });

            // Store the challenge
            await AuthChallengeModel.create({
                user_id: userId,
                challenge: options.challenge,
                challenge_type: "authentication",
                origin: WebAuthnService.ORIGIN,
                expires_at: new Date(
                    Date.now() + WebAuthnService.CHALLENGE_TIMEOUT
                ),
            });

            return options;
        } catch (error) {
            console.error("Error generating authentication options:", error);
            throw error;
        }
    }

    /**
     * Verify a WebAuthn authentication response
     */
    static async verifyAuthenticationResponse(
        credential: AuthenticationCredentialJSON,
        expectedChallenge: string
    ): Promise<{ verified: boolean; userId?: number; credentialId?: string }> {
        try {
            // Verify the challenge exists and is valid
            const challenge = await AuthChallengeModel.findByChallenge(
                expectedChallenge
            );
            if (
                !challenge ||
                challenge.used ||
                challenge.expires_at < new Date()
            ) {
                throw new WebAuthnError(
                    "Invalid or expired challenge",
                    "INVALID_CHALLENGE"
                );
            }

            if (challenge.challenge_type !== "authentication") {
                throw new WebAuthnError(
                    "Challenge type mismatch",
                    "CHALLENGE_MISMATCH"
                );
            }

            // Find the credential
            const storedCredential =
                await WebAuthnCredentialModel.findByCredentialId(credential.id);
            if (!storedCredential || !storedCredential.is_active) {
                throw new WebAuthnError(
                    "Credential not found or inactive",
                    "CREDENTIAL_NOT_FOUND"
                );
            }

            // Verify the authentication response
            const opts: VerifyAuthenticationResponseOpts = {
                response: {
                    id: credential.id,
                    rawId: credential.rawId,
                    response: {
                        authenticatorData:
                            credential.response.authenticatorData,
                        clientDataJSON: credential.response.clientDataJSON,
                        signature: credential.response.signature,
                        userHandle: credential.response.userHandle,
                    },
                    type: credential.type,
                    clientExtensionResults:
                        credential.clientExtensionResults || {},
                },
                expectedChallenge,
                expectedOrigin: WebAuthnService.ORIGIN,
                expectedRPID: WebAuthnService.RP_ID,
                authenticator: {
                    credentialID: storedCredential.credential_id,
                    credentialPublicKey: storedCredential.public_key,
                    counter: Number(storedCredential.counter),
                    transports: storedCredential.transports,
                },
                requireUserVerification: true,
            };

            const verification = await verifyAuthenticationResponse(opts);

            if (!verification.verified || !verification.authenticationInfo) {
                throw new WebAuthnError(
                    "Authentication verification failed",
                    "VERIFICATION_FAILED"
                );
            }

            // Mark challenge as used
            await AuthChallengeModel.markUsed(challenge.id);

            // Update credential counter and last used timestamp
            await WebAuthnCredentialModel.updateCounter(
                storedCredential.credential_id,
                BigInt(verification.authenticationInfo.newCounter)
            );

            return {
                verified: true,
                userId: storedCredential.user_id,
                credentialId: storedCredential.credential_id,
            };
        } catch (error) {
            if (error instanceof WebAuthnError) {
                throw error;
            }
            throw new WebAuthnError(
                "Authentication verification failed",
                "VERIFICATION_ERROR"
            );
        }
    }

    /**
     * Clean up expired challenges (should be called periodically)
     */
    static async cleanupExpiredChallenges(): Promise<number> {
        return await AuthChallengeModel.cleanupExpired();
    }
}
