import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Trash2, Check, AlignLeft, Hash, Eye, Share2, Shield, Zap, Info, Smartphone, Maximize, Layout, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader, Btn } from '../components/ToolShell';
import JSONVisualizer from '../components/JSONVisualizer';
import './JSONFormatter.css';

export default function JSONFormatter() {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [isVisualizing, setIsVisualizing] = useState(false);

    const handleFormat = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 4));
            setError('');
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    const handleMinify = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed));
            setError('');
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setInput('');
        setError('');
    };

    const handleVisualize = () => {
        if (!input.trim() || isVisualizing) return;
        setIsVisualizing(true);

        // Use timeout to allow UI to show loader before heavy parsing/layout
        setTimeout(() => {
            try {
                const parsed = JSON.parse(input);
                setParsedData(parsed);
                setError('');
                setShowVisualizer(true);
            } catch (e) {
                setError('Invalid JSON for visualization: ' + e.message);
            } finally {
                setIsVisualizing(false);
            }
        }, 300);
    };

    return (
        <div className="json-formatter">
            <SEO
                title="JSON Formatter with Graph Visualizer | Private & Interactive"
                description="Professional-grade JSON tool to beautify, minify, and explore nested data with a high-fidelity Graph Visualizer. 100% private, browser-only processing."
                keywords="json formatter with graph, json crack alternative, interactive json visualizer, private json beautifier, json tree explorer online, pretty print json, minify json tool, rest api debugger, developer tools for json mapping, json to graph export"
                canonicalPath="/json-formatter"
                ogImage="/og/json-formatter.jpg"
                faqItems={[
                    { q: 'What is a JSON formatter?', a: 'A JSON formatter takes raw, minified JSON data and reformats it with proper indentation and line breaks, making it easier for developers to read and debug API responses or configuration files.' },
                    { q: 'Is my JSON data private?', a: 'Yes. All formatting, minification, and graph visualization happens entirely in your browser. Your data is never sent to any server.' },
                    { q: 'What does the Graph Visualizer do?', a: 'It converts your JSON structure into an interactive node-based diagram, making it easy to understand deeply nested objects and arrays at a glance.' }
                ]}
            />

            <ToolHeader
                title="JSON Formatter with" highlight="Graph Visualizer"
                desc="Explore, beautify, and validate your JSON data with a high-fidelity interactive graph."
            />

            <div className={`tool-card-premium ${input.trim() ? 'has-content' : ''}`}>
                <div className="json-toolbar" style={{ minHeight: '44px' }}>
                    <div className="toolbar-left">
                        <Btn
                            size="sm"
                            onClick={handleFormat}
                            variant="primary"
                            disabled={!input.trim()}
                        >
                            <AlignLeft size={16} /> Beautify
                        </Btn>
                        <Btn
                            size="sm"
                            onClick={handleMinify}
                            variant="secondary"
                            disabled={!input.trim()}
                        >
                            <Hash size={16} /> Minify
                        </Btn>
                        <Btn
                            size="sm"
                            onClick={handleVisualize}
                            className="vis-btn-colorful"
                            disabled={!input.trim() || isVisualizing}
                        >
                            {isVisualizing ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Eye size={16} />
                            )}
                            {isVisualizing ? 'Processing...' : 'Graph View'}
                        </Btn>
                    </div>
                    <div className="toolbar-right">
                        <button
                            className="icon-btn"
                            onClick={handleCopy}
                            title="Copy JSON"
                            disabled={!input.trim()}
                        >
                            {copied ? <Check size={18} color="var(--green)" /> : <Copy size={18} />}
                        </button>
                        <button
                            className="icon-btn delete"
                            onClick={handleClear}
                            title="Clear All"
                            disabled={!input.trim()}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="json-editor-container premium-monaco-wrapper">
                    <Editor
                        height="550px"
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={input}
                        onChange={(value) => setInput(value || '')}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            automaticLayout: true,
                            padding: { top: 20, bottom: 20 },
                            cursorStyle: 'line',
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            formatOnPaste: true,
                            scrollbar: {
                                vertical: 'visible',
                                verticalScrollbarSize: 10,
                            }
                        }}
                    />
                    {error && <div className="json-error-badge">{error}</div>}
                </div>
            </div>

            <div className="pro-tips">
                <h3>💡 Pro Tips</h3>
                <ul>
                    <li>Paste any valid JSON to automatically detect structure errors.</li>
                    <li>Use "Minify" to reduce data size for API calls.</li>
                    <li>Your data never leaves your browser — it's processed entirely locally.</li>
                </ul>
            </div>

            <div className="tool-content-rich">
                <section className="content-section graph-showcase">
                    <h2><Share2 size={24} /> Why Use JSON Graph Visualization?</h2>
                    <p>
                        Traditional tree views can become overwhelming as your data grows. The <span className="graph-highlight">JSON Graph Visualizer</span> transforms flat, complex code into a
                        multidimensional map. By treating every object as a "Node" and Every nesting level as an "Edge," you can trace data flow
                        and relationships with zero mental overhead.
                    </p>
                    <div className="features-grid">
                        <div className="feature-box">
                            <h4><Layout size={20} /> Smart Layout</h4>
                            <p>Powered by the Dagre engine, your JSON is automatically organized into a logical, readable flowchart.</p>
                        </div>
                        <div className="feature-box">
                            <h4><Zap size={20} /> Type Highlighting</h4>
                            <p>Dynamic color mapping for Strings, Numbers, and Booleans makes spotting data patterns instant.</p>
                        </div>
                    </div>
                </section>

                <section className="content-section">
                    <h2>Tree View vs. Graph View</h2>
                    <p>
                        Understanding the difference between a Tree and a Graph mental model is key to efficient data debugging.
                    </p>
                    <div className="features-grid">
                        <div className="feature-box">
                            <h4>The Tree Limit</h4>
                            <p>Tree views are vertical and require constant scrolling for deeply nested objects, often hiding the "big picture."</p>
                        </div>
                        <div className="feature-box">
                            <h4>The Graph Advantage</h4>
                            <p>Graphs utilize both horizontal and vertical space, allowing you to see sibling nodes and parents simultaneously.</p>
                        </div>
                    </div>
                </section>

                <section className="content-section">
                    <h2><Info size={24} /> Key Features of the Visualizer</h2>
                    <p>
                        Our visualizer is built for developers who need to understand complex nested structures quickly.
                        Whether you are debugging a REST API response or auditing a large configuration file, the visualizer provides a
                        top-down perspective that raw text simply cannot match.
                    </p>
                    <div className="features-grid">
                        <div className="feature-box">
                            <h4><Smartphone size={20} /> Responsive Design</h4>
                            <p>Explore your graphs on any device. Zoom, pan, and drag nodes to focus on what matters most.</p>
                        </div>
                        <div className="feature-box">
                            <h4><Maximize size={20} /> High-Res Export</h4>
                            <p>Download your complete graph as a PNG image for project documentation or team collaboration.</p>
                        </div>
                    </div>
                </section>

                <section className="content-section">
                    <h2><Shield size={24} /> 100% Privacy First</h2>
                    <p>
                        Security is our priority. Unlike other online tools, your JSON data is <b>never sent to a server</b>.
                        All parsing, formatting, and graph generation happens directly in your browser's memory using local
                        client-side scripts.
                    </p>
                </section>

                <section className="content-section">
                    <h2><Maximize size={24} /> Professional Use Cases</h2>
                    <div className="features-grid">
                        <div className="feature-box">
                            <h4>API Debugging</h4>
                            <p>Map out responses from any REST or GraphQL API. Visualizing the structure makes it easy to write correct frontend code and catch missing fields.</p>
                        </div>
                        <div className="feature-box">
                            <h4>Config Auditing</h4>
                            <p>Verify huge JSON configurations at a glance. Identify patterns and deep-nested errors that are easy to miss in a standard text editor.</p>
                        </div>
                    </div>
                </section>
            </div>

            {showVisualizer && parsedData && (
                <JSONVisualizer
                    data={parsedData}
                    onClose={() => setShowVisualizer(false)}
                />
            )}
        </div>
    );
}
