# 🖼️ PixlTools v2.0 — Modern Free Image Tools Website

A production-ready, SEO-optimized React website with 5 powerful image tools and modern glassmorphism design.

## ✨ Features

| Tool | What it does |
|------|-------------|
| 🔄 **Image Converter** | Convert between JPG, PNG, WEBP, SVG, GIF, BMP, TIFF, ICO, AVIF |
| 🪪 **Passport Photo** | 8 country formats: US, UK, India, EU, China, Australia, Canada |
| 📄 **Image to PDF** | Multi-image PDF with reorderable pages, A4/Letter/Auto size |
| 🗜️ **Image Compressor** | Up to 90% compression, JPEG/WEBP/PNG output, savings visualizer |
| ✂️ **BG Remover** | AI-powered (RMBG neural net), transparent or custom background |

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
# → Opens at http://localhost:3000

# 3. Build for production
npm run build
```
## 🔒 Privacy

All image processing is **100% client-side** using:
- Canvas API (format conversion, passport photos)
- browser-image-compression (Web Workers)
- @imgly/background-removal (WebAssembly AI)
- jsPDF (PDF generation)

**No images are ever uploaded to any server.**

---
*Built with React 18 · All tools browser-based · Zero server costs*
