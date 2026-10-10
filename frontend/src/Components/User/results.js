import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Shell from '../Landing/Chrome';

const ResultsPage = () => {
  const { formId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms/${formId}/results`)
      .then(async (r) => {
        if (r.status === 404) throw new Error('This survey doesn’t exist, or isn’t public yet.');
        if (!r.ok) throw new Error('We couldn’t load these results.');
        return r.json();
      })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [formId]);

  if (error) return <Shell><div className="zt-center">{error}</div></Shell>;
  if (!data) return <Shell><div className="zt-center">Loading results…</div></Shell>;

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied.');
  };

  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-narrow">
          <div className="zt-actions" style={{ marginBottom: 6 }}>
            <span className={`zt-tag ${data.status === 'open' ? 'solid' : 'red'}`}>{data.status === 'open' ? 'Results open' : 'Sealed'}</span>
            {data.category && <span className="zt-tag">{data.category}</span>}
          </div>
          <h1 className="zt-page-title">{data.title}</h1>
          <p className="zt-page-sub">{data.description}</p>

          {data.status === 'open' && (
            <div className="zt-actions" style={{ marginTop: 26, justifyContent: 'space-between' }}>
              <span className="zt-mono">{data.totalResponses} anonymous responses · no names, no identifiers</span>
              <button className="zt-btn sm" onClick={share}>Share these results</button>
            </div>
          )}

          {data.status === 'locked' && (
            <div className="zt-panel" style={{ marginTop: 36 }}>
              <span className="zt-tag red">Sealed</span>
              <h2 className="zt-page-title" style={{ fontSize: 36, marginTop: 14 }}>These results aren’t open yet.</h2>
              <p className="zt-page-sub">
                {data.totalResponses} {data.totalResponses === 1 ? 'person has' : 'people have'} answered so far. Everything stays encrypted until{' '}
                <b>{new Date(data.unlockAt).toLocaleString()}</b>, then it opens here for everyone.
              </p>
              <div className="zt-actions" style={{ marginTop: 22 }}>
                <Link to={`/form/${formId}`} className="zt-btn primary">Answer the survey →</Link>
              </div>
            </div>
          )}

          {data.status === 'too-few' && (
            <div className="zt-panel" style={{ marginTop: 36 }}>
              <span className="zt-tag red">Not enough responses</span>
              <h2 className="zt-page-title" style={{ fontSize: 36, marginTop: 14 }}>Too few answers to show safely.</h2>
              <p className="zt-page-sub">
                Only {data.totalResponses} {data.totalResponses === 1 ? 'person' : 'people'} answered. We don’t publish results below {data.minimum} responses, because in a very small group
                it can become possible to guess who said what.
              </p>
            </div>
          )}

          {data.status === 'open' && data.questions.map((q, index) => (
            <div key={index} className="zt-panel" style={{ marginTop: 18 }}>
              <div className="zt-qhead">
                <span className="zt-mono">Q{String(index + 1).padStart(2, '0')}</span>
                <span className="zt-mono" style={{ marginLeft: 'auto' }}>{q.answered} answered</span>
              </div>
              <h3 className="zt-ask-t">{q.title}</h3>

              {q.options && q.options.map((o) => (
                <div key={o.label} className="zt-bar-row">
                  <div className="zt-bar-track">
                    <div className="zt-bar-fill" style={{ width: `${o.pct}%` }} />
                    <span className="zt-bar-label">{o.label}</span>
                  </div>
                  <span className="zt-mono" style={{ textAlign: 'right' }}>{o.pct}%</span>
                </div>
              ))}

              {q.comments && (q.comments.length
                ? q.comments.map((c, i) => <div key={i} className="zt-answer"><p>{c}</p></div>)
                : <p className="zt-hint">No written answers.</p>)}

              {q.commentsHidden && (
                <p className="zt-hint">
                  {q.answered} written {q.answered === 1 ? 'answer was' : 'answers were'} submitted. They’re kept private, because the way someone writes can give them away.
                </p>
              )}
            </div>
          ))}

          {data.status === 'open' && (
            <div className="zt-note" style={{ marginTop: 28 }}>
              <b>How to read this.</b> Percentages show the share of people who answered each question. Questions that allow several answers can add up to more than 100%.
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
};

export default ResultsPage;
