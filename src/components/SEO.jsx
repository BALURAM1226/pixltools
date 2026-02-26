import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, canonicalPath }) {
    const siteUrl = "https://ilovetoolhub.com"; // Your official domain
    const fullCanonical = `${siteUrl}${canonicalPath || ""}`;
    const fullTitle = `${title} | iLoveToolHub`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${siteUrl}/og-image.png`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullCanonical} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />

            {/* Schema.org JSON-LD for Search Engines */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": title,
                    "url": fullCanonical,
                    "description": description,
                    "applicationCategory": "MultimediaApplication",
                    "operatingSystem": "Web Browser",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    }
                })}
            </script>
        </Helmet>
    );
}
