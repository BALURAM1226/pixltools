import React, { useState, useCallback, useRef } from "react";
import { createWorker } from "tesseract.js";
import SEO from "../components/SEO";
import DropZone from "../components/DropZone";
import { ToastProvider, useToast } from "../components/Toast";
import {
    ToolHeader,
    ToolGrid,
    Panel,
    Control,
    Select,
    Btn,
    ResetBtn,
    StatusBar,
    ProgressBar,
    PreviewBox,
    AdBanner,
    FAQ,
} from "../components/ToolShell";
import * as pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import "../components/ToolShell.css";
import "./OCR.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const LANGUAGES = [
    { value: "eng", label: "English" },
    { value: "spa", label: "Spanish" },
    { value: "fra", label: "French" },
    { value: "deu", label: "German" },
    { value: "ita", label: "Italian" },
    { value: "por", label: "Portuguese" },
    { value: "hin", label: "Hindi" },
];

function OCRInner() {
    const toast = useToast();
    const [preview, setPreview] = useState(null);
    const [pdfPages, setPdfPages] = useState([]); // Store all rendered pages
    const [resultText, setResultText] = useState("");
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(0);
    const [lang, setLang] = useState("eng");

    const resultRef = useRef(null);

    const handleFile = useCallback(async (f) => {
        const ext = f.name.split('.').pop().toLowerCase();
        const allowed = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];

        if (!allowed.includes(ext)) {
            toast(`Unsupported format. Use: ${allowed.join(', ')}`, "error");
            return;
        }

        setResultText("");
        setPreview(null);
        setPdfPages([]);
        setProgress(0);
        setStatus(null);

        const reader = new FileReader();

        // Handle PDFs
        if (ext === 'pdf') {
            setStatus({ type: "processing", msg: "Scanning PDF pages..." });
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjs.getDocument(typedarray).promise;
                    const numPages = pdf.numPages;
                    const pages = [];

                    for (let i = 1; i <= numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement("canvas");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext("2d");
                        await page.render({ canvasContext: ctx, viewport }).promise;
                        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                        pages.push(dataUrl);
                        if (i === 1) setPreview(dataUrl); // Show first page as preview
                    }

                    setPdfPages(pages);
                    setStatus(null);
                } catch (err) {
                    toast("PDF error: " + err.message, "error");
                }
            };
            reader.readAsArrayBuffer(f);
            return;
        }

        // Handle Images
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(f);
    }, [toast]);

    const process = async () => {
        if (!preview || running) return;
        setRunning(true);
        setResultText("");
        setProgress(0);

        const isPdf = pdfPages.length > 0;
        const imagesToProcess = isPdf ? pdfPages : [preview];
        let combinedText = "";

        setStatus({ type: "processing", msg: "Initializing OCR Engine..." });

        try {
            const worker = await createWorker(lang, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            for (let i = 0; i < imagesToProcess.length; i++) {
                const img = imagesToProcess[i];
                if (isPdf) {
                    setStatus({ type: "processing", msg: `Analyzing Page ${i + 1} of ${imagesToProcess.length}...` });
                } else {
                    setStatus({ type: "processing", msg: "Analyzing image text..." });
                }

                const { data: { text } } = await worker.recognize(img);
                combinedText += text + "\n\n--- PAGE BREAK ---\n\n";
            }

            await worker.terminate();

            const finalCleanText = combinedText.replace(/\n\n--- PAGE BREAK ---\n\n$/, "").trim();

            if (!finalCleanText) {
                toast("No text found in this document", "warning");
                setResultText("No readable text found.");
            } else {
                setResultText(finalCleanText);
                toast(`Successfully scanned ${imagesToProcess.length} ${imagesToProcess.length > 1 ? 'pages' : 'page'}`, "success");
            }

            setStatus({ type: "success", msg: "✓ OCR process complete" });

            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (err) {
            console.error(err);
            setStatus({ type: "error", msg: "OCR engine failed" });
            toast("Extraction failed", "error");
        } finally {
            setRunning(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resultText);
        toast("Copied to clipboard!", "success");
    };

    const downloadTxt = () => {
        const element = document.createElement("a");
        const fileBlob = new Blob([resultText], { type: 'text/plain' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = "extracted-text.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const reset = () => {
        setPreview(null);
        setResultText("");
        setStatus(null);
        setProgress(0);
    };

    return (
        <div className="ocr-page">
            <SEO
                title="Image to Text Converter Online Free – OCR Hub"
                description="Extract text from images (JPG, PNG) and PDF documents online for free. Highly accurate OCR supporting English and Hindi. 100% private and secure scan."
                keywords="image to text converter online free, ocr hub, extract text from image, scan image to text hindi, free photo to text converter, online ocr, scanner online, image to word free, scan receipt online, tesseract ocr browser"
                canonicalPath="/ocr"
            />

            <ToolHeader
                title="OCR"
                highlight="Scanner"
                badge="🛡 100% Private"
                desc="Extract text from any image instantly. Perfect for scanned documents, receipts, business cards, and screenshots."
            />

            <ToolGrid>
                <Panel title="Step 1: Upload Document">
                    {!preview ? (
                        <DropZone
                            onFile={handleFile}
                            label="Upload Image or PDF (Limited: png, jpg, webp, pdf)"
                            accept={{ 'image/*': [], 'application/pdf': ['.pdf'] }}
                        />
                    ) : (
                        <div className="ocr-preview-stack">
                            <PreviewBox>
                                <img src={preview} alt="Source Document" />
                            </PreviewBox>
                            <ResetBtn onClick={reset} />
                        </div>
                    )}
                </Panel>

                <Panel title="Step 2: Scan Settings">
                    {!preview ? (
                        <div className="empty-state-card">
                            <div className="tip-grid">
                                <div className="tip">💡 <strong>Tip:</strong> Ensure the text is clear and well-lit for best results.</div>
                                <div className="tip">📄 <strong>Supports:</strong> Scans, receipts, labels, and printed documents.</div>
                            </div>
                        </div>
                    ) : (
                        <div className="ocr-controls">
                            <Control label="Document Language" id="ocr-lang">
                                <Select
                                    id="ocr-lang"
                                    label="Select document language"
                                    value={lang}
                                    onChange={setLang}
                                    options={LANGUAGES}
                                />
                            </Control>

                            <div className="ocr-features">
                                <ul>
                                    <li>PNG, JPG, WEBP, PDF support</li>
                                    <li>Extracts text with original formatting</li>
                                    <li>100% Client-side processing (Private)</li>
                                </ul>
                            </div>

                            <Btn
                                onClick={process}
                                loading={running}
                                disabled={running || (resultText.length > 5 && resultText !== "No readable text found.")}
                                aria-label="Extract text from document"
                            >
                                🔍 Extract Text from Image/Page
                            </Btn>

                            {running && (
                                <div className="ocr-progress-container">
                                    <ProgressBar value={progress} label="Analyzing document text" />
                                    <span className="ocr-progress-label" aria-live="polite">{progress}% Complete</span>
                                </div>
                            )}

                            <StatusBar status={status} />
                        </div>
                    )}
                </Panel>
            </ToolGrid>

            {resultText && (
                <Panel title="Step 3: Extracted Text" className="grid-full result-panel">
                    <div ref={resultRef} className="ocr-result-layout">
                        <div className="ocr-text-area-wrap">
                            <label htmlFor="ocr-output" className="sr-only">Extracted Text Result</label>
                            <textarea
                                id="ocr-output"
                                className="ocr-textarea"
                                value={resultText}
                                readOnly
                                placeholder="Extracting text..."
                            />
                        </div>

                        <div className="ocr-actions">
                            <Btn variant="primary" onClick={copyToClipboard} aria-label="Copy extracted text to clipboard">
                                📋 Copy to Clipboard
                            </Btn>
                            <Btn variant="success" onClick={downloadTxt} aria-label="Download extracted text as TXT file">
                                📥 Download .TXT
                            </Btn>
                        </div>
                    </div>
                </Panel>
            )}

            <AdBanner slot="12345678" />

            <FAQ
                items={[
                    { q: "How can I convert image to text for free?", a: "iLoveToolHub offers a completely free OCR service. Just upload your image, select the language, and click 'Extract Text'. You can copy the text or download it as a .txt file instantly." },
                    { q: "Does this support Hindi OCR?", a: "Yes, our OCR engine is highly optimized for Hindi text extraction. Simply select 'Hindi' from the document language dropdown before scanning your image or document." },
                    { q: "Is this safe for scanning official receipts?", a: "Yes. All processing is 100% client-side. Your sensitive images and extracted data never reach any server, making iLoveToolHub the safest hub for document scanning." }
                ]}
            />
        </div>
    );
}

export default function OCR() {
    return <ToastProvider><OCRInner /></ToastProvider>;
}
