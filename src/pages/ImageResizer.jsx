import React, { useState, useCallback, useRef, useEffect } from "react";
import SEO from "../components/SEO";
import DropZone from "../components/DropZone";
import { ToastProvider, useToast } from "../components/Toast";
import {
    ToolHeader,
    ToolGrid,
    Panel,
    Control,
    Select,
    Slider,
    Btn,
    DownloadBtn,
    ResetBtn,
    StatusBar,
    PreviewBox,
    InfoChips,
    AdBanner,
    FAQ,
    SEOContent,
    TargetSizeControl
} from "../components/ToolShell";
import imageCompression from 'browser-image-compression';
import "../components/ToolShell.css";
import "./ImageResizer.css";

const PRESETS = [
    { id: "custom", label: "Custom Size", w: 0, h: 0 },
    { id: "ssc_photo", label: "SSC / Bank Photo (3.5×4.5 cm)", w: 413, h: 531 },
    { id: "upsc_sign", label: "UPSC / Govt Signature", w: 350, h: 150 },
    { id: "ig_post", label: "Instagram Post (1:1)", w: 1080, h: 1080 },
    { id: "yt_thumb", label: "YouTube Thumbnail", w: 1280, h: 720 },
    { id: "li_banner", label: "LinkedIn Banner", w: 1584, h: 396 },
];

function ImageResizerInner() {
    const toast = useToast();
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState(null);

    const [presetId, setPresetId] = useState("ig_post");
    const [width, setWidth] = useState(1080);
    const [height, setHeight] = useState(1080);
    const [maintainRatio, setMaintainRatio] = useState(true);
    const [quality, setQuality] = useState(90);
    const [format, setFormat] = useState("image/jpeg");
    const [targetSizeEnabled, setTargetSizeEnabled] = useState(false);
    const [targetSizeKB, setTargetSizeKB] = useState(300);

    const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
    const [origByteSize, setOrigByteSize] = useState(0);
    const [resultInfo, setResultInfo] = useState({ w: 0, h: 0, size: "" });

    const resultRef = useRef(null);

    const handleFile = useCallback((f) => {
        if (!f.type.startsWith("image/")) {
            toast("Please upload a valid image", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setOriginalSize({ w: img.width, h: img.height });
                setOrigByteSize(f.size);
                setPreview(e.target.result);
                // Set initial values based on preset
                const p = PRESETS.find(x => x.id === presetId);
                if (p && p.id !== 'custom') {
                    setWidth(p.w);
                    setHeight(p.h);
                } else {
                    setWidth(img.width);
                    setHeight(img.height);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(f);
    }, [toast, presetId]);

    useEffect(() => {
        if (presetId === "custom") return;
        const p = PRESETS.find(x => x.id === presetId);
        if (p) {
            setWidth(p.w);
            setHeight(p.h);
        }
    }, [presetId]);

    const handleWidthChange = (val) => {
        const newW = parseInt(val) || 0;
        setWidth(newW);
        if (maintainRatio && originalSize.w > 0) {
            setHeight(Math.round((newW / originalSize.w) * originalSize.h));
        }
    };

    const handleHeightChange = (val) => {
        const newH = parseInt(val) || 0;
        setHeight(newH);
        if (maintainRatio && originalSize.h > 0) {
            setWidth(Math.round((newH / originalSize.h) * originalSize.w));
        }
    };

    const process = useCallback(async () => {
        if (!preview || running) return;
        setRunning(true);
        setStatus({ type: "processing", msg: "Resizing image..." });

        try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            const img = new Image();
            await new Promise((r) => { img.onload = r; img.src = preview; });

            // Use better quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            ctx.drawImage(img, 0, 0, width, height);

            let finalBlob;
            if (targetSizeEnabled) {
                setStatus({ type: "processing", msg: "Optimizing file size..." });
                const initialBlob = await new Promise(r => canvas.toBlob(r, format, 0.95));
                finalBlob = await imageCompression(initialBlob, {
                    maxSizeMB: targetSizeKB / 1024,
                    maxWidthOrHeight: Math.max(width, height),
                    useWebWorker: true,
                    fileType: format
                });
            } else {
                finalBlob = await new Promise(r => canvas.toBlob(r, format, quality / 100));
            }

            const dataUrl = await new Promise(r => {
                const reader = new FileReader();
                reader.onloadend = () => r(reader.result);
                reader.readAsDataURL(finalBlob);
            });

            setResult(dataUrl);

            // Real size
            const size = Math.round(finalBlob.size / 1024);
            setResultInfo({ w: width, h: height, size: `${size} KB` });

            setStatus({ type: "success", msg: "✓ Image resized successfully" });
            toast("Success! Image resized.", "success");

            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (err) {
            setStatus({ type: "error", msg: "Failed to resize image" });
            toast("Process failed", "error");
        } finally {
            setRunning(false);
        }
    }, [preview, running, width, height, targetSizeEnabled, targetSizeKB, format, quality, toast]);


    const reset = () => {
        setPreview(null);
        setResult(null);
        setStatus(null);
    };

    return (
        <div className="resizer-page">
            <SEO
                title="Online Image Resizer – Resize for Exams, Apps & Social Media"
                description="Resize images to any dimension (px, cm, mm) for official applications, LinkedIn, or Instagram. Perfect for global document standards and high-quality photo resizing."
                keywords="online image resizer, resize image for official forms, image dimensions converter, resize photo for applications, crop image online free"
                canonicalPath="/image-resizer"
            />

            <ToolHeader
                title="Image"
                highlight="Resizer"
                badge="✨ Exam & Form Ready"
                desc="Resize and crop images for SSC, UPSC, and Indian government forms instantly. Free, fast, and optimized for perfect application uploads."
            />

            <ToolGrid>
                <Panel title="Step 1: Upload Image">
                    {!preview ? (
                        <DropZone onFile={handleFile} label="Drop image to resize" />
                    ) : (
                        <div className="resizer-preview-stack">
                            <PreviewBox>
                                <img src={preview} alt="Original" />
                            </PreviewBox>
                            <div className="orig-dim-chip">Original: {originalSize.w} × {originalSize.h} px</div>
                            <ResetBtn onClick={reset} />
                        </div>
                    )}
                </Panel>

                <Panel title="Step 2: Resize Settings">
                    {!preview ? (
                        <div className="empty-settings">
                            <div className="tip-box">
                                <span className="tip-icon">📐</span>
                                <p>Upload an image to unlock professional social media presets and custom scaling options.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="resizer-controls">
                            <Control label="Choose Platform Preset" id="resizer-preset">
                                <Select
                                    id="resizer-preset"
                                    label="Select social media preset"
                                    value={presetId}
                                    onChange={setPresetId}
                                    options={PRESETS.map(p => ({ value: p.id, label: p.label }))}
                                />
                            </Control>

                            <div className="dim-grid">
                                <Control label="Width (px)" id="resizer-w">
                                    <div className="input-with-symbol">
                                        <input
                                            id="resizer-w"
                                            type="number"
                                            value={width}
                                            aria-label="Target width in pixels"
                                            onChange={(e) => handleWidthChange(e.target.value)}
                                        />
                                        <span aria-hidden="true">W</span>
                                    </div>
                                </Control>
                                <Control label="Height (px)" id="resizer-h">
                                    <div className="input-with-symbol">
                                        <input
                                            id="resizer-h"
                                            type="number"
                                            value={height}
                                            aria-label="Target height in pixels"
                                            onChange={(e) => handleHeightChange(e.target.value)}
                                        />
                                        <span aria-hidden="true">H</span>
                                    </div>
                                </Control>
                            </div>

                            <div className="check-row">
                                <label className="checkbox-wrap">
                                    <input
                                        type="checkbox"
                                        checked={maintainRatio}
                                        onChange={(e) => setMaintainRatio(e.target.checked)}
                                        aria-label="Lock aspect ratio"
                                    />
                                    <span>Maintain Aspect Ratio</span>
                                </label>
                            </div>

                            <Control label="Output Format" id="resizer-fmt">
                                <Select
                                    id="resizer-fmt"
                                    label="Select output image format"
                                    value={format}
                                    onChange={setFormat}
                                    options={[
                                        { value: "image/jpeg", label: "JPG (Standard)" },
                                        { value: "image/png", label: "PNG (Lossless)" },
                                        { value: "image/webp", label: "WebP (Optmized)" },
                                    ]}
                                />
                            </Control>

                            <Control label="Quality">
                                <Slider
                                    min={10} max={100} value={quality}
                                    onChange={setQuality}
                                    formatValue={v => `${v}%`}
                                />
                            </Control>

                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                                <TargetSizeControl
                                    enabled={targetSizeEnabled}
                                    onToggle={setTargetSizeEnabled}
                                    value={targetSizeKB}
                                    onChange={setTargetSizeKB}
                                    min={Math.max(5, Math.round(origByteSize / 1024 / 100))}
                                    max={Math.round(origByteSize / 1024) || 10240}
                                    step={5}
                                />
                            </div>

                            <Btn onClick={process} loading={running} disabled={running} aria-label="Resize and Download Image">
                                🚀 Resize & Process Image
                            </Btn>
                            <StatusBar status={status} />
                        </div>
                    )}
                </Panel>

                {result && (
                    <Panel title="Step 3: Download Result" className="grid-full result-panel">
                        <div ref={resultRef} className="result-layout">
                            <PreviewBox>
                                <img src={result} alt="Resized" className="result-img" />
                            </PreviewBox>
                            <div className="result-actions">
                                <InfoChips items={[
                                    { label: "Dimensions", value: `${resultInfo.w} × ${resultInfo.h}` },
                                    { label: "Est. Size", value: resultInfo.size },
                                    { label: "Format", value: format.split('/')[1].toUpperCase() },
                                ]} />
                                <div className="download-wrap">
                                    <DownloadBtn href={result} filename={`resized-${width}x${height}.${format.split('/')[1] === 'jpeg' ? 'jpg' : format.split('/')[1]}`}>
                                        Download Resized Image
                                    </DownloadBtn>
                                </div>
                            </div>
                        </div>
                    </Panel>
                )}
            </ToolGrid>

            <AdBanner slot="12345678" />

            <SEOContent title="Professional Image Resizer for Global Requirements">
                <p>Resizing images to specific dimensions is often the most time-consuming part of filling out official forms or preparing social media content. iLoveToolHub simplifies this with a professional-grade image resizer designed for global standards.</p>

                <h3>Ready-to-Use Presets for Any Platform</h3>
                <p>Don't waste time checking dimension requirements. We've built in presets for <strong>Social Media (Instagram, LinkedIn)</strong>, and <strong>Official Documents</strong>. Whether you need a specific pixel count for a website or a centimeter measurement for a physical application, we have you covered.</p>

                <h3>Advanced Resizing Features</h3>
                <ul>
                    <li><strong>Unit Flexibility:</strong> Switch between Pixels (px), Centimeters (cm), and Millimeters (mm) instantly.</li>
                    <li><strong>Maintain Aspect Ratio:</strong> Ensure your image doesn't look stretched by locking the original proportions.</li>
                    <li><strong>Integrated Compression:</strong> Adjust the output quality to meet file size limits directly while resizing.</li>
                    <li><strong>Private Processing:</strong> Your identity documents and personal photos never leave your device.</li>
                </ul>

                <h3>Fastest Way to Meet Official Requirements</h3>
                <p>Our tool is optimized to help professionals and students globally. By combining resizing, cropping, and compression in one view, you can generate the exact file needed for any <strong>application, passport, or platform</strong> in seconds.</p>
            </SEOContent>

            <FAQ
                items={[
                    { q: "How do I resize an image for SSC or UPSC exams?", a: "Select the 'SSC Photo' or 'UPSC Signature' preset from our presets menu. These are pre-configured to meet the official pixel requirements for Indian government portals." },
                    { q: "Can I resize an image to 50KB using this tool?", a: "Yes. After resizing to the correct dimensions, use our 'Quality' slider or use our dedicated Image Compressor tool to hit the exact 50KB or 20KB limit." },
                    { q: "What is the best size for Instagram?", a: "For posts, 1080x1080 is standard. For stories, 1080x1920 (9:16 ratio) is recommended." },
                    { q: "Is WebP better than JPG?", a: "WebP generally provides better quality at smaller file sizes compared to JPG, and is supported by most modern browsers and platforms." }
                ]}
            />
        </div>
    );
}

export default function ImageResizer() {
    return <ToastProvider><ImageResizerInner /></ToastProvider>;
}
