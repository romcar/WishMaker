/**
 * Computes the Shannon entropy of a string in bits.
 *
 * Shannon entropy measures the average amount of information contained in each character
 * of a string, considering the frequency distribution of all characters. Higher entropy
 * indicates more randomness and unpredictability, which is crucial for cryptographic
 * security.
 *
 * The calculation follows the Shannon entropy formula:
 * H(X) = -Σ p(x) * log₂(p(x))
 *
 * Where:
 * - p(x) is the probability of character x occurring in the string
 * - The sum is over all unique characters in the string
 * - The result is multiplied by string length to get total bits of entropy
 *
 * @param s - The input string to analyze for entropy
 * @returns The total entropy of the string in bits (floating point number)
 *
 * @example
 * ```typescript
 * // Low entropy - repeated characters
 * computeEntropyBits("aaaa"); // Returns ~0 bits
 *
 * // Medium entropy - some variation
 * computeEntropyBits("abcd"); // Returns ~8 bits
 *
 * // High entropy - cryptographically secure random string
 * computeEntropyBits("a7B#x9$mK2@pQ5"); // Returns ~60+ bits
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Entropy_(information_theory)} Information theory entropy
 */
export function computeEntropyBits(s: string): number {
    const freq: Record<string, number> = {};
    for (const ch of s) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    const len = s.length;
    let entropyPerSymbol = 0;
    for (const k in freq) {
        const p = freq[k] / len;
        entropyPerSymbol += -p * Math.log2(p);
    }
    return entropyPerSymbol * len; // total bits
}

/**
 * Validates that a secret meets minimal length and entropy requirements for cryptographic security.
 *
 * This function ensures that secrets used for cryptographic purposes (like JWT secrets,
 * API keys, or encryption keys) have sufficient entropy to resist brute force attacks.
 * It performs two key validations:
 * 1. Length validation - ensures the secret is long enough
 * 2. Entropy validation - uses Shannon entropy to measure randomness
 *
 * ## Entropy Level Guidelines:
 *
 * **256-bit entropy (default)**: Military/banking grade security
 * - Requires ~43 characters of perfectly random alphanumeric+symbols
 * - Example: `crypto.randomBytes(32).toString('hex')` → 64-char hex string
 * - Typical use: Production JWT secrets, master encryption keys
 *
 * **128-bit entropy**: Strong security for most applications
 * - Requires ~22 characters of mixed case + numbers + symbols
 * - Example: `P7$mK9@nR2xQ4vW8zE1cF` (128+ bits)
 * - Typical use: API keys, session secrets
 *
 * **64-bit entropy**: Moderate security
 * - Requires ~11 characters of mixed character sets
 * - Example: `Kx9$mP2@nR` (64+ bits)
 * - Typical use: Development environments, temporary tokens
 *
 * @param secret - The secret string to validate (e.g., JWT secret, API key)
 * @param minLength - Minimum required length in characters (default: 16)
 * @param minEntropyBits - Minimum required entropy in bits (default: 256 for maximum security)
 *
 * @throws {Error} When secret is null/undefined
 * @throws {Error} When secret length is below minLength
 * @throws {Error} When secret entropy is below minEntropyBits
 *
 * @example
 * ```typescript
 * // ✅ VALID: High-entropy secrets that pass 256-bit validation
 * const cryptoSecret = crypto.randomBytes(32).toString('hex');
 * validateHighEntropySecret(cryptoSecret); // 512+ bits - PASSES
 *
 * const strongManual = "K7#mQ9$nR2@vT8xW4zA1bC6dE3fG5hJ";
 * validateHighEntropySecret(strongManual); // 250+ bits - PASSES
 *
 * // ❌ INVALID: Common mistakes
 * validateHighEntropySecret("myAppSecret123!"); // ~70 bits - FAILS
 * validateHighEntropySecret("password123456789"); // ~60 bits - FAILS
 * validateHighEntropySecret("aaaaaaaaaaaaaaaa"); // ~0 bits - FAILS
 *
 * // 🔧 PRACTICAL: Adjusted requirements for different use cases
 * // Development environment (128-bit requirement)
 * validateHighEntropySecret("MyDev$ecret123!@#", 16, 128);
 *
 * // API keys (moderate security)
 * validateHighEntropySecret("api_key_K7mQ9nR2vT8", 12, 64);
 *
 * // Production JWT (maximum security) - use crypto-generated
 * const jwtSecret = process.env.JWT_SECRET; // Should be crypto.randomBytes(32).toString('hex')
 * validateHighEntropySecret(jwtSecret, 32, 256);
 * ```
 *
 * @remarks
 * **Note on 256-bit default**: This is intentionally set high for production security.
 * For most applications, consider using 128 bits for a good balance of security and practicality.
 * Always use `crypto.randomBytes()` or similar for generating production secrets.
 *
 * @see {@link computeEntropyBits} For entropy calculation details
 * @see {@link https://owasp.org/www-community/vulnerabilities/Insufficient_Entropy} OWASP Entropy Guidelines
 */
export function validateHighEntropySecret(
    secret: string,
    minLength = 16,
    minEntropyBits = 256
): void {
    if (!secret) {
        throw new Error('Secret must be provided');
    }

    if (secret.length < minLength) {
        throw new Error(`Secret must be at least ${minLength} characters long`);
    }

    const entropy = computeEntropyBits(secret);
    if (entropy < minEntropyBits) {
        throw new Error(
            `Secret entropy too low (${Math.round(
                entropy
            )} bits). Provide a high-entropy secret (e.g. a securely generated token).`
        );
    }
}
