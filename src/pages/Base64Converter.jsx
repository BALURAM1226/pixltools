import React, { useState, useCallback } from "react";
import SEO from "../components/SEO";
import DropZone from "../components/DropZone";
import { ToastProvider, useToast } from "../components/Toast";
import {
    ToolHeader,
    ToolGrid,
    Panel,
    Control,
    Btn,
    DownloadBtn,
    ResetBtn,
    PreviewBox,
    InfoChips,
    AdBanner,
    FAQ,
} from "../components/ToolShell";
import "../components/ToolShell.css";
import "./Base64Converter.css";

function Base64ConverterInner() {
    const toast = useToast();
    const [mode, setMode] = useState("encode"); // encode or decode
    const [base64String, setBase64String] = useState("");
    const [decodedPreview, setDecodedPreview] = useState(null);
    const [includePrefix, setIncludePrefix] = useState(true);

    const [info, setInfo] = useState({ size: "", type: "" });

    const handleFile = useCallback((f) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const b64 = e.target.result;
            setBase64String(b64);
            setInfo({
                size: `${Math.round(f.size / 1024)} KB`,
                type: f.type.split('/')[1].toUpperCase()
            });
            toast("Image encoded to Base64!", "success");
        };
        reader.readAsDataURL(f);
    }, [toast]);

    const handleDecode = () => {
        if (!base64String.trim()) {
            toast("Please enter a Base64 string", "error");
            return;
        }

        let str = base64String.trim();
        // If it doesn't have a prefix, try to guess or just use what's there
        if (!str.startsWith("data:")) {
            // Try to guess type or default to png
            str = "data:image/png;base64," + str;
        }

        try {
            // Validate if it's a valid image data URL
            const img = new Image();
            img.onload = () => {
                setDecodedPreview(str);
                setInfo({
                    size: `${Math.round((str.length * 3) / 4 / 1024)} KB`,
                    type: "DECODED"
                });
                toast("Base64 decoded successfully!", "success");
            };
            img.onerror = () => {
                toast("Invalid Base64 image data", "error");
            };
            img.src = str;
        } catch (e) {
            toast("Decoding failed", "error");
        }
    };

    const copyToClipboard = () => {
        let text = base64String;
        if (!includePrefix && text.includes(",")) {
            text = text.split(",")[1];
        }
        navigator.clipboard.writeText(text);
        toast("Copied to clipboard!", "success");
    };

    const reset = () => {
        setBase64String("");
        setDecodedPreview(null);
        setInfo({ size: "", type: "" });
    };

    return (
        <div className="base64-page">
            <SEO
                title="Image to Base64 Converter – Encode & Decode Images"
                description="Free online tool to convert images to Base64 strings or decode Base64 back to images. Perfect for developers and web designers."
                keywords="image to base64 converter, encode image to string, decode base64 to image, data uri maker, base64 to png, base64 to jpg, web developer tools, img src base64 converter"
                canonicalPath="/base64-converter"
            />

            <ToolHeader
                title="Base64"
                highlight="Converter"
                badge="🛠 Dev Tool"
                desc="Fast, secure image encoding and decoding. Convert images to Base64 data URIs for CSS, HTML, and API integration."
            />

            <div className="mode-toggle-wrap">
                <div className="mode-tabs">
                    <button className={mode === "encode" ? "active" : ""} onClick={() => { setMode("encode"); reset(); }}>Encode Image</button>
                    <button className={mode === "decode" ? "active" : ""} onClick={() => { setMode("decode"); reset(); }}>Decode Base64</button>
                </div>
            </div>

            <ToolGrid>
                {/* Step 1: Input */}
                <Panel title={mode === "encode" ? "Step 1: Upload Image" : "Step 1: Paste Base64 Data"}>
                    {mode === "encode" ? (
                        !base64String ? (
                            <DropZone onFile={handleFile} label="Upload image to encode" />
                        ) : (
                            <div className="converter-input-stack">
                                <PreviewBox>
                                    <img src={base64String} alt="Original" />
                                </PreviewBox>
                                <ResetBtn onClick={reset} />
                            </div>
                        )
                    ) : (
                        <div className="decode-input-wrap">
                            <Control label="Base64 Content">
                                <textarea
                                    className="b64-textarea"
                                    placeholder="Paste data:image/... or raw Base64 string here"
                                    value={base64String}
                                    onChange={(e) => setBase64String(e.target.value)}
                                />
                            </Control>
                            <Btn onClick={handleDecode}>Decode to Image</Btn>
                            {base64String && <ResetBtn onClick={reset} />}
                        </div>
                    )}
                </Panel>

                <Panel title={mode === "encode" ? "Step 2: Base64 String" : "Step 2: Decoded Image"} className="grid-full result-panel">
                    {mode === "encode" ? (
                        !base64String ? (
                            <div className="empty-state-msg">Upload an image to see the Base64 encoding.</div>
                        ) : (
                            <div className="encode-output-wrap">
                                <div className="b64-actions">
                                    <label className="checkbox-wrap">
                                        <input type="checkbox" checked={includePrefix} onChange={(e) => setIncludePrefix(e.target.checked)} />
                                        <span>Include Data URI Prefix</span>
                                    </label>
                                    <button className="btn-ghost btn-sm" onClick={copyToClipboard}>📋 Copy String</button>
                                </div>
                                <textarea
                                    className="b64-textarea output"
                                    readOnly
                                    value={includePrefix ? base64String : (base64String.includes(',') ? base64String.split(',')[1] : base64String)}
                                />
                                <InfoChips items={[
                                    { label: "Original Format", value: info.type },
                                    { label: "File Size", value: info.size },
                                    { label: "Length", value: `${Math.round(base64String.length / 1024)}k chars` },
                                ]} />
                            </div>
                        )
                    ) : (
                        !decodedPreview ? (
                            <div className="empty-state-msg">Paste Base64 data and click Decode to see the image.</div>
                        ) : (
                            <div className="decode-result-wrap">
                                <PreviewBox>
                                    <img src={decodedPreview} alt="Decoded" className="result-img" />
                                </PreviewBox>
                                <div className="result-actions-grid">
                                    <InfoChips items={[
                                        { label: "Est. Size", value: info.size },
                                        { label: "Type", value: info.type },
                                    ]} />
                                    <DownloadBtn href={decodedPreview} filename="decoded-image.png">
                                        Download Image
                                    </DownloadBtn>
                                </div>
                            </div>
                        )
                    )}
                </Panel>
            </ToolGrid>

            <AdBanner slot="12345678" />

            <FAQ
                items={[
                    { q: "What is Base64 encoding?", a: "Base64 is a way to encode binary data (like images) into a text string using 64 safe characters. This allows you to embed images directly into HTML or CSS without external files." },
                    { q: "Why should I use Base64 for images?", a: "It reduces HTTP requests for small icons or images, improving initial load speed. However, for large images, it increases the total file size by about 33%." },
                    { q: "Is this tool secure?", a: "Yes, all encoding and decoding happens completely within your browser. Your image data never leaves your computer." }
                ]}
            />
        </div>
    );
}

export default function Base64Converter() {
    return <ToastProvider><Base64ConverterInner /></ToastProvider>;
}
