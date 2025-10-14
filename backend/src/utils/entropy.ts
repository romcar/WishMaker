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
 * Validates that a secret meets minimal length and entropy requirements.
 * Throws an Error with an explanatory message if validation fails.
 */
export function validateHighEntropySecret(
    secret: string,
    minLength = 16,
    minEntropyBits = 128
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
