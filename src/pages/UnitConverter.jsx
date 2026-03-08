import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowRightLeft, Scale, Ruler, Thermometer,
    Square, CupSoda, HardDrive, Gauge
} from 'lucide-react';
import SEO from '../components/SEO';
import { ToolHeader } from '../components/ToolShell';
import './UnitConverter.css';

const CONVERSIONS = {
    length: {
        units: ['Millimeters', 'Centimeters', 'Meters', 'Kilometers', 'Inches', 'Feet', 'Yards', 'Miles'],
        ratios: {
            Millimeters: 1000, Centimeters: 100, Meters: 1, Kilometers: 0.001,
            Inches: 39.3701, Feet: 3.28084, Yards: 1.09361, Miles: 0.000621371
        }
    },
    weight: {
        units: ['Milligrams', 'Grams', 'Kilograms', 'Metric Tons', 'Ounces', 'Pounds'],
        ratios: {
            Milligrams: 1000000, Grams: 1000, Kilograms: 1, 'Metric Tons': 0.001,
            Ounces: 35.274, Pounds: 2.20462
        }
    },
    temp: {
        units: ['Celsius', 'Fahrenheit', 'Kelvin']
    },
    area: {
        units: ['Sq Meters', 'Sq Kilometers', 'Sq Feet', 'Sq Miles', 'Acres', 'Hectares'],
        ratios: {
            'Sq Meters': 1, 'Sq Kilometers': 0.000001, 'Sq Feet': 10.7639,
            'Sq Miles': 3.861e-7, Acres: 0.000247105, Hectares: 0.0001
        }
    },
    volume: {
        units: ['Milliliters', 'Liters', 'Cubic Meters', 'Cups', 'Pints', 'Quarts', 'Gallons'],
        ratios: {
            Milliliters: 1000, Liters: 1, 'Cubic Meters': 0.001,
            Cups: 4.22675, Pints: 2.11338, Quarts: 1.05669, Gallons: 0.264172
        }
    },
    speed: {
        units: ['Meters / sec', 'Km / hour', 'Miles / hour', 'Knots'],
        ratios: {
            'Meters / sec': 1, 'Km / hour': 3.6, 'Miles / hour': 2.23694, Knots: 1.94384
        }
    },
    digital: {
        units: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
        ratios: {
            Bytes: 1099511627776, KB: 1073741824, MB: 1048576, GB: 1024, TB: 1
        }
    }
};

export default function UnitConverter() {
    const [mode, setMode] = useState('length');
    const [val1, setVal1] = useState(1);
    const [val2, setVal2] = useState(0);
    const [unit1, setUnit1] = useState('Meters');
    const [unit2, setUnit2] = useState('Kilometers');

    const convert = useCallback((v, u1, u2) => {
        if (mode === 'temp') {
            let c;
            if (u1 === 'Celsius') c = v;
            else if (u1 === 'Fahrenheit') c = (v - 32) * 5 / 9;
            else c = v - 273.15;

            if (u2 === 'Celsius') return c;
            if (u2 === 'Fahrenheit') return (c * 9 / 5) + 32;
            return c + 273.15;
        } else {
            const base = v / CONVERSIONS[mode].ratios[u1];
            return base * CONVERSIONS[mode].ratios[u2];
        }
    }, [mode]);

    useEffect(() => {
        setUnit1(CONVERSIONS[mode].units[0]);
        setUnit2(CONVERSIONS[mode].units[1]);
    }, [mode]);

    useEffect(() => {
        const result = convert(val1, unit1, unit2);
        setVal2(Number(result.toFixed(6)));
    }, [val1, unit1, unit2, convert]);

    return (
        <div className="unit-converter">
            <SEO
                title="Smart Unit Converter – Accurate Metrics Conversion"
                description="Convert Length, Weight, Temperature, Area, Volume, Speed, and Digital Storage units instantly. Free, fast, and accurate."
                keywords="unit converter, kg to lbs, cm to inches, fahrenheit to celsius, km to miles, gb to mb, area converter, speed converter, online unit calculator"
                canonicalPath="/unit-converter"
                ogImage="/og/unit-converter.png"
                faqItems={[
                    { q: 'How accurate are the conversions?', a: 'All conversions use standard mathematical ratios with up to 6 decimal places of precision. This is more than sufficient for everyday, scientific, and engineering use.' },
                    { q: 'Can I convert temperature?', a: 'Yes! Switch to the Temperature tab to convert between Celsius, Fahrenheit, and Kelvin instantly.' },
                    { q: 'Is this tool free to use?', a: 'Yes, completely free with no limits. All calculations happen in your browser — no server calls needed.' }
                ]}
            />

            <ToolHeader
                title="Smart" highlight="Converter"
                desc="Fast and accurate unit conversion across all common measurement categories."
            />

            <div className="uc-card">
                <div className="uc-modes-wrapper">
                    <div className="uc-modes">
                        {[
                            { id: 'length', icon: <Ruler size={18} />, label: 'Length' },
                            { id: 'weight', icon: <Scale size={18} />, label: 'Weight' },
                            { id: 'temp', icon: <Thermometer size={18} />, label: 'Temp' },
                            { id: 'area', icon: <Square size={18} />, label: 'Area' },
                            { id: 'volume', icon: <CupSoda size={18} />, label: 'Volume' },
                            { id: 'speed', icon: <Gauge size={18} />, label: 'Speed' },
                            { id: 'digital', icon: <HardDrive size={18} />, label: 'Digital' },
                        ].map(m => (
                            <button
                                key={m.id}
                                className={mode === m.id ? 'active' : ''}
                                onClick={() => setMode(m.id)}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="uc-grid">
                    <div className="uc-input-box">
                        <label>From</label>
                        <input
                            type="number" className="modern-input"
                            value={val1} onChange={(e) => setVal1(Number(e.target.value))}
                        />
                        <select className="modern-input" value={unit1} onChange={(e) => setUnit1(e.target.value)}>
                            {CONVERSIONS[mode].units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    <div className="uc-divider">
                        <ArrowRightLeft size={24} color="var(--accent)" />
                    </div>

                    <div className="uc-input-box">
                        <label>To</label>
                        <input type="number" className="modern-input readonly" value={val2} readOnly />
                        <select className="modern-input" value={unit2} onChange={(e) => setUnit2(e.target.value)}>
                            {CONVERSIONS[mode].units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="uc-history">
                <p>💡 Tip: Switch categories to convert Speed, Volume, Area, and more!</p>
            </div>
        </div>
    );
}
