import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("iLoveToolHub Crash Log:", error, errorInfo);
    }

    handleRestart = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <h1>Oops! Something went wrong.</h1>
                        <p>
                            iLoveToolHub encountered an unexpected error. Don't worry, your files are safe (they stay in your browser).
                        </p>
                        <div className="error-actions">
                            <button onClick={this.handleRestart} className="btn-restart">
                                Back to Home
                            </button>
                            <button onClick={() => window.location.reload()} className="btn-reload">
                                Try Reloading
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Technical Details</summary>
                                <pre>{this.state.error?.toString()}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
