import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './DropZone.css';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ACCEPT_LABELS = {
  'image/*': 'JPG, PNG, WEBP, GIF, BMP, TIFF, SVG, ICO',
  'image/jpeg,image/png,image/webp,image/bmp': 'JPG, PNG, WEBP, BMP',
};

export default function DropZone({
  onFile,
  onError,
  accept = { 'image/*': [] },
  multiple = false,
  label = 'Drop your image here',
  sublabel,
}) {
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') {
        onError?.('File too large. Maximum size is 50MB.');
      } else if (err.code === 'file-invalid-type') {
        onError?.('Invalid file type. Please upload an image file.');
      } else {
        onError?.(err.message || 'Invalid file.');
      }
      return;
    }
    if (accepted?.length > 0) {
      onFile(multiple ? accepted : accepted[0]);
    }
  }, [onFile, onError, multiple]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize: MAX_FILE_SIZE,
  });

  const acceptLabel = sublabel || ACCEPT_LABELS[Object.keys(accept).join(',')] || 'Image files';

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive && !isDragReject ? 'dz-active' : ''} ${isDragReject ? 'dz-reject' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="dz-inner">
        <div className="dz-icon-wrap">
          {isDragReject
            ? <svg className="dz-icon red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            : <svg className="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
          }
        </div>
        <div className="dz-text">
          <p className="dz-label">{isDragActive ? (isDragReject ? 'File not supported!' : 'Drop it here!') : label}</p>
          <p className="dz-sub">{isDragActive ? '' : <><strong>Click to browse</strong> or drag &amp; drop</>}</p>
          <p className="dz-formats">{acceptLabel} · Max 50MB</p>
        </div>
      </div>
    </div>
  );
}
