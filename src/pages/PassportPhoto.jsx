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
import "./PassportPhoto.css";

const PAPER_SIZES = [
	{ label: "Single Image", id: "single", w: 0, h: 0, scale: 1 },
	{ label: "4×6 in (10×15 cm)", id: "4x6", w: 1800, h: 1200, dpi: 300 },
	{ label: "5×7 in (13×18 cm)", id: "5x7", w: 2100, h: 1500, dpi: 300 },
	{ label: "A4 Sheet", id: "A4", w: 3508, h: 2480, dpi: 300 },
];

const SIZES = [
	{
		label: "🇺🇸 US Passport — 2×2 in",
		w: 600, h: 600, unit: "2×2 in", dpi: 300,
		headMin: 0.50, headMax: 0.69
	},
	{
		label: "🇬🇧 UK Passport — 35×45 mm",
		w: 413, h: 531, unit: "35×45 mm", dpi: 300,
		headMin: 0.65, headMax: 0.75
	},
	{
		label: "🇮🇳 India Passport — 35×45 mm",
		w: 413, h: 531, unit: "35×45 mm", dpi: 300,
		headMin: 0.56, headMax: 0.78
	},
	{
		label: "🇪🇺 EU / Schengen — 35×45 mm",
		w: 413, h: 531, unit: "35×45 mm", dpi: 300,
		headMin: 0.70, headMax: 0.80
	},
	{
		label: "🇨🇳 China Visa — 33×48 mm",
		w: 390, h: 567, unit: "33×48 mm", dpi: 300,
		headMin: 0.58, headMax: 0.73
	},
	{
		label: "🇦🇺 Australia — 35×45 mm",
		w: 413, h: 531, unit: "35×45 mm", dpi: 300,
		headMin: 0.71, headMax: 0.80
	},
	{
		label: "🇨🇦 Canada — 50×70 mm",
		w: 591, h: 827, unit: "50×70 mm", dpi: 300,
		headMin: 0.44, headMax: 0.51
	},
	{
		label: "🌍 Generic ID — 35×35 mm",
		w: 413, h: 413, unit: "35×35 mm", dpi: 300,
		headMin: 0.60, headMax: 0.75
	},
];

const BG_PRESETS = [
	{ hex: "original", label: "Original BG", icon: "📸" },
	{ hex: "transparent", label: "Transparent", icon: "🏁" },
	{ hex: "#ffffff", label: "White" },
	{ hex: "#f5f5f5", label: "Off-White" },
	{ hex: "#d8e8ff", label: "Light Blue" },
	{ hex: "#e0e0e0", label: "Light Grey" },
	{ hex: "#000000", label: "Black" },
	{ hex: "custom", label: "Custom", icon: "🎨" },
];

function PassportPhotoInner() {
	const toast = useToast();

	const [file, setFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [result, setResult] = useState(null);

	const [sizeKey, setSizeKey] = useState("0");
	const [bgColor, setBgColor] = useState("original");
	const [customColor, setCustomColor] = useState("#3b82f6");
	const [brightness, setBrightness] = useState(100);
	const [contrast, setContrast] = useState(100);
	const [jpegQ, setJpegQ] = useState(95);

	const [status, setStatus] = useState(null);
	const [running, setRunning] = useState(false);

	const [printSizeId, setPrintSizeId] = useState("single");
	const [showBorders, setShowBorders] = useState(true);
	const [manualRemoveBg, setManualRemoveBg] = useState(false);
	const [aiCache, setAiCache] = useState(null);

	const [zoom, setZoom] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const resultRef = useRef(null);
	const containerRef = useRef(null);
	const [naturalAR, setNaturalAR] = useState(1);
	const [exportFormat, setExportFormat] = useState("image/jpeg");
	const [lowSize, setLowSize] = useState(false);
	const [targetSizeKB, setTargetSizeKB] = useState(50);
	const [fileSizeInKB, setFileSizeInKB] = useState(0);

	const sz = SIZES[Number(sizeKey)];
	const paper = PAPER_SIZES.find((p) => p.id === printSizeId);

	useEffect(() => {
		if (!preview || !containerRef.current) return;
		const displayW = containerRef.current.offsetWidth || 340;
		const displayH = displayW / (sz.w / sz.h);

		const imgAR = naturalAR;
		const canvasAR = sz.w / sz.h;

		let ox = 0, oy = 0;

		if (imgAR > canvasAR) {
			// Image is wider than container: match height
			const scaledW = displayH * imgAR;
			ox = (displayW - scaledW) / 2;
		} else {
			// Image is taller than container: match width
			const scaledH = displayW / imgAR;
			oy = (displayH - scaledH) / 2;
		}

		setZoom(1); // Reset zoom to baseline
		setOffset({ x: ox, y: oy });
		setResult(null);
	}, [preview, sizeKey, naturalAR, sz.h, sz.w]);

	useEffect(() => {
		setResult(null);
		setStatus(null);
	}, [sizeKey, bgColor, brightness, contrast, jpegQ, printSizeId, showBorders, manualRemoveBg]);

	const handleFile = useCallback((f) => {
		if (!f.type.startsWith("image/")) {
			toast("Please upload an image file.", "error");
			return;
		}
		setFile(f);
		setResult(null);
		setAiCache(null);
		setStatus(null);
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				setPreview(e.target.result);
				setNaturalAR(img.width / img.height);
				setZoom(1.05);
				setOffset({ x: 0, y: 0 });
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(f);
	}, [toast]);

	const convert = async () => {
		if (!preview || running) return;

		// 1. Validation: Ensure container dimensions are ready
		const mattedBox = containerRef.current?.querySelector('.crop-matted');
		if (!mattedBox) {
			toast("Interface error. Please refresh.", "error");
			return;
		}

		// Verify aspect ratio integrity
		const currentAR = mattedBox.offsetWidth / mattedBox.offsetHeight;
		const targetAR = sz.w / sz.h;
		if (Math.abs(currentAR - targetAR) > 0.05) {
			toast("Dimension mismatch. Resetting container...", "warning");
			return;
		}

		// 2. Lock Layout & Start
		setRunning(true);
		setStatus({ type: "processing", msg: "Validating & Rendering…" });

		try {
			// 3. Final Output Resolution Enforcement
			const portraitCanvas = document.createElement("canvas");
			portraitCanvas.width = sz.w;
			portraitCanvas.height = sz.h;
			const pCtx = portraitCanvas.getContext("2d");
			const isTransparent = bgColor === "transparent" || (bgColor === "original" && manualRemoveBg);

			if (bgColor !== "original" && bgColor !== "transparent") {
				pCtx.fillStyle = bgColor === "custom" ? customColor : bgColor;
				pCtx.fillRect(0, 0, sz.w, sz.h);
			}

			const img = new Image();
			await new Promise((r) => { img.onload = r; img.src = preview; });
			let sourceImage = img;

			if (isTransparent || (bgColor !== "original" && bgColor !== "transparent") || manualRemoveBg) {
				if (aiCache) {
					sourceImage = aiCache;
				} else {
					setStatus({ type: "processing", msg: "AI is removing background… takes ~10s" });
					const { removeBackground } = await import("@imgly/background-removal");
					const blob = await removeBackground(file);
					const aiImg = new Image();
					const aiUrl = URL.createObjectURL(blob);
					await new Promise((r) => { aiImg.onload = r; aiImg.src = aiUrl; });
					sourceImage = aiImg; setAiCache(aiImg);
				}
			}

			// Auto-switch to PNG if transparent result is requested
			if (isTransparent && exportFormat !== "image/png") {
				setExportFormat("image/png");
				toast("Switched to PNG to preserve transparency", "info");
			}
			const filterCanvas = document.createElement("canvas");
			filterCanvas.width = sourceImage.naturalWidth; filterCanvas.height = sourceImage.naturalHeight;
			const fCtx = filterCanvas.getContext("2d");
			fCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
			fCtx.drawImage(sourceImage, 0, 0);
			const displayW = containerRef.current?.querySelector('.crop-matted')?.offsetWidth || 300;
			const ratio = sz.w / displayW;

			// We calculate the base image dimensions exactly as CSS does (object-fit: contain/cover logic)
			const canvasAR = sz.w / sz.h;
			const imgAR = sourceImage.naturalWidth / sourceImage.naturalHeight;

			let baseW, baseH;
			if (imgAR > canvasAR) {
				// Image matched container height in CSS
				baseH = sz.h;
				baseW = baseH * imgAR;
			} else {
				// Image matched container width in CSS
				baseW = sz.w;
				baseH = baseW / imgAR;
			}

			// Final dimensions after user zoom
			const finalW = baseW * zoom;
			const finalH = baseH * zoom;

			// Offset is already in "display pixels", scale it to "canvas pixels"
			const dx = offset.x * ratio;
			const dy = offset.y * ratio;

			pCtx.drawImage(filterCanvas, 0, 0, sourceImage.naturalWidth, sourceImage.naturalHeight, dx, dy, finalW, finalH);
			if (showBorders) { pCtx.strokeStyle = "rgba(0,0,0,0.1)"; pCtx.lineWidth = 2; pCtx.strokeRect(0, 0, sz.w, sz.h); }
			let finalCanvas = portraitCanvas;
			if (paper.id !== "single") {
				const sheet = document.createElement("canvas"); sheet.width = paper.w; sheet.height = paper.h;
				const sCtx = sheet.getContext("2d"); sCtx.fillStyle = "#fff"; sCtx.fillRect(0, 0, paper.w, paper.h);
				const margin = 60, gap = 20; let x = margin, y = margin;
				while (y + sz.h + margin <= paper.h) {
					while (x + sz.w + margin <= paper.w) { sCtx.drawImage(portraitCanvas, x, y); x += sz.w + gap; }
					x = margin; y += sz.h + gap;
				}
				finalCanvas = sheet;
			}

			// 4. Handle Image + Smart Compression
			let quality = jpegQ / 100;
			let finalDataUrl = finalCanvas.toDataURL(exportFormat, quality);

			if (lowSize && (exportFormat === "image/jpeg" || exportFormat === "image/webp")) {
				// Iterative compression to hit targetSizeKB
				let min = 0.01, max = 1.0, bestQ = 0.5;
				for (let i = 0; i < 6; i++) { // 6 iterations for high accuracy
					const testQ = (min + max) / 2;
					const testUrl = finalCanvas.toDataURL(exportFormat, testQ);
					const testSize = (testUrl.length * 0.75) / 1024;
					if (testSize <= targetSizeKB) {
						bestQ = testQ;
						min = testQ;
					} else {
						max = testQ;
					}
				}
				finalDataUrl = finalCanvas.toDataURL(exportFormat, bestQ);
			}

			const sizeInKB = Math.round((finalDataUrl.length * 0.75) / 1024);
			setFileSizeInKB(sizeInKB);
			setResult(finalDataUrl);

			setStatus({ type: "success", msg: "✓ Ready for download" });
			toast("Passport photo ready!", "success");
			setTimeout(() => {
				resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 150);
		} catch (err) { setStatus({ type: "error", msg: err.message }); }
		finally { setRunning(false); }
	};

	const reset = () => {
		setPreview(null); setResult(null); setAiCache(null); setStatus(null);
		setZoom(1); setOffset({ x: 0, y: 0 });
	};

	return (
		<>
			<SEO
				title="Free Passport Size Photo Converter – US, UK, India, EU"
				description="Convert any photo to official passport or visa sizes online. US, UK, India, EU standards supported with AI background removal."
				canonicalPath="/passport-photo"
			/>

			<ToolHeader
				title="Passport"
				highlight="Converter"
				badge="🪪 Pro Formats"
				desc="Professional passport & visa photo generator. Support for US, UK, India, EU and more with biometric precise alignment."
			/>

			<ToolGrid>
				{/* Step 1: Upload & Adjust */}
				<Panel title="Step 1: Upload & Position">
					{!preview ? (
						<DropZone onFile={handleFile} label="Upload Portrait Photo" />
					) : (
						<div className="preview-stack">
							<div className={`crop-container ${running ? 'locked' : ''}`} ref={containerRef}
								onMouseDown={(e) => {
									if (running) return;
									setIsDragging(true);
									setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
								}}
								onMouseMove={(e) => {
									if (!isDragging || running) return;
									setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
								}}
								onMouseUp={() => setIsDragging(false)}
								onMouseLeave={() => setIsDragging(false)}
								style={{ cursor: running ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab') }}
							>
								<div className="crop-matted" style={{ aspectRatio: `${sz.w}/${sz.h}` }}>
									<img src={preview} alt="Crop" style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: naturalAR > (sz.w / sz.h) ? 'auto' : '100%',
										height: naturalAR > (sz.w / sz.h) ? '100%' : 'auto',
										transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
										transformOrigin: '0 0',
										pointerEvents: 'none'
									}} />
								</div>

								<div className="zoom-controls">
									<button onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}>−</button>
									<input type="range" min="0.7" max="4" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
									<button onClick={() => setZoom(Math.min(4, zoom + 0.1))}>+</button>
								</div>

								<div className="biometric-info">
									Biometric Rule: <strong>{Math.round(sz.headMin * 100)}-{Math.round(sz.headMax * 100)}% Head</strong>
								</div>
							</div>

							<div className="adjustment-tip">
								↔ Drag photo to position • Use slider to zoom
							</div>

							<ResetBtn onClick={reset} />
						</div>
					)}
				</Panel>

				{/* Step 2: Settings */}
				<Panel title="Step 2: Photo Settings">
					{!preview ? (
						<div className="tips-panel">
							<div className="tip-item">
								<span className="tip-icon">📐</span>
								<div><strong>Official Standards:</strong> All country formats follow strict regulatory biometric standards.</div>
							</div>
							<div className="tip-item">
								<span className="tip-icon">✨</span>
								<div><strong>AI Background:</strong> Automatically swap to white or blue background with one click.</div>
							</div>
						</div>
					) : (
						<div className="settings-scroll">
							<Control label="Country / Size Format">
								<Select value={sizeKey} onChange={setSizeKey} options={SIZES.map((s, i) => ({ value: String(i), label: s.label }))} />
							</Control>

							<Control label="Print Layout (Advanced)">
								<Select value={printSizeId} onChange={setPrintSizeId} options={PAPER_SIZES.map((p) => ({ value: p.id, label: p.label }))} />
							</Control>

							<div className="settings-row">
								<Control label="Background Color">
									<div className="bg-row">
										{BG_PRESETS.map((p) => (
											<button
												key={p.hex}
												type="button"
												className={`bg-swatch ${bgColor === p.hex ? "active" : ""}`}
												style={{ background: p.hex === "original" ? "#333" : (p.hex === "custom" ? customColor : p.hex) }}
												onClick={() => setBgColor(p.hex)}
												title={p.label}
											>
												{p.icon}
											</button>
										))}
									</div>
								</Control>

								<div className="check-row">
									<label className="checkbox-wrap">
										<input type="checkbox" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)} />
										<span>Add Border?</span>
									</label>
									<label className="checkbox-wrap">
										<input type="checkbox" checked={manualRemoveBg} onChange={(e) => setManualRemoveBg(e.target.checked)} />
										<span>Force No-BG</span>
									</label>
								</div>
							</div>

							{bgColor === "custom" && (
								<div className="custom-picker-box">
									<div className="bg-picker-wrap">
										<input
											type="color"
											className="bg-picker"
											value={customColor}
											onChange={(e) => setCustomColor(e.target.value)}
										/>
										<span className="picker-icon">🎨</span>
									</div>
									<span className="custom-hex-code">{customColor}</span>
								</div>
							)}

							<Control label="Brightness">
								<Slider min={60} max={160} step={1} value={brightness} onChange={v => setBrightness(Math.round(v))} formatValue={v => `${v}%`} />
							</Control>

							<Control label="Contrast">
								<Slider min={60} max={160} step={1} value={contrast} onChange={v => setContrast(Math.round(v))} formatValue={v => `${v}%`} />
							</Control>

							<Control label="JPEG Quality">
								<Slider min={50} max={100} step={1} value={jpegQ} onChange={v => setJpegQ(Math.round(v))} formatValue={v => `${v}%`} />
							</Control>

							<Btn onClick={convert} loading={running} disabled={running}>
								🪪 Generate & Save Passport Photo
							</Btn>

							<StatusBar status={status} />
						</div>
					)}
				</Panel>

			</ToolGrid >

			{/* Step 3: Result (Full Width) */}
			{
				result && (
					<Panel title="Step 3: Download Passport Result">
						<div ref={resultRef} className="result-layout">
							<PreviewBox checkerboard={bgColor === "transparent" || (bgColor === "original" && manualRemoveBg)}>
								<img src={result} alt="Passport result" className="result-img" />
							</PreviewBox>

							<div className="result-actions">
								<div className="download-controls">
									<div className="download-settings">
										<Control label="Download Format">
											<Select
												value={exportFormat}
												onChange={(v) => { setExportFormat(v); }}
												options={[
													{ value: "image/jpeg", label: "JPEG (Default)" },
													{ value: "image/webp", label: "WebP (Ultra Small)" },
													{ value: "image/png", label: "PNG (High Quality)" }
												]}
											/>
										</Control>
										<div className="check-row compact">
											<label className="checkbox-wrap">
												<input type="checkbox" checked={lowSize} onChange={(e) => setLowSize(e.target.checked)} />
												<span>Enable Target Size Compression?</span>
											</label>
										</div>

										{lowSize && (
											<div className="target-size-input">
												<label>Target Size (KB):</label>
												<input
													type="number"
													value={targetSizeKB}
													onChange={(e) => setTargetSizeKB(parseInt(e.target.value) || 0)}
													className="size-input-field"
												/>
											</div>
										)}
										<div className="refresh-actions">
											<Btn onClick={convert} loading={running} className="btn-secondary btn-sm">Apply & Refresh Specs</Btn>
										</div>
									</div>

									<InfoChips items={[
										{ label: "Format", value: exportFormat.split('/')[1].toUpperCase() },
										{ label: "Final Size", value: `${fileSizeInKB} KB` },
										{ label: "Target", value: lowSize ? `${targetSizeKB} KB` : "Max" },
										{ label: "DPI", value: "300" },
									]} />
								</div>

								<div className="download-wrap">
									<DownloadBtn
										href={result}
										filename={`passport-${sz.unit.replace(/\s/g, "")}.${exportFormat.split('/')[1] === 'jpeg' ? 'jpg' : exportFormat.split('/')[1]}`}
									>
										Download {exportFormat.split('/')[1].toUpperCase()} Now
									</DownloadBtn>
								</div>
							</div>
						</div>
					</Panel>
				)
			}

			<AdBanner slot="12345678" />

			<FAQ
				items={[
					{ q: "What is the US passport photo size?", a: "2×2 inches (51×51 mm). Our tool provides a high-res 600×600 pixel file at 300 DPI." },
					{ q: "Can I change the background to white?", a: "Yes. Simply click the white swatch in Step 2, and our AI will swap the background for you." },
					{ q: "Is this tool free?", a: "Yes, 100% free and processed directly in your browser for privacy." }
				]}
			/>
		</>
	);
}

export default function PassportPhoto() {
	return <ToastProvider><PassportPhotoInner /></ToastProvider>;
}
