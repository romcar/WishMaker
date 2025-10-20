import React from 'react';
import { isGitHubPages } from '../services/mock-api';
import './DemoBanner.css';

const DemoBanner: React.FC = () => {
    if (!isGitHubPages) return null;

    return (
        <div className="demo-banner">
            <div className="demo-banner-content">
                <span className="demo-icon">🎭</span>
                <span className="demo-text">
                    <strong>Demo Mode</strong> - This is a demonstration running on GitHub Pages with mock data
                </span>
                <a 
                    href="https://github.com/romcar/WishMaker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="demo-link"
                >
                    View Source Code
                </a>
            </div>
        </div>
    );
};

export default DemoBanner;