import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Shell from '../Landing/Chrome';

function Survey() {
  const navigate = useNavigate();
  const [forms, setForms] = useState(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => alive && setForms(d))
      .catch(() => alive && setError(true));
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => ['All', ...new Set((forms || []).map((f) => f.category).filter(Boolean))], [forms]);
  const shown = useMemo(
    () => (forms || []).filter((f) => (filter === 'All' || f.category === filter) && f.title.toLowerCase().includes(q.toLowerCase())),
    [forms, filter, q]
  );

  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-wrap">
          <div className="zt-row">
            <div>
              <div className="zt-mono">Index</div>
              <h1 className="zt-page-title">Open surveys</h1>
              <p className="zt-page-sub">Pick one and answer honestly. Your identity is never attached to what you say.</p>
            </div>
            <Link to="/createform" className="zt-btn primary">Create a survey →</Link>
          </div>

          <div className="zt-toolbar">
            <div className="zt-chips">
              {categories.map((c) => (
                <button key={c} className={`zt-chip${filter === c ? ' on' : ''}`} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>
            <input className="zt-input zt-search" placeholder="Search surveys" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          {error ? (
            <div className="zt-empty">Couldn’t load surveys right now. Please try again later.</div>
          ) : forms === null ? (
            <div className="zt-ledger">{[0, 1, 2, 3].map((i) => <div key={i} className="zt-skel" />)}</div>
          ) : shown.length === 0 ? (
            <div className="zt-empty">{forms.length === 0 ? 'No surveys yet. Be the first to create one.' : 'Nothing matches that search.'}</div>
          ) : (
            <div className="zt-ledger">
              {shown.map((f, i) => (
                <div key={f._id} className="zt-led link" onClick={() => navigate(`/form/${f._id}`)}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{f.title}</h3>
                  <p>
                    {f.category && <span className="zt-tag" style={{ marginRight: 10 }}>{f.category}</span>}
                    <span className="zt-mono">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </p>
                  <span className="go">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
export default Survey;
