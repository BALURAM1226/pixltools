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
	TargetSizeControl,
} from "../components/ToolShell";
import imageCompression from 'browser-image-compression';
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
	const [targetSizeEnabled, setTargetSizeEnabled] = useState(false);
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
			const scaledW = displayH * imgAR;
			ox = (displayW - scaledW) / 2;
		} else {
			const scaledH = displayW / imgAR;
			oy = (displayH - scaledH) / 2;
		}

		setZoom(1);
		setOffset({ x: ox, y: oy });
		setResult(null);
	}, [preview, sizeKey, naturalAR, sz.h, sz.w]);

	const convert = useCallback(async () => {
		if (!preview || running) return;

		const mattedBox = containerRef.current?.querySelector('.crop-matted');
		if (!mattedBox) return;

		setRunning(true);
		setStatus({ type: "processing", msg: "Rendering…" });

		try {
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
					setStatus({ type: "processing", msg: "AI is removing background…" });
					const { removeBackground } = await import("@imgly/background-removal");
					const blob = await removeBackground(file);
					const aiImg = new Image();
					const aiUrl = URL.createObjectURL(blob);
					await new Promise((r) => { aiImg.onload = r; aiImg.src = aiUrl; });
					sourceImage = aiImg; setAiCache(aiImg);
				}
			}

			const filterCanvas = document.createElement("canvas");
			filterCanvas.width = sourceImage.naturalWidth; filterCanvas.height = sourceImage.naturalHeight;
			const fCtx = filterCanvas.getContext("2d");
			fCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
			fCtx.drawImage(sourceImage, 0, 0);

			const displayW = containerRef.current?.querySelector('.crop-matted')?.offsetWidth || 300;
			const ratio = sz.w / displayW;

			const canvasAR = sz.w / sz.h;
			const imgAR = sourceImage.naturalWidth / sourceImage.naturalHeight;

			let baseW, baseH;
			if (imgAR > canvasAR) {
				baseH = sz.h;
				baseW = baseH * imgAR;
			} else {
				baseW = sz.w;
				baseH = baseW / imgAR;
			}

			const finalW = baseW * zoom;
			const finalH = baseH * zoom;
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

			let finalBlob;
			if (targetSizeEnabled) {
				const initialBlob = await new Promise(r => finalCanvas.toBlob(r, exportFormat, 0.95));
				finalBlob = await imageCompression(initialBlob, {
					maxSizeMB: targetSizeKB / 1024,
					maxWidthOrHeight: Math.max(finalCanvas.width, finalCanvas.height),
					useWebWorker: true,
					fileType: exportFormat
				});
			} else {
				finalBlob = await new Promise(r => finalCanvas.toBlob(r, exportFormat, jpegQ / 100));
			}

			const finalDataUrl = await new Promise(r => {
				const reader = new FileReader();
				reader.onloadend = () => r(reader.result);
				reader.readAsDataURL(finalBlob);
			});

			setFileSizeInKB(Math.round(finalBlob.size / 1024));
			setResult(finalDataUrl);
			setStatus({ type: "success", msg: "✓ Ready" });
		} catch (err) {
			console.error(err);
			setStatus({ type: "error", msg: err.message });
		} finally {
			setRunning(false);
		}
	}, [preview, running, sz, paper, bgColor, customColor, brightness, contrast, zoom, offset, showBorders, manualRemoveBg, aiCache, file, exportFormat, targetSizeEnabled, targetSizeKB, jpegQ]);

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
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(f);
	}, [toast]);

	const reset = () => {
		setPreview(null); setResult(null); setAiCache(null); setStatus(null);
		setZoom(1); setOffset({ x: 0, y: 0 });
	};

	return (
		<>
			<div className="passport-page">
				<SEO
					title="Printable Passport Size Photo Maker – Global Official Standards"
					description="Generate official passport photos for US, UK, India, EU, and 100+ countries. Choose background colors and print layouts (4x6, A4) for free. 100% private."
					keywords="passport size photo maker online, printable passport photo, 2x2 inch photo, 35x45 mm photo maker, official visa photo generator, free passport photo tool"
					canonicalPath="/passport-photo"
				/>

				<ToolHeader
					title="Passport"
					highlight="Converter"
					badge="🪪 Pro Formats"
					desc="Professional passport & visa photo generator. Support for US, UK, India, EU and more with biometric precise alignment."
				/>

				<ToolGrid>
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
								<Control label="Country / Size Format" id="size-key">
									<Select
										id="size-key"
										label="Select country or size format"
										value={sizeKey}
										onChange={setSizeKey}
										options={SIZES.map((s, i) => ({ value: String(i), label: s.label }))}
									/>
								</Control>

								<Control label="Print Layout" id="print-size">
									<Select
										id="print-size"
										label="Select paper print size"
										value={printSizeId}
										onChange={setPrintSizeId}
										options={PAPER_SIZES.map((p) => ({ value: p.id, label: p.label }))}
									/>
								</Control>

								<div className="settings-row">
									<Control label="Background Color" id="bg-color-group">
										<div className="bg-row" role="radiogroup">
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
											<span>Force AI BG</span>
										</label>
									</div>

									<div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
										<TargetSizeControl
											enabled={targetSizeEnabled}
											onToggle={setTargetSizeEnabled}
											value={targetSizeKB}
											onChange={setTargetSizeKB}
											min={5}
											max={Math.round((file?.size || 0) / 1024) || 2048}
											step={1}
										/>
									</div>
								</div>

								{bgColor === "custom" && (
									<div className="custom-picker-box">
										<input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
										<span>{customColor}</span>
									</div>
								)}

								<Control label="Brightness">
									<Slider min={60} max={160} value={brightness} onChange={v => setBrightness(Math.round(v))} formatValue={v => `${v}%`} />
								</Control>

								<Control label="Contrast">
									<Slider min={60} max={160} value={contrast} onChange={v => setContrast(Math.round(v))} formatValue={v => `${v}%`} />
								</Control>

								<Control label="JPEG Quality">
									<Slider min={50} max={100} value={jpegQ} onChange={v => setJpegQ(Math.round(v))} formatValue={v => `${v}%`} />
								</Control>

								<Btn onClick={convert} loading={running}>🪪 Create Passport Photo</Btn>
								<StatusBar status={status} />
							</div>
						)}
					</Panel>
				</ToolGrid>

				{result && (
					<Panel title="Step 3: Download Passport Result" className="grid-full result-panel">
						<div ref={resultRef} className="result-layout">
							<PreviewBox checkerboard={bgColor === "transparent"}>
								<img src={result} alt="Passport result" className="result-img" />
							</PreviewBox>

							<div className="result-actions">
								<div className="download-controls">
									<div className="download-settings">
										<Control label="Download Format">
											<Select
												value={exportFormat}
												onChange={setExportFormat}
												options={[
													{ value: "image/jpeg", label: "JPEG (Default)" },
													{ value: "image/webp", label: "WebP (Ultra Small)" },
													{ value: "image/png", label: "PNG (High Quality)" }
												]}
											/>
										</Control>
										<div style={{ marginTop: 12 }}>
											<TargetSizeControl
												enabled={targetSizeEnabled}
												onToggle={setTargetSizeEnabled}
												value={targetSizeKB}
												onChange={setTargetSizeKB}
												min={5}
												max={Math.round((file?.size || 0) / 1024) || 2048}
												step={1}
											/>
										</div>
									</div>

									<InfoChips items={[
										{ label: "Format", value: exportFormat.split('/')[1].toUpperCase() },
										{ label: "Final Size", value: `${fileSizeInKB} KB` },
										{ label: "Target", value: targetSizeEnabled ? `${targetSizeKB} KB` : "Max" }
									]} />
								</div>

								<DownloadBtn href={result} filename={`passport-${sz.unit.replace(/\s/g, "")}.${exportFormat.split('/')[1] === 'jpeg' ? 'jpg' : exportFormat.split('/')[1]}`}>
									Download Passport Photo
								</DownloadBtn>
							</div>
						</div>
					</Panel>
				)}
			</div>

			<AdBanner slot="12345678" />

			<SEOContent title="Printable Passport & Visa Photo Maker for Any Country">
				<p>Generate professional passport photos meeting global official standards instantly in your browser.</p>
			</SEOContent>

			<FAQ
				items={[
					{ q: "What is the official passport photo size for India?", a: "The standard size is 35x45 mm." },
					{ q: "How can I print my passport photo?", a: "Select the '4x6 in' or 'A4 Sheet' print layout." }
				]}
			/>
		</>
	);
}

export default function PassportPhoto() {
	return <ToastProvider><PassportPhotoInner /></ToastProvider>;
}
