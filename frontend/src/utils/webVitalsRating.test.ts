/**
 * Unit tests for webVitalsRating utility
 *
 * Tests the getWebVitalsRating function to ensure it correctly rates
 * Web Vitals metrics according to Core Web Vitals guidelines.
 */

import {
    getWebVitalsRating,
    WEB_VITALS_THRESHOLDS,
    type WebVitalsRating,
} from "./webVitalsRating";

describe("getWebVitalsRating", () => {
    describe("CLS (Cumulative Layout Shift)", () => {
        test("should return 'good' for CLS values below 0.1", () => {
            expect(getWebVitalsRating("CLS", 0)).toBe("good");
            expect(getWebVitalsRating("CLS", 0.05)).toBe("good");
            expect(getWebVitalsRating("CLS", 0.09)).toBe("good");
        });

        test("should return 'needs-improvement' for CLS values between 0.1 and 0.25", () => {
            expect(getWebVitalsRating("CLS", 0.1)).toBe("needs-improvement");
            expect(getWebVitalsRating("CLS", 0.15)).toBe("needs-improvement");
            expect(getWebVitalsRating("CLS", 0.24)).toBe("needs-improvement");
        });

        test("should return 'poor' for CLS values 0.25 and above", () => {
            expect(getWebVitalsRating("CLS", 0.25)).toBe("poor");
            expect(getWebVitalsRating("CLS", 0.3)).toBe("poor");
            expect(getWebVitalsRating("CLS", 0.5)).toBe("poor");
        });
    });

    describe("FID (First Input Delay)", () => {
        test("should return 'good' for FID values below 100ms", () => {
            expect(getWebVitalsRating("FID", 0)).toBe("good");
            expect(getWebVitalsRating("FID", 50)).toBe("good");
            expect(getWebVitalsRating("FID", 99)).toBe("good");
        });

        test("should return 'needs-improvement' for FID values between 100ms and 300ms", () => {
            expect(getWebVitalsRating("FID", 100)).toBe("needs-improvement");
            expect(getWebVitalsRating("FID", 200)).toBe("needs-improvement");
            expect(getWebVitalsRating("FID", 299)).toBe("needs-improvement");
        });

        test("should return 'poor' for FID values 300ms and above", () => {
            expect(getWebVitalsRating("FID", 300)).toBe("poor");
            expect(getWebVitalsRating("FID", 400)).toBe("poor");
            expect(getWebVitalsRating("FID", 1000)).toBe("poor");
        });
    });

    describe("FCP (First Contentful Paint)", () => {
        test("should return 'good' for FCP values below 1800ms", () => {
            expect(getWebVitalsRating("FCP", 0)).toBe("good");
            expect(getWebVitalsRating("FCP", 1200)).toBe("good");
            expect(getWebVitalsRating("FCP", 1799)).toBe("good");
        });

        test("should return 'needs-improvement' for FCP values between 1800ms and 3000ms", () => {
            expect(getWebVitalsRating("FCP", 1800)).toBe("needs-improvement");
            expect(getWebVitalsRating("FCP", 2400)).toBe("needs-improvement");
            expect(getWebVitalsRating("FCP", 2999)).toBe("needs-improvement");
        });

        test("should return 'poor' for FCP values 3000ms and above", () => {
            expect(getWebVitalsRating("FCP", 3000)).toBe("poor");
            expect(getWebVitalsRating("FCP", 3500)).toBe("poor");
            expect(getWebVitalsRating("FCP", 5000)).toBe("poor");
        });
    });

    describe("LCP (Largest Contentful Paint)", () => {
        test("should return 'good' for LCP values below 2500ms", () => {
            expect(getWebVitalsRating("LCP", 0)).toBe("good");
            expect(getWebVitalsRating("LCP", 2000)).toBe("good");
            expect(getWebVitalsRating("LCP", 2499)).toBe("good");
        });

        test("should return 'needs-improvement' for LCP values between 2500ms and 4000ms", () => {
            expect(getWebVitalsRating("LCP", 2500)).toBe("needs-improvement");
            expect(getWebVitalsRating("LCP", 3200)).toBe("needs-improvement");
            expect(getWebVitalsRating("LCP", 3999)).toBe("needs-improvement");
        });

        test("should return 'poor' for LCP values 4000ms and above", () => {
            expect(getWebVitalsRating("LCP", 4000)).toBe("poor");
            expect(getWebVitalsRating("LCP", 5000)).toBe("poor");
            expect(getWebVitalsRating("LCP", 10000)).toBe("poor");
        });
    });

    describe("TTFB (Time to First Byte)", () => {
        test("should return 'good' for TTFB values below 800ms", () => {
            expect(getWebVitalsRating("TTFB", 0)).toBe("good");
            expect(getWebVitalsRating("TTFB", 500)).toBe("good");
            expect(getWebVitalsRating("TTFB", 799)).toBe("good");
        });

        test("should return 'needs-improvement' for TTFB values between 800ms and 1800ms", () => {
            expect(getWebVitalsRating("TTFB", 800)).toBe("needs-improvement");
            expect(getWebVitalsRating("TTFB", 1200)).toBe("needs-improvement");
            expect(getWebVitalsRating("TTFB", 1799)).toBe("needs-improvement");
        });

        test("should return 'poor' for TTFB values 1800ms and above", () => {
            expect(getWebVitalsRating("TTFB", 1800)).toBe("poor");
            expect(getWebVitalsRating("TTFB", 2000)).toBe("poor");
            expect(getWebVitalsRating("TTFB", 3000)).toBe("poor");
        });
    });

    describe("Unknown metrics", () => {
        test("should throw an error for unknown metric names", () => {
            expect(() => getWebVitalsRating("UNKNOWN", 100)).toThrow();
            expect(() => getWebVitalsRating("", 500)).toThrow();
            expect(() => getWebVitalsRating("INVALID_METRIC", 1000)).toThrow();
        });

        test("should throw an error for case-sensitive metric names", () => {
            expect(() => getWebVitalsRating("cls", 0.05)).toThrow();
            expect(() => getWebVitalsRating("lcp", 2000)).toThrow();
        });
    });

    describe("Edge cases", () => {
        test("should handle exact threshold values correctly", () => {
            // Test exact threshold boundaries
            expect(getWebVitalsRating("CLS", 0.1)).toBe("needs-improvement");
            expect(getWebVitalsRating("CLS", 0.25)).toBe("poor");
            expect(getWebVitalsRating("FID", 100)).toBe("needs-improvement");
            expect(getWebVitalsRating("FID", 300)).toBe("poor");
        });

        test("should handle negative values", () => {
            expect(getWebVitalsRating("LCP", -100)).toBe("good");
            expect(getWebVitalsRating("TTFB", -50)).toBe("good");
        });

        test("should handle very large values", () => {
            expect(getWebVitalsRating("LCP", Number.MAX_VALUE)).toBe("poor");
            expect(getWebVitalsRating("FCP", 999999)).toBe("poor");
        });

        test("should handle decimal values correctly", () => {
            expect(getWebVitalsRating("CLS", 0.099)).toBe("good");
            expect(getWebVitalsRating("CLS", 0.101)).toBe("needs-improvement");
            expect(getWebVitalsRating("FID", 99.9)).toBe("good");
            expect(getWebVitalsRating("FID", 100.1)).toBe("needs-improvement");
        });
    });
});

describe("WEB_VITALS_THRESHOLDS", () => {
    test("should contain correct threshold values", () => {
        expect(WEB_VITALS_THRESHOLDS.CLS).toEqual({ good: 0.1, poor: 0.25 });
        expect(WEB_VITALS_THRESHOLDS.FID).toEqual({ good: 100, poor: 300 });
        expect(WEB_VITALS_THRESHOLDS.FCP).toEqual({ good: 1800, poor: 3000 });
        expect(WEB_VITALS_THRESHOLDS.LCP).toEqual({ good: 2500, poor: 4000 });
        expect(WEB_VITALS_THRESHOLDS.TTFB).toEqual({ good: 800, poor: 1800 });
    });

    test("should be immutable object structure", () => {
        // Test that the thresholds object has the expected structure
        expect(typeof WEB_VITALS_THRESHOLDS).toBe("object");
        expect(WEB_VITALS_THRESHOLDS).toBeDefined();

        // Test that all metric thresholds exist
        const expectedMetrics = ["CLS", "FID", "FCP", "LCP", "TTFB"];
        expectedMetrics.forEach((metric) => {
            expect(WEB_VITALS_THRESHOLDS).toHaveProperty(metric);
            expect(
                WEB_VITALS_THRESHOLDS[
                    metric as keyof typeof WEB_VITALS_THRESHOLDS
                ]
            ).toHaveProperty("good");
            expect(
                WEB_VITALS_THRESHOLDS[
                    metric as keyof typeof WEB_VITALS_THRESHOLDS
                ]
            ).toHaveProperty("poor");
        });
    });
});

describe("WebVitalsRating type", () => {
    test("should accept valid rating values", () => {
        const goodRating: WebVitalsRating = "good";
        const needsImprovementRating: WebVitalsRating = "needs-improvement";
        const poorRating: WebVitalsRating = "poor";

        expect(goodRating).toBe("good");
        expect(needsImprovementRating).toBe("needs-improvement");
        expect(poorRating).toBe("poor");
    });
});
