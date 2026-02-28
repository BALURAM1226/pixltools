import React, { useState } from 'react';
import SEO from '../components/SEO';
import {
    ToolHeader, ToolGrid, Panel, Btn, AdBanner, FAQ, SEOContent
} from '../components/ToolShell';
import '../components/ToolShell.css';
import { RefreshCw, Layout, Smartphone, Monitor } from 'lucide-react';

export default function CssUnitConverter() {
    const [base, setBase] = useState('16');
    const [values, setValues] = useState({
        px: '16',
        rem: '1',
        em: '1',
        percent: '100',
        pt: '12',
        vw: '0.833',
        vh: '1.481'
    });
    
    // Default Viewport Context for VW/VH
    const [viewportW, setViewportW] = useState('1920');
    const [viewportH, setViewportH] = useState('1080');

    const updateAll = (changedUnit, val) => {
        const num = parseFloat(val);
        const b = parseFloat(base) || 16;
        const vwBase = parseFloat(viewportW) || 1920;
        const vhBase = parseFloat(viewportH) || 1080;

        if (isNaN(num)) {
            setValues(prev => ({ ...prev, [changedUnit]: val }));
            return;
        }

        let pxVal = 0;

        // Step 1: Normalize to PX
        switch (changedUnit) {
            case 'px': pxVal = num; break;
            case 'rem': pxVal = num * b; break;
            case 'em': pxVal = num * b; break;
            case 'percent': pxVal = (num / 100) * b; break;
            case 'pt': pxVal = num * (b / 12); break; // Standard 12pt = 16px (1pt = 1.333px)
            case 'vw': pxVal = (num / 100) * vwBase; break;
            case 'vh': pxVal = (num / 100) * vhBase; break;
            default: pxVal = num;
        }

        // Step 2: Update all other states
        setValues({
            px: changedUnit === 'px' ? val : pxVal.toFixed(2).replace(/\.00$/, ''),
            rem: changedUnit === 'rem' ? val : (pxVal / b).toFixed(3).replace(/\.000$/, ''),
            em: changedUnit === 'em' ? val : (pxVal / b).toFixed(3).replace(/\.000$/, ''),
            percent: changedUnit === 'percent' ? val : ((pxVal / b) * 100).toFixed(1).replace(/\.0$/, ''),
            pt: changedUnit === 'pt' ? val : (pxVal / (b / 12)).toFixed(2).replace(/\.00$/, ''),
            vw: changedUnit === 'vw' ? val : ((pxVal / vwBase) * 100).toFixed(3).replace(/\.000$/, ''),
            vh: changedUnit === 'vh' ? val : ((pxVal / vhBase) * 100).toFixed(3).replace(/\.000$/, '')
        });
    };

    const handleBaseChange = (newBase) => {
        setBase(newBase);
        // Recalculate everything based on the current PX value
        updateAll('px', values.px);
    };

    const handleViewportChange = (type, val) => {
        if (type === 'w') setViewportW(val);
        else setViewportH(val);
        updateAll('px', values.px);
    };

    return (
        <div className="css-converter-page">
            <SEO
                title="Global CSS Unit Converter – PX, REM, EM, %, PT, VW, VH"
                description="The ultimate CSS unit calculator. Convert between Pixels, REM, EM, Percentages, Points, Viewport Width and Height instantly with custom root sizes."
                keywords="px to rem converter, css units calculator, em to px, percentage to px, pt to px, vw to px, vh to px, responsive web design tools, fluid typography"
                canonicalPath="/css-unit-converter"
            />

            <ToolHeader
                title="Global CSS"
                highlight="Unit Converter"
                badge="🎨 Full Responsive Suite"
                desc="A comprehensive calculator for modern frontend developers. Sync all CSS units instantly across different base references."
            />

            <ToolGrid>
                <Panel title="Configuration & Bases">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Layout size={14} /> Root Base (px)
                            </label>
                            <input 
                                className="modern-input"
                                type="number"
                                value={base}
                                onChange={(e) => handleBaseChange(e.target.value)}
                                style={{ fontWeight: 600, color: 'var(--accent)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Monitor size={14} /> Viewport Width
                            </label>
                            <input 
                                className="modern-input"
                                type="number"
                                value={viewportW}
                                onChange={(e) => handleViewportChange('w', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Smartphone size={14} /> Viewport Height
                            </label>
                            <input 
                                className="modern-input"
                                type="number"
                                value={viewportH}
                                onChange={(e) => handleViewportChange('h', e.target.value)}
                            />
                        </div>
                    </div>
                </Panel>

                <Panel title="Universal Converter">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '16px' }}>
                        {[
                            { id: 'px', label: 'Pixels (PX)', color: 'var(--accent)' },
                            { id: 'rem', label: 'Root EM (REM)', color: '#63b3ed' },
                            { id: 'em', label: 'Relative (EM)', color: '#818cf8' },
                            { id: 'percent', label: 'Percent (%)', color: '#f687b3' },
                            { id: 'pt', label: 'Points (PT)', color: '#f6ad55' },
                            { id: 'vw', label: 'V-Width (VW)', color: '#4fd1c5' },
                            { id: 'vh', label: 'V-Height (VH)', color: '#a0aec0' },
                        ].map(unit => (
                            <div key={unit.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{unit.label}</label>
                                <input 
                                    className="modern-input"
                                    type="number"
                                    value={values[unit.id]}
                                    onChange={(e) => updateAll(unit.id, e.target.value)}
                                    style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: 600, 
                                        borderColor: unit.id === 'px' ? 'var(--accent-dim)' : '',
                                        background: unit.id === 'px' ? 'rgba(var(--accent-rgb), 0.03)' : ''
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                        <Btn onClick={() => updateAll('px', '16')} variant="ghost" full={false}>
                            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Reset to Default (16px)
                        </Btn>
                    </div>
                </Panel>
            </ToolGrid>

            <AdBanner slot="9999999999" />

            <SEOContent title="Mastering CSS Units">
                <p>CSS offers various units to help developers create layouts that work on any screen. Understanding the difference between absolute and relative units is key to modern web design.</p>
                
                <h3>Absolute vs Relative</h3>
                <p><strong>Pixels (PX)</strong> are fixed. <strong>REM</strong> and <strong>EM</strong> are relative to font sizes. <strong>VW/VH</strong> are relative to the viewport. Using relative units ensures your site is <em>accessible</em> for users who increase their browser font size.</p>

                <h3>Standard Formulae</h3>
                <ul>
                    <li><code>Value in REM = Pixels / Base Size</code></li>
                    <li><code>Value in Percent = (Pixels / Base Size) * 100</code></li>
                    <li><code>1vw = 1% of Viewport Width</code></li>
                    <li><code>1pt = 1.333px</code> (assuming 96 DPI)</li>
                </ul>
            </SEOContent>

            <FAQ items={[
                { q: "What is the difference between REM and EM?", a: "REM is relative to the root (html) element's font size. EM is relative to the parent element's font size. REM is generally safer for global consistency." },
                { q: "Why use VW instead of Percent?", a: "Percent is relative to the parent container, while VW (Viewport Width) is always relative to the full browser window width." },
                { q: "Is 16px always the root size?", a: "It's the browser default. However, some developers set it to 62.5% (10px) to make math easier. You can change the 'Root Base' in our tool to match your config." }
            ]} />
        </div>
    );
}
