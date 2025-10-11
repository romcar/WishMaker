-- Authentication System Database Schema
-- This migration adds comprehensive authentication with biometric 2FA support

-- Users table - Core user accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    display_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    backup_codes_generated BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- WebAuthn Credentials table - Biometric/Hardware keys
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL, -- Base64URL encoded
    public_key BYTEA NOT NULL, -- Raw public key bytes
    counter BIGINT NOT NULL DEFAULT 0, -- Signature counter for replay protection
    device_type VARCHAR(50) NOT NULL, -- 'platform' (biometric) or 'cross-platform' (USB key)
    transports TEXT[], -- Available transport methods (usb, nfc, ble, internal)
    backup_eligible BOOLEAN DEFAULT false, -- Can be backed up across devices
    backup_state BOOLEAN DEFAULT false, -- Currently backed up
    attestation_type VARCHAR(50) NOT NULL, -- none, basic, self, attca
    aaguid UUID, -- Authenticator Attestation GUID
    device_name VARCHAR(100), -- User-friendly name for the device
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- Authentication Sessions table - Active login sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL, -- JWT token ID or session identifier
    refresh_token_hash VARCHAR(255), -- Hashed refresh token
    device_fingerprint VARCHAR(255), -- Browser/device identifier
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Two-Factor Authentication Backup Methods
CREATE TABLE IF NOT EXISTS two_factor_backup (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    totp_secret VARCHAR(255), -- Encrypted TOTP secret for authenticator apps
    recovery_codes TEXT[], -- Array of encrypted recovery codes
    recovery_codes_used INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Indices of used codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authentication Challenges table - Temporary WebAuthn challenges
CREATE TABLE IF NOT EXISTS auth_challenges (
    id SERIAL PRIMARY KEY,
    challenge VARCHAR(255) UNIQUE NOT NULL, -- Base64URL encoded challenge
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_type VARCHAR(50) NOT NULL, -- 'registration' or 'authentication'
    origin VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Events Log table - Audit trail
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- login_success, login_fail, 2fa_enabled, etc.
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- Additional event-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences table - Authentication and security preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    require_biometric_2fa BOOLEAN DEFAULT false,
    allow_fallback_methods BOOLEAN DEFAULT true,
    session_timeout_minutes INTEGER DEFAULT 480, -- 8 hours default
    require_fresh_auth_minutes INTEGER DEFAULT 60, -- Require re-auth for sensitive operations
    email_notifications BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_active ON webauthn_credentials(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions(user_id, is_active, expires_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_auth_challenges_challenge ON auth_challenges(challenge);
CREATE INDEX IF NOT EXISTS idx_auth_challenges_expires ON auth_challenges(expires_at) WHERE used = false;

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);

-- Create trigger for updating the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_two_factor_backup_updated_at ON two_factor_backup;
CREATE TRIGGER update_two_factor_backup_updated_at
    BEFORE UPDATE ON two_factor_backup
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Insert some demo data for development (optional)
-- This creates a test user with basic settings
INSERT INTO users (username, email, password_hash, display_name, email_verified)
VALUES
    ('testuser', 'test@example.com', '$2b$10$rXrHYODNLeN3/Fm3SjLKgeFxJ6zcUSf6jKJ.zc.Dc2Q5v9mZSE1J6', 'Test User', true)
ON CONFLICT (email) DO NOTHING;

-- Insert default preferences for the test user
INSERT INTO user_preferences (user_id, require_biometric_2fa, allow_fallback_methods)
SELECT id, false, true FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Clean up expired challenges and sessions (useful for maintenance)
-- This can be run periodically or as part of a cleanup job
-- DELETE FROM auth_challenges WHERE expires_at < CURRENT_TIMESTAMP;
-- DELETE FROM auth_sessions WHERE expires_at < CURRENT_TIMESTAMP;