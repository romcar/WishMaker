#!/usr/bin/env node

/**
 * Web Vitals Report Generator
 *
 * This script uses Lighthouse to generate a comprehensive Web Vitals report
 * for the WishMaker application. It measures Core Web Vitals and provides
 * detailed performance insights.
 */

const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs").promises;
const path = require("path");

class WebVitalsReporter {
    constructor(url = "http://localhost:3000") {
        this.url = url;
        this.chrome = null;
    }

    async generateReport() {
        console.log("🚀 Starting Web Vitals analysis...");
        console.log(`📊 Analyzing: ${this.url}`);

        try {
            // Launch Chrome
            this.chrome = await chromeLauncher.launch({
                chromeFlags: [
                    "--headless",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                ],
            });

            // Run Lighthouse
            const options = {
                logLevel: "info",
                output: "json",
                onlyCategories: ["performance"],
                port: this.chrome.port,
            };

            const runnerResult = await lighthouse(this.url, options);

            // Extract Web Vitals
            const { lhr } = runnerResult;
            const audits = lhr.audits;

            const webVitals = {
                // Core Web Vitals
                LCP: audits["largest-contentful-paint"]?.numericValue || 0,
                FID: audits["max-potential-fid"]?.numericValue || 0, // Estimated FID
                CLS: audits["cumulative-layout-shift"]?.numericValue || 0,

                // Additional important metrics
                FCP: audits["first-contentful-paint"]?.numericValue || 0,
                TTFB: audits["server-response-time"]?.numericValue || 0,
                Speed_Index: audits["speed-index"]?.numericValue || 0,

                // Performance score
                performance_score: lhr.categories.performance?.score * 100 || 0,
            };

            this.displayReport(webVitals);
            await this.saveReport(webVitals, lhr);

            return webVitals;
        } catch (error) {
            console.error("❌ Error generating report:", error.message);
            throw error;
        } finally {
            if (this.chrome) {
                await this.chrome.kill();
            }
        }
    }

    displayReport(metrics) {
        console.log("\n📊 WEB VITALS REPORT");
        console.log("=".repeat(50));

        // Performance Score
        const scoreColor =
            metrics.performance_score >= 90
                ? "🟢"
                : metrics.performance_score >= 50
                ? "🟡"
                : "🔴";
        console.log(
            `${scoreColor} Performance Score: ${Math.round(
                metrics.performance_score
            )}/100`
        );

        console.log("\n🎯 CORE WEB VITALS:");

        // LCP
        const lcpRating =
            metrics.LCP < 2500
                ? "🟢 Good"
                : metrics.LCP < 4000
                ? "🟡 Needs Improvement"
                : "🔴 Poor";
        console.log(
            `📸 Largest Contentful Paint: ${Math.round(
                metrics.LCP
            )}ms (${lcpRating})`
        );

        // FID (estimated)
        const fidRating =
            metrics.FID < 100
                ? "🟢 Good"
                : metrics.FID < 300
                ? "🟡 Needs Improvement"
                : "🔴 Poor";
        console.log(
            `⚡ First Input Delay (est): ${Math.round(
                metrics.FID
            )}ms (${fidRating})`
        );

        // CLS
        const clsRating =
            metrics.CLS < 0.1
                ? "🟢 Good"
                : metrics.CLS < 0.25
                ? "🟡 Needs Improvement"
                : "🔴 Poor";
        console.log(
            `📏 Cumulative Layout Shift: ${metrics.CLS.toFixed(
                3
            )} (${clsRating})`
        );

        console.log("\n📈 ADDITIONAL METRICS:");

        // FCP
        const fcpRating =
            metrics.FCP < 1800
                ? "🟢 Good"
                : metrics.FCP < 3000
                ? "🟡 Needs Improvement"
                : "🔴 Poor";
        console.log(
            `🎨 First Contentful Paint: ${Math.round(
                metrics.FCP
            )}ms (${fcpRating})`
        );

        // Speed Index
        const siRating =
            metrics.Speed_Index < 3400
                ? "🟢 Good"
                : metrics.Speed_Index < 5800
                ? "🟡 Needs Improvement"
                : "🔴 Poor";
        console.log(
            `🏃 Speed Index: ${Math.round(metrics.Speed_Index)}ms (${siRating})`
        );

        // TTFB
        const ttfbRating =
            metrics.TTFB < 800
                ? "🟢 Good"
                : metrics.TTFB < 1800
                ? "🟡 Needs Improvement"
                : "🔴 Poor";
        console.log(
            `🌐 Time to First Byte: ${Math.round(
                metrics.TTFB
            )}ms (${ttfbRating})`
        );

        console.log("\n💡 RECOMMENDATIONS:");
        if (metrics.performance_score < 90) {
            console.log(
                "• Consider optimizing images and reducing bundle size"
            );
            console.log("• Implement code splitting and lazy loading");
            console.log("• Optimize server response times");
            console.log("• Minimize layout shifts during page load");
        } else {
            console.log("• Your application has excellent performance! 🎉");
        }
    }

    async saveReport(metrics, fullReport) {
        const timestamp = new Date().toISOString();
        const reportData = {
            timestamp,
            url: this.url,
            web_vitals: metrics,
            lighthouse_version: fullReport.lighthouseVersion,
            user_agent: fullReport.userAgent,
        };

        const reportPath = path.join(
            __dirname,
            "../reports",
            `web-vitals-${Date.now()}.json`
        );

        try {
            // Ensure reports directory exists
            await fs.mkdir(path.dirname(reportPath), { recursive: true });

            // Save report
            await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`\n💾 Report saved to: ${reportPath}`);
        } catch (error) {
            console.warn("⚠️  Could not save report:", error.message);
        }
    }
}

// CLI usage
async function main() {
    const url = process.argv[2] || "http://localhost:3000";

    console.log("🔍 WishMaker Web Vitals Reporter");
    console.log("================================\n");

    const reporter = new WebVitalsReporter(url);

    try {
        await reporter.generateReport();
        console.log("\n✅ Web Vitals analysis complete!");
    } catch (error) {
        console.error("\n❌ Analysis failed:", error.message);
        console.log("\n💡 Make sure:");
        console.log("• The application is running at", url);
        console.log("• Chrome/Chromium is installed");
        console.log("• No firewall is blocking the connection");
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = WebVitalsReporter;
