import React, { useEffect, useState } from "react";
import { Metric } from "web-vitals";
import "./DeveloperToolbar.css";

interface WebVitalsMetric {
    name: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
    timestamp: string;
}

interface EnvironmentInfo {
    nodeEnv: string;
    reactVersion: string;
    userAgent: string;
    viewport: string;
    url: string;
}

const DeveloperToolbar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [metrics, setMetrics] = useState<WebVitalsMetric[]>([]);
    const [activeTab, setActiveTab] = useState<"vitals" | "environment">(
        "vitals"
    );
    const [environmentInfo, setEnvironmentInfo] = useState<EnvironmentInfo>({
        nodeEnv: process.env.NODE_ENV || "unknown",
        reactVersion: React.version,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
    });

    // Show in development OR when testing locally (even production builds)
    // Hidden only in actual deployed production environments
    const isLocalEnvironment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("192.168.") ||
        window.location.hostname.includes("10.0.") ||
        window.location.hostname.includes("172.16.");

    const isDevelopment =
        process.env.NODE_ENV === "development" ||
        (isLocalEnvironment &&
            (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1" ||
                window.location.hostname.includes("192.168.") ||
                window.location.hostname.includes("10.0.") ||
                window.location.hostname.includes("172.16.")));

    useEffect(() => {
        if (!isDevelopment) return;

        // Update viewport on resize
        const handleResize = () => {
            setEnvironmentInfo((prev) => ({
                ...prev,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isDevelopment]);

    useEffect(() => {
        if (!isDevelopment) return;

        const handleWebVitals = (metric: Metric) => {
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

            const newMetric: WebVitalsMetric = {
                name: metric.name,
                value: Math.round(metric.value * 1000) / 1000,
                rating: getRating(metric.name, metric.value),
                timestamp: new Date().toLocaleTimeString(),
            };

            setMetrics((prev) => {
                const filtered = prev.filter((m) => m.name !== metric.name);
                return [...filtered, newMetric];
            });
        };

        // Load web vitals
        import("web-vitals").then(
            ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(handleWebVitals);
                getFID(handleWebVitals);
                getFCP(handleWebVitals);
                getLCP(handleWebVitals);
                getTTFB(handleWebVitals);
            }
        );
    }, [isDevelopment]);

    // Don't render in production
    if (!isDevelopment) {
        return null;
    }

    const getRatingEmoji = (rating: string) => {
        switch (rating) {
            case "good":
                return "🟢";
            case "needs-improvement":
                return "🟡";
            case "poor":
                return "🔴";
            default:
                return "⚪";
        }
    };

    if (!isVisible) {
        return (
            <div className="dev-toolbar-collapsed">
                <button
                    onClick={() => setIsVisible(true)}
                    className="dev-toolbar-toggle"
                    title="Open Developer Toolbar"
                >
                    🛠️ Dev Tools
                </button>
            </div>
        );
    }

    return (
        <div className="dev-toolbar">
            <div className="dev-toolbar-header">
                <div className="dev-toolbar-tabs">
                    <button
                        className={`dev-toolbar-tab ${
                            activeTab === "vitals" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("vitals")}
                    >
                        📊 Web Vitals ({metrics.length})
                    </button>
                    <button
                        className={`dev-toolbar-tab ${
                            activeTab === "environment" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("environment")}
                    >
                        🔧 Environment
                    </button>
                </div>
                <div className="dev-toolbar-actions">
                    <button
                        onClick={() => setMetrics([])}
                        className="dev-toolbar-button"
                        title="Clear Web Vitals"
                    >
                        🗑️
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="dev-toolbar-close"
                        title="Close Developer Toolbar"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="dev-toolbar-content">
                {activeTab === "vitals" && (
                    <div className="dev-toolbar-panel">
                        {metrics.length === 0 ? (
                            <div className="dev-toolbar-empty">
                                🔄 Measuring Web Vitals... Interact with the
                                page to capture all metrics.
                            </div>
                        ) : (
                            <div className="dev-vitals-grid">
                                {metrics.map((metric, index) => (
                                    <div
                                        key={index}
                                        className="dev-vitals-card"
                                    >
                                        <div className="dev-vitals-header">
                                            <span className="dev-vitals-emoji">
                                                {getRatingEmoji(metric.rating)}
                                            </span>
                                            <span className="dev-vitals-name">
                                                {metric.name}
                                            </span>
                                            <span
                                                className={`dev-vitals-value ${metric.rating}`}
                                            >
                                                {metric.value}
                                                {metric.name === "CLS"
                                                    ? ""
                                                    : "ms"}
                                            </span>
                                        </div>
                                        <div className="dev-vitals-timestamp">
                                            {metric.timestamp}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "environment" && (
                    <div className="dev-toolbar-panel">
                        <div className="dev-env-grid">
                            <div className="dev-env-item">
                                <span className="dev-env-label">
                                    Environment:
                                </span>
                                <span className="dev-env-value">
                                    {environmentInfo.nodeEnv}
                                </span>
                            </div>
                            <div className="dev-env-item">
                                <span className="dev-env-label">
                                    React Version:
                                </span>
                                <span className="dev-env-value">
                                    {environmentInfo.reactVersion}
                                </span>
                            </div>
                            <div className="dev-env-item">
                                <span className="dev-env-label">Viewport:</span>
                                <span className="dev-env-value">
                                    {environmentInfo.viewport}
                                </span>
                            </div>
                            <div className="dev-env-item">
                                <span className="dev-env-label">URL:</span>
                                <span className="dev-env-value dev-env-url">
                                    {environmentInfo.url}
                                </span>
                            </div>
                            <div className="dev-env-item">
                                <span className="dev-env-label">
                                    User Agent:
                                </span>
                                <span className="dev-env-value dev-env-ua">
                                    {environmentInfo.userAgent}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperToolbar;
