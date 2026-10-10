import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ease = [0.22, 1, 0.36, 1];

function Redact({ children, on, delay }) {
  return (
    <span className="zt-bar">
      {children}
      <motion.i
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: 0.45, delay: on ? delay : 0, ease }}
      />
    </span>
  );
}

function Dossier() {
  const [on, setOn] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setOn(false);
    const t = setTimeout(() => setOn(true), 1100);
    return () => clearTimeout(t);
  }, [run]);

  return (
    <motion.div className="zt-doc" initial={{ opacity: 0, y: 30, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 1.2 }} transition={{ duration: 0.9, ease }}>
      <div className="zt-doc-head">
        <div>
          <div className="zt-mono">Response record</div>
          <div className="zt-doc-title">№ 0417</div>
        </div>
        <span className="zt-tag">Sample</span>
      </div>
      <dl style={{ margin: 0 }}>
        <div className="zt-field"><dt>Name</dt><dd><Redact on={on} delay={0}>Maya Okonkwo</Redact></dd></div>
        <div className="zt-field"><dt>Email</dt><dd><Redact on={on} delay={0.18}>maya.o@northwind.com</Redact></dd></div>
        <div className="zt-field"><dt>Device</dt><dd><Redact on={on} delay={0.36}>Pixel 8 · Lahore, PK</Redact></dd></div>
        <div className="zt-field"><dt>Team</dt><dd><Redact on={on} delay={0.54}>Platform / Eng-3</Redact></dd></div>
      </dl>
      <div className="zt-q">
        <p>Do you feel safe raising concerns with leadership?</p>
        <blockquote>Honestly, no. Last time someone did, it didn’t end well for them.</blockquote>
      </div>
      <motion.div
        className="zt-stamp"
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.8, rotate: -9 }}
        transition={{ duration: 0.35, delay: on ? 0.95 : 0, ease }}
      >
        Proof verified
      </motion.div>
      <div className="zt-doc-foot">
        <span className="zt-mono">Answer kept · identity removed</span>
        <button className="zt-replay" onClick={() => setRun((r) => r + 1)}>↻ Replay</button>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="zt-hero">
      <div className="zt-wrap zt-hero-grid">
        <div>
          <motion.div className="zt-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            Anonymous surveys · zero-knowledge proofs
          </motion.div>
          <motion.h1 className="zt-h1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            Ask honestly.<br />Learn everything.<br />Know <span className="redact">no one.</span>
          </motion.h1>
          <motion.p className="zt-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease }}>
            People tell the truth when it can’t be traced back to them. ZeroTrace proves each respondent is a real, unique person, then keeps their identity out of the answer.
          </motion.p>
          <motion.div className="zt-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease }}>
            <Link to="/createform" className="zt-btn primary">Create a survey →</Link>
            <Link to="/surveys" className="zt-btn">Browse surveys</Link>
          </motion.div>
        </div>
        <Dossier />
      </div>
    </section>
  );
}
