/**
 * Browser Web Vitals Reporter
 *
 * This script can be run directly in the browser console to get
 * a comprehensive Web Vitals report for the current page.
 *
 * Usage:
 * 1. Open browser developer tools (F12)
 * 2. Go to Console tab
 * 3. Paste this entire script and press Enter
 * 4. The report will be displayed in the console
 */

(function () {
    console.log("🚀 Starting Web Vitals measurement...");
    console.log("This will measure your page performance in real-time.");

    // Storage for collected metrics
    const metrics = {};
    let metricsCount = 0;
    const expectedMetrics = 5; // CLS, FID, FCP, LCP, TTFB

    // Display formatted results
    function displayResults() {
        if (metricsCount < expectedMetrics) return;

        console.log("\n📊 === WEB VITALS REPORT ===");
        console.log("Generated at:", new Date().toLocaleString());
        console.log("URL:", window.location.href);
        console.log(
            "User Agent:",
            navigator.userAgent.substring(0, 100) + "..."
        );

        // Calculate overall performance score
        let goodMetrics = 0;
        let totalMetrics = 0;

        console.log("\n🎯 CORE WEB VITALS:");

        Object.keys(metrics).forEach((name) => {
            const metric = metrics[name];
            totalMetrics++;

            let emoji, rating, threshold;

            switch (name) {
                case "CLS":
                    emoji = "📏";
                    rating =
                        metric.value < 0.1
                            ? "good"
                            : metric.value < 0.25
                            ? "needs-improvement"
                            : "poor";
                    threshold =
                        "Good: <0.1, Needs improvement: 0.1-0.25, Poor: >0.25";
                    break;
                case "FID":
                    emoji = "⚡";
                    rating =
                        metric.value < 100
                            ? "good"
                            : metric.value < 300
                            ? "needs-improvement"
                            : "poor";
                    threshold =
                        "Good: <100ms, Needs improvement: 100-300ms, Poor: >300ms";
                    break;
                case "FCP":
                    emoji = "🎨";
                    rating =
                        metric.value < 1800
                            ? "good"
                            : metric.value < 3000
                            ? "needs-improvement"
                            : "poor";
                    threshold =
                        "Good: <1.8s, Needs improvement: 1.8-3s, Poor: >3s";
                    break;
                case "LCP":
                    emoji = "📸";
                    rating =
                        metric.value < 2500
                            ? "good"
                            : metric.value < 4000
                            ? "needs-improvement"
                            : "poor";
                    threshold =
                        "Good: <2.5s, Needs improvement: 2.5-4s, Poor: >4s";
                    break;
                case "TTFB":
                    emoji = "🌐";
                    rating =
                        metric.value < 800
                            ? "good"
                            : metric.value < 1800
                            ? "needs-improvement"
                            : "poor";
                    threshold =
                        "Good: <800ms, Needs improvement: 800-1800ms, Poor: >1800ms";
                    break;
                default:
                    emoji = "📈";
                    rating = "unknown";
            }

            if (rating === "good") goodMetrics++;

            const ratingColor =
                rating === "good"
                    ? "🟢"
                    : rating === "needs-improvement"
                    ? "🟡"
                    : "🔴";
            const unit = name === "CLS" ? "" : "ms";
            const displayValue =
                name === "CLS"
                    ? metric.value.toFixed(3)
                    : Math.round(metric.value);

            console.log(
                `${emoji} ${name}: ${displayValue}${unit} ${ratingColor} (${rating})`
            );
            console.log(`   ${threshold}`);
            console.log(`   Recorded at: ${metric.timestamp}`);
            console.log("");
        });

        // Overall score
        const overallScore = Math.round((goodMetrics / totalMetrics) * 100);
        const scoreEmoji =
            overallScore >= 80 ? "🟢" : overallScore >= 60 ? "🟡" : "🔴";
        console.log(
            `${scoreEmoji} Overall Performance Score: ${overallScore}% (${goodMetrics}/${totalMetrics} metrics are good)`
        );

        // Recommendations
        console.log("\n💡 RECOMMENDATIONS:");
        if (overallScore >= 80) {
            console.log(
                "🎉 Excellent performance! Your site delivers a great user experience."
            );
        } else {
            console.log("🚀 Areas for improvement:");

            Object.keys(metrics).forEach((name) => {
                const metric = metrics[name];
                let rating;

                switch (name) {
                    case "CLS":
                        rating =
                            metric.value < 0.1
                                ? "good"
                                : metric.value < 0.25
                                ? "needs-improvement"
                                : "poor";
                        if (rating !== "good") {
                            console.log(
                                `• ${name}: Reduce layout shifts by reserving space for images and ads`
                            );
                        }
                        break;
                    case "FID":
                        rating =
                            metric.value < 100
                                ? "good"
                                : metric.value < 300
                                ? "needs-improvement"
                                : "poor";
                        if (rating !== "good") {
                            console.log(
                                `• ${name}: Reduce JavaScript execution time and optimize event handlers`
                            );
                        }
                        break;
                    case "FCP":
                        rating =
                            metric.value < 1800
                                ? "good"
                                : metric.value < 3000
                                ? "needs-improvement"
                                : "poor";
                        if (rating !== "good") {
                            console.log(
                                `• ${name}: Optimize resource loading and reduce render-blocking resources`
                            );
                        }
                        break;
                    case "LCP":
                        rating =
                            metric.value < 2500
                                ? "good"
                                : metric.value < 4000
                                ? "needs-improvement"
                                : "poor";
                        if (rating !== "good") {
                            console.log(
                                `• ${name}: Optimize largest content element (images, videos, text blocks)`
                            );
                        }
                        break;
                    case "TTFB":
                        rating =
                            metric.value < 800
                                ? "good"
                                : metric.value < 1800
                                ? "needs-improvement"
                                : "poor";
                        if (rating !== "good") {
                            console.log(
                                `• ${name}: Optimize server response time and use CDN`
                            );
                        }
                        break;
                }
            });
        }

        console.log(
            "\n📚 Learn more about Web Vitals: https://web.dev/vitals/"
        );
        console.log("📊 WishMaker Web Vitals Report Complete!");
    }

    // Metric collection handler
    function handleMetric(metric) {
        metrics[metric.name] = {
            value: metric.value,
            timestamp: new Date(
                metric.startTime + performance.timeOrigin
            ).toLocaleTimeString(),
        };
        metricsCount++;

        console.log(
            `✅ Collected ${metric.name}: ${Math.round(metric.value)}${
                metric.name === "CLS" ? "" : "ms"
            }`
        );

        // Check if we have all metrics
        if (metricsCount >= expectedMetrics) {
            setTimeout(displayResults, 100);
        }
    }

    // Load web-vitals library and start measuring
    if (typeof getCLS === "undefined") {
        // Web vitals not loaded, try to import
        const script = document.createElement("script");
        script.type = "module";
        script.innerHTML = `
      import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'https://unpkg.com/web-vitals@2/dist/web-vitals.js';

      window.webVitalsReporter = function(handler) {
        getCLS(handler);
        getFID(handler);
        getFCP(handler);
        getLCP(handler);
        getTTFB(handler);
      };

      window.webVitalsReporter(window.handleWebVitalsMetric);
    `;

        window.handleWebVitalsMetric = handleMetric;
        document.head.appendChild(script);

        console.log("📦 Loading web-vitals library...");
    } else {
        // Web vitals already available
        getCLS(handleMetric);
        getFID(handleMetric);
        getFCP(handleMetric);
        getLCP(handleMetric);
        getTTFB(handleMetric);
    }

    // Fallback timeout
    setTimeout(() => {
        if (metricsCount === 0) {
            console.log(
                "⚠️ No metrics collected yet. This is normal for some metrics that require user interaction."
            );
            console.log(
                "💡 Try interacting with the page (clicking, scrolling) and run this script again."
            );
        }
    }, 5000);
})();
