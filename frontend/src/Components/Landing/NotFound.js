import React from 'react';
import { Link } from 'react-router-dom';
import Shell from './Chrome';

export default function NotFound() {
  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-narrow" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="zt-mono">Error 404</div>
          <h1 className="zt-page-title" style={{ fontSize: 'clamp(54px, 9vw, 120px)' }}>
            Page <span className="redact" style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '0 0.12em' }}>not found.</span>
          </h1>
          <p className="zt-page-sub" style={{ margin: '24px auto 0' }}>This page leaves no trace, because it was never here.</p>
          <div className="zt-cta" style={{ justifyContent: 'center', marginTop: 36 }}>
            <Link to="/" className="zt-btn primary">Back home →</Link>
            <Link to="/surveys" className="zt-btn">Browse surveys</Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
