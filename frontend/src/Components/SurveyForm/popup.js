import React, { useState } from 'react';

const FormSuccessPopup = ({ formId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const formLink = `/form/${formId}`;
  const fullFormLink = `${window.location.origin}${formLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullFormLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="zt-modal-back" onClick={onClose}>
      <div className="zt-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="zt-tag solid">Published</span>
        <h2 className="zt-page-title" style={{ fontSize: 40, marginTop: 18 }}>Your survey is live.</h2>
        <p className="zt-page-sub">Share this link. Respondents verify they’re human, then answer anonymously.</p>
        <div className="zt-copy">
          <input className="zt-input" readOnly value={fullFormLink} onFocus={(e) => e.target.select()} />
          <button className="zt-btn sm" onClick={handleCopyLink}>{copied ? 'Copied ✓' : 'Copy'}</button>
        </div>
        <div className="zt-actions" style={{ marginTop: 26 }}>
          <a className="zt-btn primary" href={formLink} target="_blank" rel="noreferrer">Open survey →</a>
          <button className="zt-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FormSuccessPopup;
