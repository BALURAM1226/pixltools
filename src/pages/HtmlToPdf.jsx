import React, { useState, useRef } from 'react';
import SEO from '../components/SEO';
import Editor from '@monaco-editor/react';
import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Control, Select, Btn,
  ResetBtn, AdBanner, FAQ, SEOContent, DownloadBtn, StatusBar, ProgressBar
} from '../components/ToolShell';
import { 
  Code2, Eye, Sparkles, Monitor
} from 'lucide-react';
import '../components/ToolShell.css';
import './HtmlToPdf.css';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  body { 
    font-family: 'Inter', sans-serif; 
    padding: 20px;
    background: #ffffff;
    color: #333;
  }
  .card {
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }
  h1 { color: #2563eb; }
  p { line-height: 1.6; }
</style>
</head>
<body>
  <div class="card">
    <h1>Welcome to iLoveToolHub</h1>
    <p>This is a live preview of your HTML content.</p>
    <p>You can edit this code locally and convert it to a professional PDF with single-click precision.</p>
    <ul>
      <li>Fast Processing</li>
      <li>Private Rendering</li>
      <li>High Resolution</li>
    </ul>
  </div>
</body>
</html>`;

function HtmlToPdfInner() {
  const toast = useToast();
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [format, setFormat] = useState('a4');
  const [orientation, setOrientation] = useState('p');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);


  const resultRef = useRef(null);

  const convertToPdf = async () => {
    setRunning(true);
    setProgress(10);
    setStatus({ type: 'processing', msg: 'Starting secure render...' });
    
    try {
      // Create an isolated iframe to prevent style leakage (the "white screen" issue)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-10000px';
      iframe.style.top = '0';
      iframe.style.width = format === 'a4' ? '794px' : (format === 'letter' ? '816px' : '1122px');
      iframe.style.height = 'auto'; // Will expand
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();

      setProgress(30);
      setStatus({ type: 'processing', msg: 'Isolating styles & loading assets...' });

      // Wait for content (images, fonts) to load
      await new Promise(r => setTimeout(r, 800));

      const container = doc.body;
      
      setProgress(60);
      setStatus({ type: 'processing', msg: 'Capturing high-resolution snapshot...' });

      const canvas = await toCanvas(container, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: container.scrollWidth,
        height: container.scrollHeight
      });

      // Cleanup immediately to restore theme integrity
      document.body.removeChild(iframe);

      setProgress(85);
      setStatus({ type: 'processing', msg: 'Generating PDF document...' });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: format
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ PDF Generated successfully!' });
      toast('PDF ready!', 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error(err);
      toast('Failed to render HTML. Check your code for errors.', 'error');
      setStatus({ type: 'error', msg: 'Render failed' });
    } finally {
      setRunning(false);
    }
  };


  const reset = () => {
    setHtml(DEFAULT_HTML); setPreviewUrl(null); setStatus(null); setProgress(0);
  };

  return (
    <div className="html-to-pdf-page">
      <SEO 
        title="HTML to PDF Converter Online - High Fidelity Rendering"
        description="Convert raw HTML and CSS code to a professional PDF document instantly. Private, browser-based rendering with customizable page sizes."
      />

      <ToolHeader 
        title="HTML to" 
        highlight="PDF" 
        icon={<Code2 size={24} />}
        desc="Professional-grade HTML code to PDF conversion. Perfect for reports, invoices, and web snapshots."
      />

      <ToolGrid>
        <Panel title="Step 1: Editor" className="grid-full editor-panel">
          <div className="editor-container-wrap">
            <Editor
              height="450px"
              defaultLanguage="html"
              defaultValue={DEFAULT_HTML}
              theme="vs-dark"
              onChange={(value) => setHtml(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono',
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
              }}
            />
          </div>
          <div className="editor-footer">
            <div className="footer-info">
              <Sparkles size={14} />
              <span>Real-time code editing enabled. Styles are isolated.</span>
            </div>
          </div>
        </Panel>

        <Panel title="Step 2: Output Settings">
          <div className="settings-stack">
            <Control label="Page Format" hint={format.toUpperCase()}>
              <Select 
                value={format} 
                onChange={setFormat}
                options={[
                  { value: 'a4', label: 'A4 Standard' },
                  { value: 'letter', label: 'US Letter' },
                  { value: 'a3', label: 'A3 Poster' }
                ]}
              />
            </Control>

            <Control label="Orientation" hint={orientation === 'p' ? 'Portrait' : 'Landscape'}>
              <div className="orientation-toggle">
                <button 
                  className={orientation === 'p' ? 'active' : ''} 
                  onClick={() => setOrientation('p')}
                >
                  <Monitor size={16} /> Portrait
                </button>
                <button 
                  className={orientation === 'l' ? 'active' : ''} 
                  onClick={() => setOrientation('l')}
                >
                  <Monitor size={16} style={{ transform: 'rotate(90deg)' }} /> Landscape
                </button>
              </div>
            </Control>

            <div className="action-stack">
              <Btn onClick={convertToPdf} loading={running} disabled={running}>
                🚀 Convert to PDF Now
              </Btn>
              <StatusBar status={status} />
              {running && <ProgressBar value={progress} />}
            </div>
            
            <ResetBtn onClick={reset} />
          </div>
        </Panel>

        <Panel title="Step 3: Preview & Download" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {!previewUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Eye size={40} />
                  </div>
                  <p>Convert your HTML in Step 2 to generate the preview here.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="HTML Generated PDF"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Render Complete</span>
                      <span className="pill-subtitle">High-fidelity PDF generated</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`html_render_${Date.now()}.pdf`} full={false} style={{ padding: '12px 28px' }}>
                Download Result PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="0987654321" />

      <SEOContent title="Transform HTML Code to Professional PDF Documents">
        <p>Whether you are a developer testing a layout, a designer creating rapid prototypes, or an accountant generating invoices from raw code, our <strong>HTML to PDF</strong> tool provides a seamless, private environment for conversion.</p>

        <h3>Modern Rendering Engine</h3>
        <p>We use a combination of <strong>HTML-to-Image technology</strong> and <strong>jsPDF</strong> to ensure that what you see in our code editor is represented accurately in the final document. We support modern CSS features including flexbox, CSS variables, and Google Fonts.</p>

        <h3>Key Features:</h3>
        <ul>
          <li><strong>Real-time Editor:</strong> Powered by the Monaco engine (the same as VS Code) for a professional coding experience.</li>
          <li><strong>Privacy First:</strong> Your code is rendered locally. We never see your content or store your documents on our servers.</li>
          <li><strong>High-DPI Support:</strong> Our converter uses a 2.0x pixel ratio to ensure text is Sharp and images are crisp even on zoomed-in PDF views.</li>
          <li><strong>Customizable Layouts:</strong> Choose between A4, Letter, and A3 formats with portrait or landscape orientation.</li>
        </ul>
      </SEOContent>

      <FAQ items={[
        { q: 'Can I use external CSS or JavaScript?', a: 'You can use inline <style> tags and links to remote CSS (like Google Fonts or Tailwind Play CDN). JS execution is limited during the rendering phase to ensure document stability.' },
        { q: 'Is the PDF text searchable?', a: 'Currently, the high-fidelity renderer captures the HTML as a high-density vector-embedded image within the PDF to preserve complex CSS styling. While this ensures perfect visual matching, text selection may be limited.' },
        { q: 'How do I add images to my HTML?', a: 'You can use standard <img> tags with absolute URLs (https://...). Base64 embedded images are also supported for 100% offline document generation.' },
        { q: 'Are there file size limits?', a: 'Since it runs in your browser, the limit depends on your browser\'s memory. It is optimized for single-page documents and complex layouts.' }
      ]} />
    </div>
  );
}

export default function HtmlToPdf() {
  return (
    <ToastProvider>
      <HtmlToPdfInner />
    </ToastProvider>
  );
}
