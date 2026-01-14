import React from 'react';

const Loader = ({ message = 'Loading...', size = 'medium' }) => {
    const sizeClass = {
        small: 'loader-small',
        medium: 'loader-medium',
        large: 'loader-large'
    }[size];

    return (
        <div className="loader-container">
            <div className={`loader ${sizeClass}`}>
                <div className="loader-spinner"></div>
            </div>
            {message && <p className="loader-message">{message}</p>}
        </div>
    );
};

export const FullPageLoader = ({ message = 'Initializing application...' }) => {
    return (
        <div className="fullpage-loader">
            <div className="fullpage-loader-content">
                <div className="loader-logo">🥑</div>
                <h2 className="loader-title">Avocado Classifier</h2>
                <Loader message={message} size="large" />
                <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

export const ProgressBar = ({ progress = 0, message = '' }) => {
    return (
        <div className="progress-container">
            {message && <p className="progress-message">{message}</p>}
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                >
                    <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
};

export default Loader;
