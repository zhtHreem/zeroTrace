import React from 'react';

// The mark: a zero with a redaction bar struck through it (zero = nothing kept, bar = identity removed).
export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="ZeroTrace" style={{ display: 'block', flexShrink: 0 }}>
      <ellipse cx="32" cy="32" rx="15" ry="21" fill="none" stroke="currentColor" strokeWidth="9" />
      <rect x="8" y="28" width="48" height="8" fill="#d9331f" transform="rotate(-7 32 32)" />
    </svg>
  );
}

export default function Logo({ size = 28 }) {
  return (
    <>
      <LogoMark size={size} />
      <span>zero<b>Trace</b></span>
    </>
  );
}
