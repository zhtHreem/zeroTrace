import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Shell from '../Landing/Chrome';

// count how many times each answer was chosen
const aggregate = (answers) => {
  const counts = {};
  answers.forEach((a) => {
    if (a?.answer) (Array.isArray(a.answer) ? a.answer : [a.answer]).forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  });
  return Object.entries(counts).sort((x, y) => y[1] - x[1]);
};

const ResultsPage = () => {
  const { formId } = useParams();
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms/${formId}/responses`);
        setResponses(await response.json());
        setError(null);
      } catch (err) {
        console.error('Failed to fetch responses:', err);
        setError('Failed to load responses.');
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [formId]);

  if (loading) return <Shell><div className="zt-center">Loading results…</div></Shell>;
  if (error) return <Shell><div className="zt-center">{error}</div></Shell>;

  const hasResponses = Array.isArray(responses) && responses.length > 0;
  const unlocked = hasResponses && responses[0]?.decrypted;

  const renderResponses = (question, answers) => {
    const type = question.questionType?.toLowerCase().trim();
    const clean = answers.filter(Boolean);

    if (['multiple choice', 'checkbox', 'dropdown', 'drop down'].includes(type)) {
      const rows = aggregate(clean);
      if (!rows.length) return <p className="zt-hint">No responses for this question.</p>;
      const total = clean.length;
      return rows.map(([label, n]) => {
        const pct = Math.round((n / total) * 100);
        return (
          <div key={label} className="zt-bar-row">
            <div className="zt-bar-track">
              <div className="zt-bar-fill" style={{ width: `${pct}%` }} />
              <span className="zt-bar-label">{label}</span>
            </div>
            <span className="zt-mono" style={{ textAlign: 'right' }}>{pct}% · {n}</span>
          </div>
        );
      });
    }
    if (type === 'short answer' || type === 'paragraph') {
      return clean.length ? clean.map((a, i) => (
        <div key={i} className="zt-answer"><p>{a.answer || 'No response'}</p></div>
      )) : <p className="zt-hint">No responses for this question.</p>;
    }
    return <p className="zt-hint">Unsupported question type: {type || 'unknown'}.</p>;
  };

  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-narrow">
          <div className="zt-mono">Results</div>
          <h1 className="zt-page-title">What people said</h1>
          {hasResponses && <p className="zt-page-sub">{responses.length} anonymous response{responses.length === 1 ? '' : 's'}. No names, no identifiers.</p>}

          {!hasResponses ? (
            <div className="zt-empty">No responses yet.</div>
          ) : !unlocked ? (
            <div className="zt-panel" style={{ marginTop: 36 }}>
              <span className="zt-tag red">Sealed</span>
              <h2 className="zt-page-title" style={{ fontSize: 36, marginTop: 14 }}>Still time-locked.</h2>
              <p className="zt-page-sub">Responses are encrypted and open automatically once the unlock time has passed. Not even you can read them early.</p>
            </div>
          ) : (
            responses[0]?.answers?.map((question, index) => (
              <div key={index} className="zt-panel" style={{ marginTop: 18 }}>
                <div className="zt-mono">Q{String(index + 1).padStart(2, '0')}</div>
                <h3 className="zt-ask-t">{question.questionTitle || 'Untitled question'}</h3>
                {renderResponses(question, responses.map((r) => r.answers?.[index] || null))}
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
};

export default ResultsPage;
