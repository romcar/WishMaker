// Authentication Database Models
// This file contains all database interaction methods for authentication

import pool from "../db/pool";
import {
    AuthChallenge,
    AuthSession,
    AuthenticatorTransport,
    CreateUserInput,
    SecurityEvent,
    TwoFactorBackup,
    User,
    UserPreferences,
    UserQueryResult,
    WebAuthnCredential,
    WebAuthnCredentialQueryResult,
} from "../types/auth.types";

export class UserModel {
    /**
     * Create a new user
     */
    static async create(userData: CreateUserInput): Promise<User> {
        const query = `
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

        const values = [
            userData.username,
            userData.email,
            userData.password_hash || userData.password, // Support both field names
            userData.display_name || null,
        ];

        const result = await pool.query<UserQueryResult>(query, values);
        return this.mapUserResult(result.rows[0]);
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query<UserQueryResult>(query, [email]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapUserResult(result.rows[0]);
    }

    /**
     * Find user by ID
     */
    static async findById(id: number): Promise<User | null> {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query<UserQueryResult>(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapUserResult(result.rows[0]);
    }

    /**
     * Find user by username
     */
    static async findByUsername(username: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE username = $1";
        const result = await pool.query<UserQueryResult>(query, [username]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapUserResult(result.rows[0]);
    }

    /**
     * Update user's last login timestamp
     */
    static async updateLastLogin(userId: number): Promise<void> {
        const query = `
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
        await pool.query(query, [userId]);
    }

    /**
     * Update failed login attempts
     */
    static async updateFailedLoginAttempts(
        userId: number,
        attempts: number
    ): Promise<void> {
        const query = `
      UPDATE users
      SET failed_login_attempts = $1,
          account_locked_until = CASE
            WHEN $1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
            ELSE NULL
          END
      WHERE id = $2
    `;
        await pool.query(query, [attempts, userId]);
    }

    /**
     * Enable/disable two-factor authentication
     */
    static async updateTwoFactorEnabled(
        userId: number,
        enabled: boolean
    ): Promise<void> {
        const query = `
      UPDATE users
      SET two_factor_enabled = $1,
          backup_codes_generated = CASE WHEN $1 = false THEN false ELSE backup_codes_generated END
      WHERE id = $2
    `;
        await pool.query(query, [enabled, userId]);
    }

    /**
     * Verify email address
     */
    static async verifyEmail(userId: number): Promise<void> {
        const query = "UPDATE users SET email_verified = true WHERE id = $1";
        await pool.query(query, [userId]);
    }

    /**
     * Check if user exists by email or username
     */
    static async exists(
        email: string,
        username: string
    ): Promise<{ emailExists: boolean; usernameExists: boolean }> {
        const query = `
      SELECT
        COUNT(*) FILTER (WHERE email = $1) as email_count,
        COUNT(*) FILTER (WHERE username = $2) as username_count
      FROM users
    `;

        const result = await pool.query(query, [email, username]);
        const row = result.rows[0];

        return {
            emailExists: parseInt(row.email_count) > 0,
            usernameExists: parseInt(row.username_count) > 0,
        };
    }

    /**
     * Generic update method for users
     */
    static async update(
        userId: number,
        updateData: Partial<Omit<User, "id" | "created_at" | "updated_at">>
    ): Promise<User> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount + 1}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const query = `
            UPDATE users
            SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const result = await pool.query<UserQueryResult>(query, [
            userId,
            ...values,
        ]);
        return this.mapUserResult(result.rows[0]);
    }

    /**
     * Map database result to User interface
     */
    private static mapUserResult(row: UserQueryResult): User {
        return {
            ...row,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            last_login_at: row.last_login_at
                ? new Date(row.last_login_at)
                : undefined,
            account_locked_until: row.account_locked_until
                ? new Date(row.account_locked_until)
                : undefined,
        };
    }
}

export class WebAuthnCredentialModel {
    /**
     * Create a new WebAuthn credential
     */
    static async create(
        credentialData: Omit<
            WebAuthnCredential,
            "id" | "created_at" | "last_used_at"
        >
    ): Promise<WebAuthnCredential> {
        const query = `
      INSERT INTO webauthn_credentials (
        user_id, credential_id, public_key, counter, device_type,
        transports, backup_eligible, backup_state, attestation_type,
        aaguid, device_name, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

        const values = [
            credentialData.user_id,
            credentialData.credential_id,
            credentialData.public_key,
            credentialData.counter.toString(),
            credentialData.device_type,
            credentialData.transports,
            credentialData.backup_eligible,
            credentialData.backup_state,
            credentialData.attestation_type,
            credentialData.aaguid || null,
            credentialData.device_name || null,
            credentialData.is_active,
        ];

        const result = await pool.query<WebAuthnCredentialQueryResult>(
            query,
            values
        );
        return this.mapCredentialResult(result.rows[0]);
    }

    /**
     * Find credential by credential ID
     */
    static async findByCredentialId(
        credentialId: string
    ): Promise<WebAuthnCredential | null> {
        const query =
            "SELECT * FROM webauthn_credentials WHERE credential_id = $1 AND is_active = true";
        const result = await pool.query<WebAuthnCredentialQueryResult>(query, [
            credentialId,
        ]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapCredentialResult(result.rows[0]);
    }

    /**
     * Find all credentials for a user
     */
    static async findByUserId(userId: number): Promise<WebAuthnCredential[]> {
        const query = `
      SELECT * FROM webauthn_credentials
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
        const result = await pool.query<WebAuthnCredentialQueryResult>(query, [
            userId,
        ]);

        return result.rows.map((row) => this.mapCredentialResult(row));
    }

    /**
     * Update credential counter (for replay attack prevention)
     */
    static async updateCounter(
        credentialId: string,
        newCounter: bigint
    ): Promise<void> {
        const query = `
      UPDATE webauthn_credentials
      SET counter = $1, last_used_at = CURRENT_TIMESTAMP
      WHERE credential_id = $2
    `;
        await pool.query(query, [newCounter.toString(), credentialId]);
    }

    /**
     * Deactivate a credential
     */
    static async deactivate(
        credentialId: string,
        userId: number
    ): Promise<void> {
        const query = `
      UPDATE webauthn_credentials
      SET is_active = false
      WHERE credential_id = $1 AND user_id = $2
    `;
        await pool.query(query, [credentialId, userId]);
    }

    /**
     * Map database result to WebAuthnCredential interface
     */
    private static mapCredentialResult(
        row: WebAuthnCredentialQueryResult
    ): WebAuthnCredential {
        return {
            ...row,
            counter: BigInt(row.counter),
            transports: row.transports as AuthenticatorTransport[],
            created_at: new Date(row.created_at),
            last_used_at: row.last_used_at
                ? new Date(row.last_used_at)
                : undefined,
        };
    }
}

export class AuthSessionModel {
    /**
     * Create a new authentication session
     */
    static async create(
        sessionData: Omit<AuthSession, "id" | "created_at" | "last_activity_at">
    ): Promise<AuthSession> {
        const query = `
      INSERT INTO auth_sessions (
        user_id, session_token, refresh_token_hash, device_fingerprint,
        ip_address, user_agent, is_active, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

        const values = [
            sessionData.user_id,
            sessionData.session_token,
            sessionData.refresh_token_hash || null,
            sessionData.device_fingerprint || null,
            sessionData.ip_address || null,
            sessionData.user_agent || null,
            sessionData.is_active,
            sessionData.expires_at,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Find session by token
     */
    static async findByToken(
        sessionToken: string
    ): Promise<AuthSession | null> {
        const query = `
      SELECT * FROM auth_sessions
      WHERE session_token = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    `;
        const result = await pool.query(query, [sessionToken]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Update session activity
     */
    static async updateActivity(sessionToken: string): Promise<void> {
        const query = `
      UPDATE auth_sessions
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE session_token = $1
    `;
        await pool.query(query, [sessionToken]);
    }

    /**
     * Invalidate session
     */
    static async invalidate(sessionToken: string): Promise<void> {
        const query = `
      UPDATE auth_sessions
      SET is_active = false
      WHERE session_token = $1
    `;
        await pool.query(query, [sessionToken]);
    }

    /**
     * Invalidate all sessions for a user
     */
    static async invalidateAllForUser(userId: number): Promise<void> {
        const query = `
      UPDATE auth_sessions
      SET is_active = false
      WHERE user_id = $1
    `;
        await pool.query(query, [userId]);
    }

    /**
     * Clean up expired sessions
     */
    static async cleanupExpired(): Promise<number> {
        const query = `
      DELETE FROM auth_sessions
      WHERE expires_at < CURRENT_TIMESTAMP OR
            (last_activity_at < CURRENT_TIMESTAMP - INTERVAL '30 days')
    `;
        const result = await pool.query(query);
        return result.rowCount || 0;
    }
}

export class SecurityEventModel {
    /**
     * Create a new security event
     */
    static async create(
        event: Omit<SecurityEvent, "id" | "created_at">
    ): Promise<SecurityEvent> {
        const query = `
            INSERT INTO security_events (user_id, event_type, ip_address, user_agent, metadata)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            event.user_id || null,
            event.event_type,
            event.ip_address || null,
            event.user_agent || null,
            event.metadata || null,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Log a security event (alias for create for backward compatibility)
     */
    static async log(
        event: Omit<SecurityEvent, "id" | "created_at">
    ): Promise<void> {
        await this.create(event);
    }

    /**
     * Get recent security events for a user
     */
    static async getRecentForUser(
        userId: number,
        limit: number = 50
    ): Promise<SecurityEvent[]> {
        const query = `
      SELECT * FROM security_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
        const result = await pool.query(query, [userId, limit]);

        return result.rows.map((row) => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null,
        }));
    }
}

export class AuthChallengeModel {
    /**
     * Create a new challenge
     */
    static async create(
        challengeData: Omit<AuthChallenge, "id" | "created_at" | "used">
    ): Promise<AuthChallenge> {
        const query = `
      INSERT INTO auth_challenges (challenge, user_id, challenge_type, origin, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

        const values = [
            challengeData.challenge,
            challengeData.user_id || null,
            challengeData.challenge_type,
            challengeData.origin,
            challengeData.expires_at,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Find and mark challenge as used
     */
    static async findAndUse(challenge: string): Promise<AuthChallenge | null> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const findQuery = `
        SELECT * FROM auth_challenges
        WHERE challenge = $1 AND used = false AND expires_at > CURRENT_TIMESTAMP
      `;
            const findResult = await client.query(findQuery, [challenge]);

            if (findResult.rows.length === 0) {
                await client.query("ROLLBACK");
                return null;
            }

            const updateQuery =
                "UPDATE auth_challenges SET used = true WHERE challenge = $1";
            await client.query(updateQuery, [challenge]);

            await client.query("COMMIT");
            return findResult.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Find challenge by challenge string
     */
    static async findByChallenge(
        challenge: string
    ): Promise<AuthChallenge | null> {
        const query = `
            SELECT * FROM auth_challenges
            WHERE challenge = $1 AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query, [challenge]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Mark a challenge as used
     */
    static async markUsed(challengeId: number): Promise<void> {
        const query = "UPDATE auth_challenges SET used = true WHERE id = $1";
        await pool.query(query, [challengeId]);
    }

    /**
     * Clean up expired challenges
     */
    static async cleanupExpired(): Promise<number> {
        const query =
            "DELETE FROM auth_challenges WHERE expires_at < CURRENT_TIMESTAMP";
        const result = await pool.query(query);
        return result.rowCount || 0;
    }
}

export class TwoFactorBackupModel {
    /**
     * Create or update two-factor backup methods for a user
     */
    static async upsert(
        userId: number,
        data: Partial<
            Omit<
                TwoFactorBackup,
                "id" | "user_id" | "created_at" | "updated_at"
            >
        >
    ): Promise<TwoFactorBackup> {
        const query = `
      INSERT INTO two_factor_backup (user_id, totp_secret, recovery_codes, recovery_codes_used)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        totp_secret = COALESCE($2, two_factor_backup.totp_secret),
        recovery_codes = COALESCE($3, two_factor_backup.recovery_codes),
        recovery_codes_used = COALESCE($4, two_factor_backup.recovery_codes_used),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

        const values = [
            userId,
            data.totp_secret || null,
            data.recovery_codes || null,
            data.recovery_codes_used || null,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Find two-factor backup data for a user
     */
    static async findByUserId(userId: number): Promise<TwoFactorBackup | null> {
        const query = "SELECT * FROM two_factor_backup WHERE user_id = $1";
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Mark a recovery code as used
     */
    static async useRecoveryCode(
        userId: number,
        codeIndex: number
    ): Promise<void> {
        const query = `
      UPDATE two_factor_backup
      SET recovery_codes_used = array_append(recovery_codes_used, $2),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
        await pool.query(query, [userId, codeIndex]);
    }

    /**
     * Delete two-factor backup data for a user
     */
    static async delete(userId: number): Promise<void> {
        const query = "DELETE FROM two_factor_backup WHERE user_id = $1";
        await pool.query(query, [userId]);
    }
}

export class UserPreferencesModel {
    /**
     * Create default preferences for a user
     */
    static async create(userId: number): Promise<UserPreferences> {
        const query = `
      INSERT INTO user_preferences (user_id)
      VALUES ($1)
      RETURNING *
    `;

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * Find preferences for a user
     */
    static async findByUserId(userId: number): Promise<UserPreferences | null> {
        const query = "SELECT * FROM user_preferences WHERE user_id = $1";
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Update user preferences
     */
    static async update(
        userId: number,
        preferences: Partial<
            Omit<
                UserPreferences,
                "id" | "user_id" | "created_at" | "updated_at"
            >
        >
    ): Promise<UserPreferences> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(preferences).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount + 1}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const query = `
      UPDATE user_preferences
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;

        const result = await pool.query(query, [userId, ...values]);
        return result.rows[0];
    }
}
