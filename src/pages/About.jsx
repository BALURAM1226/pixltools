import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function About() {
    return (
        <div className="legal-page">
            <SEO
                title="About Us – The Story Behind iLoveToolHub"
                description="Learn more about iLoveToolHub, a mission-driven platform providing free, private, and fast online utility tools for everyone, everywhere."
                canonicalPath="/about"
            />

            <header className="legal-header">
                <h1 className="legal-title">About iLoveToolHub</h1>
                <p className="legal-sub">Our mission is to simplify digital tasks through accessible, high-performance web technology.</p>
            </header>

            <div className="legal-content">
                <h2>Who We Are</h2>
                <p>iLoveToolHub is an all-in-one digital utility hub designed to provide the world with fast, free, and private online tools. Whether you're a student preparing for competitive exams, a professional optimizing images for the web, or a casual user needing a quick file conversion, we are built for you.</p>

                <h2>Why We Built This</h2>
                <p>In today's digital world, most utility tools either charge expensive subscriptions or compromise user privacy by uploading files to remote servers. We wanted to change that. iLoveToolHub leverages advanced web technologies (WASM and Client-Side JS) to process your files entirely within your own browser.</p>

                <h2>Our Core Values</h2>
                <ul>
                    <li><strong>Privacy First:</strong> Your files never touch our servers. Processing stays local on your machine.</li>
                    <li><strong>High Performance:</strong> We use the latest hardware-accelerated libraries for lightning-fast results.</li>
                    <li><strong>Zero Cost:</strong> No subscriptions, no hidden limits, and no watermarks—ever.</li>
                    <li><strong>User Centric:</strong> We design our tools to be clean, easy to navigate, and mobile-friendly.</li>
                </ul>

                <h2>The Technology</h2>
                <p>iLoveToolHub is built using React and modern Web APIs. By using WebAssembly-powered libraries like Tesseract.js (for OCR) and @imgly/background-removal (for AI tasks), we bring desktop-class power directly to your browser tab.</p>

                <p>Thank you for choosing iLoveToolHub. We are constantly working to add more tools and improve your experience.</p>
            </div>
        </div>
    );
}
