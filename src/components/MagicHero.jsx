import React from "react";
import "./MagicHero.css";

const MagicHero = () => {
    return (
        <div className="magic-container">
            <div className="magic-inner">
                {/* Core Center Icon */}
                <div className="magic-center">
                    <div className="center-orb">
                        <span className="center-icon">✨</span>
                        <div className="core-resonance" />
                    </div>
                </div>

                {/* Outer Orbit - High Power */}
                <div className="orbit orbit-outer">
                    <div className="orbit-item item-1">🖼️</div>
                    <div className="orbit-item item-2">✂️</div>
                    <div className="orbit-item item-3">🔍</div>
                    <div className="orbit-item item-4">🛡️</div>
                    <div className="beam beam-1" />
                    <div className="beam beam-2" />
                </div>

                {/* Middle Orbit - Functional */}
                <div className="orbit orbit-mid">
                    <div className="orbit-item item-mid-1">📏</div>
                    <div className="orbit-item item-mid-2">🔡</div>
                    <div className="orbit-item item-mid-3">📊</div>
                    <div className="orbit-item item-hash">🏷️</div>
                </div>

                {/* Inner Orbit - Core Utility */}
                <div className="orbit orbit-inner">
                    <div className="orbit-item item-5">📁</div>
                    <div className="orbit-item item-6">⚡</div>
                </div>

                {/* Background Particles & Glows */}
                <div className="magic-bg">
                    <div className="sparkle s1" />
                    <div className="sparkle s2" />
                    <div className="sparkle s3" />
                    <div className="ambient-glow g1" />
                    <div className="ambient-glow g2" />
                </div>
            </div>
        </div>
    );
};

export default MagicHero;
