import { Metric, ReportHandler } from "web-vitals";

// Enhanced Web Vitals reporting with detailed console logging and analytics
// Only active in development environments
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
    // Run in development OR when testing locally (even production builds)
    // Hidden only in actual deployed production environments
    const isLocalEnvironment =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.includes("192.168.") ||
            window.location.hostname.includes("10.0.") ||
            window.location.hostname.includes("172.16."));

    const isDevelopment =
        process.env.NODE_ENV === "development" || isLocalEnvironment;

    if (!isDevelopment) {
        return;
    }

    // Default handler that provides detailed console reporting
    const defaultHandler = (metric: Metric) => {
        const { name, value, delta } = metric;

        // Determine rating based on metric thresholds (web-vitals v2 compatibility)
        const getRating = (
            name: string,
            value: number
        ): "good" | "needs-improvement" | "poor" => {
            switch (name) {
                case "CLS":
                    return value < 0.1
                        ? "good"
                        : value < 0.25
                        ? "needs-improvement"
                        : "poor";
                case "FID":
                    return value < 100
                        ? "good"
                        : value < 300
                        ? "needs-improvement"
                        : "poor";
                case "FCP":
                    return value < 1800
                        ? "good"
                        : value < 3000
                        ? "needs-improvement"
                        : "poor";
                case "LCP":
                    return value < 2500
                        ? "good"
                        : value < 4000
                        ? "needs-improvement"
                        : "poor";
                case "TTFB":
                    return value < 800
                        ? "good"
                        : value < 1800
                        ? "needs-improvement"
                        : "poor";
                default:
                    return "needs-improvement";
            }
        };

        const rating = getRating(name, value);

        // Color coding based on rating
        const color =
            rating === "good"
                ? "🟢"
                : rating === "needs-improvement"
                ? "🟡"
                : "🔴";

        console.group(`${color} Web Vitals Report - ${name}`);
        console.log(`Value: ${Math.round(value * 1000) / 1000}ms`);
        console.log(`Rating: ${rating}`);
        console.log(`Delta: ${Math.round(delta * 1000) / 1000}ms`);
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
