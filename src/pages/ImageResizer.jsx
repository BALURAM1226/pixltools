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
} from "../components/ToolShell";
import "../components/ToolShell.css";
import "./ImageResizer.css";

const PRESETS = [
    { id: "custom", label: "Custom Size", w: 0, h: 0 },
    { id: "ig_post", label: "Instagram Post (1:1)", w: 1080, h: 1080 },
    { id: "ig_story", label: "Instagram Story (9:16)", w: 1080, h: 1920 },
    { id: "yt_thumb", label: "YouTube Thumbnail", w: 1280, h: 720 },
    { id: "li_banner", label: "LinkedIn Banner", w: 1584, h: 396 },
    { id: "fb_cover", label: "Facebook Cover", w: 820, h: 312 },
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

    const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
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

    const process = async () => {
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

            const dataUrl = canvas.toDataURL(format, quality / 100);
            setResult(dataUrl);

            // Estimate size
            const size = Math.round((dataUrl.length * 3) / 4 / 1024);
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
    };

    const reset = () => {
        setPreview(null);
        setResult(null);
        setStatus(null);
    };

    return (
        <>
            <SEO
                title="Professional Image Resizer – Resize for Social Media"
                description="Resize images for Instagram, YouTube, LinkedIn and more. High-quality image scaling with custom dimensions."
                canonicalPath="/image-resizer"
            />

            <ToolHeader
                title="Image"
                highlight="Resizer"
                badge="✨ Social Presets"
                desc="Optimized resizing for all social platforms. Maintain quality and aspect ratio with one-click presets."
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
                            <Control label="Choose Platform Preset">
                                <Select
                                    value={presetId}
                                    onChange={setPresetId}
                                    options={PRESETS.map(p => ({ value: p.id, label: p.label }))}
                                />
                            </Control>

                            <div className="dim-grid">
                                <Control label="Width (px)">
                                    <div className="input-with-symbol">
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => handleWidthChange(e.target.value)}
                                        />
                                        <span>W</span>
                                    </div>
                                </Control>
                                <Control label="Height (px)">
                                    <div className="input-with-symbol">
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => handleHeightChange(e.target.value)}
                                        />
                                        <span>H</span>
                                    </div>
                                </Control>
                            </div>

                            <div className="check-row">
                                <label className="checkbox-wrap">
                                    <input
                                        type="checkbox"
                                        checked={maintainRatio}
                                        onChange={(e) => setMaintainRatio(e.target.checked)}
                                    />
                                    <span>Maintain Aspect Ratio</span>
                                </label>
                            </div>

                            <Control label="Output Format">
                                <Select
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

                            <Btn onClick={process} loading={running}>
                                🚀 Resize & Process Image
                            </Btn>
                            <StatusBar status={status} />
                        </div>
                    )}
                </Panel>

                {result && (
                    <Panel title="Step 3: Download Result">
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

            <FAQ
                items={[
                    { q: "Will I lose quality when resizing?", a: "We use high-quality Lanczos-style interpolation in the browser to ensure your images stay as sharp as possible when downscaling." },
                    { q: "What is the best size for Instagram?", a: "For posts, 1080x1080 is standard. For stories, 1080x1920 (9:16 ratio) is recommended." },
                    { q: "Is WebP better than JPG?", a: "WebP generally provides better quality at smaller file sizes compared to JPG, and is supported by most modern browsers and platforms." }
                ]}
            />
        </>
    );
}

export default function ImageResizer() {
    return <ToastProvider><ImageResizerInner /></ToastProvider>;
}
