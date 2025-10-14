import { Metric, ReportHandler } from "web-vitals";
import { getWebVitalsRating } from "./utils/webVitalsRating";

// Enhanced Web Vitals reporting with detailed console logging and analytics
// Only active in development environments
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
    // Run in development OR when testing locally (even production builds)
    // Hidden only in actual deployed production environments
    const isLocalEnvironment =
        typeof window !== "undefined" &&
        ((): boolean => {
            const host = window.location.hostname;
            // Match exact localhost variants and private IPv4 ranges:
            // - localhost or IPv6 ::1
            // - 127.0.0.1
            // - 10.x.x.x
            // - 192.168.x.x
            // - 172.16.0.0 to 172.31.255.255
            const privateHostRegex =
                /^(?:localhost|::1|0.0.0.0|127(?:.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){3}|10(?:.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){3}|192.168(?:.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){2}|172.(?:1[6-9]|2\d|3[0-1])(?:.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){2})(?::\d+)?$/;
            return privateHostRegex.test(host);
        })();

    const isDevelopment =
        process.env.NODE_ENV === "development" || isLocalEnvironment;

    if (!isDevelopment) {
        return;
    }

    // Default handler that provides detailed console reporting
    const defaultHandler = (metric: Metric) => {
        const { name, value, delta } = metric;

        // Determine rating using shared utility for consistent thresholds
        const rating = getWebVitalsRating(name, value);

        // Color coding based on rating
        const color =
            rating === "good"
                ? "🟢"
                : rating === "needs-improvement"
                ? "🟡"
                : "🔴";

        console.group(`${color} Web Vitals Report - ${name}`);
        console.log(
            `Value: ${Math.round(value * 1000) / 1000}${name === "CLS" ? "" : "ms"}`
        );
        console.log(`Rating: ${rating}`);
        console.log(
            `Delta: ${Math.round(delta * 1000) / 1000}${name === "CLS" ? "" : "ms"}`
        );
        console.log(`Timestamp: ${new Date().toISOString()}`);

        // Metric-specific guidance
        switch (name) {
            case "CLS":
                console.log(
                    "📏 Cumulative Layout Shift - Measures visual stability"
                );
                console.log(
                    "Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25"
                );
                break;
            case "FID":
                console.log("⚡ First Input Delay - Measures interactivity");
                console.log(
                    "Good: < 100ms, Needs improvement: 100-300ms, Poor: > 300ms"
                );
                break;
            case "FCP":
                console.log("🎨 First Contentful Paint - Measures loading");
                console.log(
                    "Good: < 1.8s, Needs improvement: 1.8-3s, Poor: > 3s"
                );
                break;
            case "LCP":
                console.log("📸 Largest Contentful Paint - Measures loading");
                console.log(
                    "Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s"
                );
                break;
            case "TTFB":
                console.log("🌐 Time to First Byte - Measures server response");
                console.log(
                    "Good: < 800ms, Needs improvement: 800-1800ms, Poor: > 1800ms"
                );
                break;
        }
        console.groupEnd();

        // Call custom handler if provided
        if (onPerfEntry && onPerfEntry instanceof Function) {
            onPerfEntry(metric);
        }
    };

    // Load and measure all Core Web Vitals
    if (typeof window !== "undefined") {
        import("web-vitals").then(
            ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                console.log("🚀 Starting Web Vitals measurement...");

                getCLS(defaultHandler);
                getFID(defaultHandler);
                getFCP(defaultHandler);
                getLCP(defaultHandler);
                getTTFB(defaultHandler);

                // Summary report after a delay to capture most metrics
                setTimeout(() => {
                    console.log(
                        "📊 Web Vitals measurement complete. Check individual metric reports above."
                    );
                }, 3000);
            }
        );
    }
};

export default reportWebVitals;
