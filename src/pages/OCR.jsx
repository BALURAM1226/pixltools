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
    SEOContent,
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
                title="Best Image to Text Converter Online Free – #1 OCR Hub"
                description="Extract text from images (JPG, PNG) and PDF documents online for free. Highly accurate OCR supporting English and Hindi. 100% private, secure, and fast."
                keywords="image to text converter online free, ocr hub, extract text from image, best ocr scanner, scan image to text hindi, free photo to text converter"
                canonicalPath="/ocr"
                ogImage="/og/ocr.jpg"
                faqItems={[
                    { q: 'How can I convert image to text for free?', a: 'iLoveToolHub offers a completely free OCR service. Just upload your image, select the language, and click Extract Text. You can copy the text or download it as a .txt file instantly.' },
                    { q: 'Does this support Hindi OCR?', a: 'Yes, our OCR engine is highly optimized for Hindi text extraction. Simply select Hindi from the document language dropdown before scanning your image or document.' },
                    { q: 'Is this safe for scanning official receipts?', a: 'Yes. All processing is 100% client-side. Your sensitive images and extracted data never reach any server, making iLoveToolHub the safest hub for document scanning.' }
                ]}
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

            <SEOContent title="Free Image to Text Converter Online - OCR Scanner">
                <p>Welcome to iLoveToolHub's cutting-edge <strong>Image to Text Converter</strong>. Using advanced Optical Character Recognition (OCR), this free online tool allows you to instantly extract readable and editable text from images, scanned documents, and PDFs. Whether you are a student digitizing notes or a professional organizing receipts, our <strong>online OCR</strong> handles the heavy lifting directly in your browser.</p>

                <h3>How To Extract Text From an Image (JPG/PNG to Text)</h3>
                <p>Converting photos to digital text has never been easier. Just follow these simple steps:</p>
                <ol>
                    <li><strong>Upload your file:</strong> Drag and drop a JPG, PNG, WEBP, or a PDF document into the scanner.</li>
                    <li><strong>Select your language:</strong> We support over 30 languages, including English and highly accurate <strong>Hindi</strong> OCR.</li>
                    <li><strong>Scan and Extract:</strong> Click the "Extract Text" button. The engine will instantly read the image to text free of charge.</li>
                    <li><strong>Download or Copy:</strong> Once extracted, copy your new text directly to your clipboard or download it as a raw `.txt` file, which is perfect as a lightweight <strong>image to word free</strong> alternative.</li>
                </ol>

                <h3>Why Use iLoveToolHub's Image to Text Converter?</h3>
                <ul>
                    <li><strong>100% Client-Side Privacy:</strong> Unlike other online OCR tools that upload your sensitive documents to a server, iLoveToolHub processes your images entirely inside your own browser window. Your private receipts, business cards, and screenshots are never saved or seen by us.</li>
                    <li><strong>Multilingual Support:</strong> Our scanner is optimized globally. Do you need to <strong>scan image to text Hindi</strong>? Spanish? German? Just select your language for pinpoint accuracy.</li>
                    <li><strong>Lighting Fast & Free:</strong> There are no paywalls, hidden fees, or limits. Enjoy unlimited image-to-text extractions completely online, completely free.</li>
                </ul>

                <h3>Common Use Cases</h3>
                <p>The flexibility of a robust OCR scanner opens endless possibilities. Use our tool to copy un-selectable text from web screenshots, digitize printed invoices and legal paperwork, convert scanned PDF pages back into editable documents, or rapidly translate foreign text signs by digitizing them first.</p>
            </SEOContent>

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
