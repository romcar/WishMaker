/**
 * Web Vitals Rating Utility
 *
 * Provides consistent threshold-based rating for Web Vitals metrics
 * following Core Web Vitals guidelines and web-vitals v2 compatibility.
 */

export type WebVitalsRating = "good" | "needs-improvement" | "poor";

// Add explicit union type for metric names for compile-time safety
export type WebVitalName = "CLS" | "FID" | "FCP" | "LCP" | "TTFB";

/**
 * Determines the rating for a Web Vitals metric based on Core Web Vitals thresholds.
 *
 * @param name - The metric name (CLS, FID, FCP, LCP, TTFB)
 * @param value - The metric value to evaluate
 * @returns The rating: "good", "needs-improvement", or "poor"
 *
 * @example
 * ```typescript
 * const rating = getWebVitalsRating("LCP", 1500); // "good"
 * const rating = getWebVitalsRating("CLS", 0.15); // "needs-improvement"
 * ```
 */
export const getWebVitalsRating = (
    name: WebVitalName,
    value: number
): WebVitalsRating => {
    // runtime validation for JS consumers or unexpected values
    if (!(name in WEB_VITALS_THRESHOLDS)) {
        throw new TypeError(`Unknown web vital metric: ${name}`);
    }

    const thresholds = WEB_VITALS_THRESHOLDS[name];

    if (value < thresholds.good) {
        return "good";
    }

    if (value < thresholds.poor) {
        return "needs-improvement";
    }

    return "poor";
};

/**
 * Web Vitals metric thresholds for reference
 * Based on Core Web Vitals guidelines
 */
export const WEB_VITALS_THRESHOLDS = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
} as const;
