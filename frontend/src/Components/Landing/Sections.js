import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const TERMS = ['Zero-knowledge proofs', 'One person, one response', 'Time-locked results', 'No tracking', 'Encrypted at rest', 'Proof of humanity'];

export function Marquee() {
  const row = [...TERMS, ...TERMS];
  return (
    <div className="zt-marquee" aria-hidden="true">
      <div className="zt-marquee-track">
        {row.map((t, i) => <span key={`a${i}`}>{t}</span>)}
        {row.map((t, i) => <span key={`b${i}`}>{t}</span>)}
      </div>
    </div>
  );
}

const FEATURES = [
  { t: 'Verifiable uniqueness', d: 'A zero-knowledge proof backs every response, so you can trust it’s one person, one answer, with no identity attached.' },
  { t: 'Proof of humanity', d: 'Respondents are verified as real people before they submit, which keeps scripts and bot farms out of your data.' },
  { t: 'Complete anonymity', d: 'Nothing in a response points back to the person who wrote it. There is nothing to leak because it was never collected.' },
  { t: 'Time-locked results', d: 'Responses stay encrypted until the moment you choose, then open automatically. Not a minute sooner.' },
];

export function Features() {
  return (
    <section className="zt-sec" id="about">
      <div className="zt-wrap">
        <motion.div {...reveal}>
          <div className="zt-mono">Why ZeroTrace</div>
          <h2 className="zt-h2">Honest answers need <em>safe</em> questions.</h2>
        </motion.div>
        <div className="zt-ledger">
          {FEATURES.map((f, i) => (
            <motion.div className="zt-led" key={f.t} {...reveal}>
              <span className="n">0{i + 1}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <span />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LiveSurveys() {
  const navigate = useNavigate();
  const [forms, setForms] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => alive && setForms(d))
      .catch(() => alive && setError(true));
    return () => { alive = false; };
  }, []);

  return (
    <section className="zt-sec" id="surveys" style={{ paddingTop: 0 }}>
      <div className="zt-wrap">
        <motion.div className="zt-row" {...reveal}>
          <div>
            <div className="zt-mono">Open now</div>
            <h2 className="zt-h2">Live <em>surveys</em></h2>
          </div>
          <Link to="/surveys" className="zt-btn">View all →</Link>
        </motion.div>

        {error ? (
          <div className="zt-empty">Couldn’t load surveys right now. Please try again later.</div>
        ) : forms === null ? (
          <div className="zt-ledger">{[0, 1, 2].map((i) => <div key={i} className="zt-skel" />)}</div>
        ) : forms.length === 0 ? (
          <div className="zt-empty">No surveys yet. Be the first to create one.</div>
        ) : (
          <div className="zt-ledger">
            {forms.slice(0, 6).map((f, i) => (
              <motion.div key={f._id} className="zt-led link" onClick={() => navigate(`/form/${f._id}`)} {...reveal}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p className="zt-mono" style={{ alignSelf: 'center' }}>{new Date(f.createdAt).toLocaleDateString()}</p>
                <span className="go">→</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="zt-final">
      <div className="zt-wrap">
        <motion.div {...reveal}>
          <div className="zt-mono">Ready when you are</div>
          <h2 className="zt-h2">Ask. Learn. <span className="redact">Vanish.</span></h2>
          <div className="zt-cta">
            <Link to="/createform" className="zt-btn primary">Create your first survey →</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
