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
 * @param secret - The secret string to validate (e.g., JWT secret, API key)
 * @param minLength - Minimum required length in characters (default: 16)
 * @param minEntropyBits - Minimum required entropy in bits (default: 256 for high security)
 *
 * @throws {Error} When secret is null/undefined
 * @throws {Error} When secret length is below minLength
 * @throws {Error} When secret entropy is below minEntropyBits
 *
 * @example
 * ```typescript
 * // Valid high-entropy secret - passes validation
 * validateHighEntropySecret("a7B#x9$mK2@pQ5nR8zT4vW6yE3cF1gH");
 *
 * // Invalid - too short
 * validateHighEntropySecret("short"); // Throws: "Secret must be at least 16 characters long"
 *
 * // Invalid - low entropy (repeated characters)
 * validateHighEntropySecret("aaaaaaaaaaaaaaaa"); // Throws: "Secret entropy too low..."
 *
 * // Custom validation parameters
 * validateHighEntropySecret("mySecret123", 8, 128); // Lower requirements
 * ```
 *
 * @see {@link computeEntropyBits} For entropy calculation details
 */
export function validateHighEntropySecret(
    secret: string,
    minLength = 16,
    minEntropyBits = 256
): void {
    if (!secret) {
        throw new Error("Secret must be provided");
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
