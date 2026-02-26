import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function About() {
    return (
        <div className="legal-page">
            <SEO
                title="About Us – The Mission Behind iLoveToolHub"
                description="Discover the story of iLoveToolHub. We are dedicated to providing fast, free, and private browser-based utility tools for everyone, everywhere."
                canonicalPath="/about"
            />

            <header className="legal-header">
                <span className="legal-eyebrow">The Story</span>
                <h1 className="legal-title">About iLoveToolHub</h1>
                <p className="legal-sub">Empowering users with private, high-performance web utilities since 2026.</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>Our Mission</h2>
                    <p>iLoveToolHub was born from a simple observation: the digital tools we use every day are either too expensive, cluttered with ads, or compromise our privacy by uploading data to the cloud. Our mission is to democratize high-end digital utilities by making them free, lightning-fast, and 100% private.</p>
                </section>

                <section>
                    <h2>The "Privacy-First" Philosophy</h2>
                    <p>We believe your data belongs to you. That's why we built iLoveToolHub as a <strong>browser-only platform</strong>. Unlike traditional "converter" sites, your images and documents never leave your computer. We use cutting-edge WebAssembly (WASM) technology to bring server-side power directly to your browser tab.</p>
                </section>

                <div className="about-grid">
                    <div className="about-card">
                        <h3>🔒 100% Secure</h3>
                        <p>No uploads. No storage. No data leaks. Everything happens on your device.</p>
                    </div>
                    <div className="about-card">
                        <h3>⚡ Peak Performance</h3>
                        <p>Hardware-accelerated processing for instant results on any device.</p>
                    </div>
                    <div className="about-card">
                        <h3>💸 Forever Free</h3>
                        <p>No subscriptions, no watermarks, and no hidden features behind paywalls.</p>
                    </div>
                </div>

                <section>
                    <h2>Our Technology</h2>
                    <p>By leveraging modern frameworks like React and specialized libraries like Tesseract.js (for OCR) and @imgly/background-removal (for AI tasks), we provide desktop-class performance without requiring any installation.</p>
                    <p>We are constantly evolving, adding new tools and optimizing our existing suite to ensure iLoveToolHub remains the world's most trusted utility toolkit.</p>
                </section>

                <p className="about-closing">Thank you for trusting iLoveToolHub with your digital workflow.</p>
            </div>
        </div>
    );
}
