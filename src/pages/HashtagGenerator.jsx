import React, { useState } from 'react';
import { Hash, Copy, Check, TrendingUp, Search, Loader2, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader, Btn } from '../components/ToolShell';
import './HashtagGenerator.css';

const ALL_TAGS_POOL = [
    // Tech & Coding
    'coding', 'programming', 'javascript', 'reactjs', 'webdev', 'developer', 'python', 'tech', 'software', 'code', 'frontend', 'backend', 'fullstack', 'ai', 'ml', 'data', 'cloud', 'cybersecurity', 'devops', 'opensource', 'linux', 'github', 'vscode', 'webdesign', 'appdevelopment', 'hacker', 'engineering', 'science', 'iot', 'robotics',
    // Digital Marketing
    'marketing', 'seo', 'socialmedia', 'branding', 'business', 'growth', 'advertising', 'entrepreneur', 'contentmarketing', 'digitalmarketing', 'sales', 'strategy', 'optimization', 'analytics', 'ecommerce', 'affiliate', 'copywriting', 'emailmarketing', 'influencer', 'startup', 'money', 'leads', 'traffic', 'smallbusiness', 'success',
    // Lifestyle & Fitness
    'lifestyle', 'motivation', 'inspiration', 'fitness', 'travel', 'photography', 'goals', 'mindset', 'success', 'gym', 'workout', 'health', 'wellness', 'yoga', 'nutrition', 'training', 'adventure', 'explore', 'nature', 'love', 'happy', 'positivevibes', 'daily', 'minimalist', 'vlog', 'fashion', 'beauty', 'food', 'coffee', 'read',
    // Design & Art
    'uiux', 'design', 'graphicdesign', 'webdesign', 'designer', 'creative', 'figma', 'illustration', 'art', 'artist', 'drawing', 'painting', 'sketch', 'digitalart', 'typography', 'colors', 'ux', 'ui', 'creativemx', 'adobe', 'photoshop', 'illustrator', 'brandingdesign', 'vector', 'logo', 'inspirationdesign',
    // Generic Trending
    'viral', 'trending', 'explorepage', 'reels', 'tiktok', 'foryou', 'fyp', 'explore', 'repost', 'like', 'follow', 'share', 'comment', 'newpost', 'instadaily', 'instagood'
];

export default function HashtagGenerator() {
    const [topic, setTopic] = useState('');
    const [generated, setGenerated] = useState([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateHashtags = async (forcedTopic = null) => {
        const query = forcedTopic || topic;
        if (!query.trim()) return;

        setLoading(true);

        // Simulating a quick search/generation
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let matches = ALL_TAGS_POOL.filter(t =>
                t.includes(lowerQuery) || lowerQuery.includes(t)
            );

            // If few matches, add some random trending tags
            if (matches.length < 10) {
                const randoms = [...ALL_TAGS_POOL]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 15);
                matches = [...new Set([...matches, ...randoms])];
            }

            setGenerated(matches.slice(0, 25));
            setLoading(false);
        }, 600);
    };

    const handleCopy = () => {
        if (generated.length === 0) return;
        const textToCopy = generated.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ');
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="hashtag-gen">
            <SEO
                title="Viral Hashtag Generator – Grow Your Social Reach"
                description="Generate trending hashtags for Instagram, TikTok, and Twitter. Boost your engagement with viral hashtag suggestions."
                keywords="viral hashtag generator, trending hashtags, instagram hashtags, tiktok hashtags, twitter hashtags, boost social reach, social media marketing tools, viral tags creator, hashtag finder"
                canonicalPath="/hashtag-generator"
            />

            <ToolHeader
                title="Viral" highlight="Hashtags"
                desc="Instantly discover trending and relevant hashtags to skyrocket your social media engagement."
            />

            <div className="hg-card">
                <div className="hg-input-zone">
                    <div className="hg-search-box">
                        <Search className="hg-search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Enter a topic (e.g. Photography, Coding...)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateHashtags()}
                        />
                    </div>
                    <Btn
                        onClick={() => generateHashtags()}
                        className={`hg-gen-btn ${loading ? 'btn-loading' : ''}`}
                        disabled={loading || !topic.trim()}
                    >
                        {loading ? <Loader2 className="spinner" size={18} /> : <Sparkles size={18} />}
                        {loading ? 'Finding Tags...' : 'Generate Tags'}
                    </Btn>
                </div>

                {generated.length > 0 && (
                    <div className="hg-result-zone fade-in">
                        <div className="hg-result-header">
                            <span>Generated <strong>{generated.length}</strong> Tags</span>
                            <button className={`hg-copy-all ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'All Copied' : 'Copy All'}
                            </button>
                        </div>
                        <div className="hg-tags-grid">
                            {generated.map((tag, idx) => (
                                <div key={idx} className="hg-tag">
                                    <Hash size={12} />
                                    <span>{tag.replace('#', '')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="hg-suggestions">
                    <label>Quick Suggestions</label>
                    <div className="hg-cat-pills">
                        {['Coding', 'Marketing', 'Photography', 'Fitness', 'Design', 'Startup'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setTopic(cat); generateHashtags(cat); }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hg-info-grid">
                <div className="hg-info-card">
                    <TrendingUp size={24} />
                    <h4>Reach More People</h4>
                    <p>Optimized hashtag sets designed to help your content land on the explore page.</p>
                </div>
                <div className="hg-info-card">
                    <Sparkles size={24} />
                    <h4>Smart Suggestions</h4>
                    <p>Our algorithm picks the best mix of high and medium competition tags for growth.</p>
                </div>
            </div>
        </div>
    );
}
