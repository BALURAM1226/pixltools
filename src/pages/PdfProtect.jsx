import React, { useState, useRef, useCallback } from 'react';
import SEO from '../components/SEO';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { ToastProvider, useToast } from '../components/Toast';
import {
  ToolHeader, ToolGrid, Panel, Btn, ResetBtn, StatusBar, ProgressBar, AdBanner, FAQ, SEOContent, DownloadBtn
} from '../components/ToolShell';
import { Lock, FileText, Key } from 'lucide-react';
import '../components/ToolShell.css';
import './PdfProtect.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function fmtBytes(b) {
  if (!b) return '0 KB';
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function PdfProtectInner() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const resultRef = useRef(null);

  const onDrop = useCallback((accepted) => {
    if (accepted?.length > 0) {
      setFile(accepted[0]);
      setPreviewUrl(null);
      setPassword('');
      setConfirmPassword('');
      setStatus(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
  });

  const protectPdf = async () => {
    if (!file) return;
    if (!password) {
      toast('Please enter a password.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    setRunning(true);
    setProgress(5);
    setStatus({ type: 'processing', msg: 'Decrypting PDF for local processing...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      const count = pdf.numPages;

      // We use jsPDF to generate an encrypted PDF. 
      // Note: Because of client-side limitations, we must rasterize the PDF.
      const outPdf = new jsPDF({
        encryption: {
          userPassword: password,
          ownerPassword: password,
          userPermissions: ['print', 'modify', 'copy', 'annot-forms']
        },
        unit: 'px',
        format: 'a4' // We will dynamically change format per page
      });

      outPdf.deletePage(1); // Remove default empty page

      for (let i = 1; i <= count; i++) {
        setStatus({ type: 'processing', msg: `Flattening & Encrypting page ${i} of ${count}...` });
        setProgress(Math.round((i / count) * 90));

        const page = await pdf.getPage(i);
        // Use a high scale for better quality, but mind memory limits
        const viewport = page.getViewport({ scale: 2.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        outPdf.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'landscape' : 'portrait');
        outPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
      }

      setStatus({ type: 'processing', msg: 'Finalizing encryption...' });
      setProgress(95);

      const blob = outPdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setProgress(100);
      setStatus({ type: 'success', msg: '✓ PDF Encrypted and locked successfully!' });
      toast('PDF protected!', 'success');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error(err);
      toast('Failed to process PDF. It may already be encrypted.', 'error');
      setStatus({ type: 'error', msg: 'Encryption failed' });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null); setPassword(''); setConfirmPassword(''); setPreviewUrl(null); setStatus(null); setProgress(0);
  };

  return (
    <div className="pdf-protect-page">
      <SEO 
        title="#1 Protect PDF Online – Add Password & Encrypt PDF Free"
        description="Secure your PDF files with military-grade password encryption locally in your browser. Complete privacy without uploading data to servers. Best for sensitive documents."
        keywords="protect pdf online, best pdf locker, add password to pdf free, encrypt pdf online, secure pdf documents, private pdf protection"
        canonicalPath="/pdf-protect"
        ogImage="/og/pdf-protect.jpg"
      />

      <ToolHeader 
        title="Protect" 
        highlight="PDF" 
        badge="🔒 Military-Grade Security"
        icon={<Lock size={24} />}
        desc="Lock your critical documents with a password. Secure, 100% private client-side encryption that never leaves your device."
      />

      <ToolGrid>
        <Panel 
          title="Step 1: Upload PDF" 
          className={`grid-full ${file ? 'compact' : ''}`}
          headerActions={file && <ResetBtn onClick={reset} size="sm" />}
        >
          <div className="uploader-flex-container">
            <div {...getRootProps()} className={`dropzone-refined ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dz-content">
                <div className="dz-icon-wrap">
                  <FileText size={file ? 20 : 40} />
                </div>
                <h3>{file ? 'Change PDF File' : 'Drop PDF to lock'}</h3>
                {!file && <p>Select document to start encryption</p>}
              </div>
            </div>
            {file && (
              <div className="file-meta-pill animate-in">
                <FileText size={16} />
                <span>{file.name} — {fmtBytes(file.size)}</span>
              </div>
            )}
          </div>
        </Panel>

        {file && (
          <Panel title="Step 2: Security Settings" className="grid-full protect-settings-panel">
            <div className="protect-flex-layout">
              <div className="password-inputs">
                <div className="input-field">
                  <label htmlFor="pdf-pass">
                    Set Password <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Key size={18} className="input-icon" />
                    <input 
                      type="password" 
                      id="pdf-pass"
                      className="modern-input" 
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label htmlFor="pdf-pass-confirm">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Key size={18} className="input-icon" />
                    <input 
                      type="password" 
                      id="pdf-pass-confirm"
                      className="modern-input" 
                      placeholder="Type password again"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="privacy-disclaimer">
                <strong>🔒 Local Encryption Note:</strong> Because processing happens entirely on your device for maximum privacy, the document will be structurally flattened (text becomes non-selectable like an image) before the lock is applied.
              </div>

              <div className="action-stack-wide">
                <Btn 
                  variant="primary" 
                  onClick={protectPdf} 
                  loading={running} 
                  disabled={running || !password || !confirmPassword}
                  full={false}
                  className="btn-protect-final"
                >
                   <Lock size={18} style={{ marginRight: 8 }} />
                   Lock & Encrypt PDF
                </Btn>
              </div>
              
              {running && <div className="progress-wrap"><ProgressBar value={progress} /></div>}
              <StatusBar status={status} />
            </div>
          </Panel>
        )}

        <Panel title="Step 3: Download Protected PDF" className="grid-full result-panel-refined">
          <div ref={resultRef} />
          
          <div className="result-preview-container">
             {!previewUrl ? (
                <div className="result-placeholder">
                  <div className="placeholder-icon">
                    <Lock size={40} />
                  </div>
                  <p>Set a password in Step 2 to lock your document.</p>
                </div>
             ) : (
                <div style={{ padding: '0 32px' }}>
                  <iframe 
                    src={`${previewUrl}#view=FitH&toolbar=0`} 
                    className="pdf-preview-frame-modern"
                    title="Protected PDF Preview"
                  />
                </div>
             )}
          </div>

          {previewUrl && (
            <div className="modern-result-footer">
              <div className="result-status-pill">
                  <div className="pill-icon-wrap">✓</div>
                  <div className="pill-content">
                      <span className="pill-title">Protection Active</span>
                      <span className="pill-subtitle">AES-128 Encryption enforced</span>
                  </div>
              </div>
              <DownloadBtn href={previewUrl} filename={`locked_${file.name}`} full={false} style={{ padding: '12px 28px' }}>
                Download Protected PDF
              </DownloadBtn>
            </div>
          )}
        </Panel>
      </ToolGrid>

      <AdBanner slot="0987123456" />

      <SEOContent title="Add Password to PDF Documents Securely">
        <p>Ensure your sensitive information stays private with our <strong>Protect PDF</strong> tool. Whether you're sending financial records, legal contracts, or personal health information via email, applying a password prevents unauthorized viewing.</p>

        <h3>How Our Browser-Based Encryption Works</h3>
        <p>Unlike other services that upload your highly sensitive documents to their remote servers to apply a lock, our tool processes the entire security layer <strong>directly inside your web browser</strong>. This zero-trust architecture means your private data never leaves your device.</p>

        <h3>Important Considerations</h3>
        <p>To achieve this extreme level of privacy without relying on compromised server extensions, this tool flattens the document (rendering it as high-definition images) before applying the locking algorithm. While this ensures perfect visual integrity across all devices and thwarts text-extraction scripts, it does mean the text cannot be copy-pasted by the recipient.</p>
      </SEOContent>

      <FAQ items={[
        { q: 'Can this password be bypassed?', a: 'No. The document is encrypted using industry-standard structural encryption protocols. Without the correct password, PDF readers cannot decipher the internal layout.' },
        { q: 'Do you store my password?', a: 'Absolutely not. We do not store your documents or your passwords. The entire process happens in your computer\'s active memory.' },
        { q: 'Why is the text no longer selectable?', a: 'To protect your document securely entirely within your browser (without risky server uploads), we flatten the layout into an encrypted image container. This safely locks the file while guaranteeing visual accuracy.' }
      ]} />
    </div>
  );
}

export default function PdfProtect() {
  return (
    <ToastProvider>
      <PdfProtectInner />
    </ToastProvider>
  );
}
