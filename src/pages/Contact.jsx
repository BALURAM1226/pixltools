import React from 'react';
import SEO from '../components/SEO';
import './Legal.css';

export default function Contact() {
    return (
        <div className="legal-page">
            <SEO
                title="Contact Us – We'd Love to Hear From You"
                description="Have a question, feedback, or a partnership inquiry? Get in touch with the iLoveToolHub team today for support and guidance."
                canonicalPath="/contact"
                ogImage="/og/contact.png"
            />

            <header className="legal-header">
                <span className="legal-eyebrow">Get in Touch</span>
                <h1 className="legal-title">Contact iLoveToolHub</h1>
                <p className="legal-sub">Our team is here to help with any inquiries, feedback, or technical support.</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>How Can We Help?</h2>
                    <p>Whether you've encountered a bug, have an idea for a new tool, or simply want to share your experience using our platform, we value your input. Your feedback is what drives the continuous improvement of <strong>iLoveToolHub</strong>.</p>
                </section>

                <div className="contact-methods">
                    <div className="contact-card">
                        <div className="contact-icon">📧</div>
                        <div className="contact-info">
                            <h3>General Support</h3>
                            <p>For help using our tools or reporting issues.</p>
                            <a href="mailto:support@ilovetoolhub.com" className="contact-link">support@ilovetoolhub.com</a>
                        </div>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">🛡️</div>
                        <div className="contact-info">
                            <h3>Privacy Inquiries</h3>
                            <p>For questions about our data handling technology.</p>
                            <a href="mailto:privacy@ilovetoolhub.com" className="contact-link">privacy@ilovetoolhub.com</a>
                        </div>
                    </div>
                </div>

                <section>
                    <h2>Average Response Time</h2>
                    <p>We take every message seriously. Please allow <strong>24 to 48 hours</strong> for our small but dedicated team to review your inquiry and get back to you with a personal response.</p>
                </section>
            </div>
        </div>
    );
}
