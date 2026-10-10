import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Shell from '../Landing/Chrome';
import SurveyList, { timeLeft } from './forms';

const API = process.env.REACT_APP_LOCAL_URL;

const UserProfile = () => {
  const { search } = useParams();
  const me = JSON.parse(localStorage.getItem('uid') || 'null');
  const google = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwner = me && me === search;

  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, f, c] = await Promise.all([
          fetch(`${API}/api/user/${search}`),
          fetch(`${API}/api/forms/user/${search}`),
          fetch(`${API}/api/forms/user/${search}/stats`),
        ]);
        if (!u.ok) throw new Error('Not found');
        if (!alive) return;
        setUser(await u.json());
        setForms(f.ok ? await f.json() : []);
        setCounts(c.ok ? await c.json() : {});
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (alive) setError('We couldn’t load this profile.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [search]);

  const handleActivate = async (formId) => {
    try {
      const response = await fetch(`${API}/api/forms/activate/${formId}`, { method: 'POST' });
      if (!response.ok) {
        const e = await response.json();
        toast.error(`Couldn’t activate: ${e.message}`);
        return;
      }
      const { form } = await response.json();
      toast.success(`Survey is live. Results unlock ${new Date(form.encryptionEndTime).toLocaleString()}.`);
      setForms((prev) => prev.map((f) => (f._id === formId ? { ...f, status: 'active', activationTime: form.activationTime, encryptionEndTime: form.encryptionEndTime } : f)));
    } catch (err) {
      console.error('Error activating survey:', err);
      toast.error('An error occurred while activating the survey.');
    }
  };

  const overview = useMemo(() => {
    const now = new Date();
    const live = forms.filter((f) => f.status === 'active');
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const upcoming = live.map((f) => new Date(f.encryptionEndTime)).filter((d) => d > now).sort((a, b) => a - b)[0];
    return { created: forms.length, total, live: live.length, next: upcoming ? timeLeft(upcoming - now) : '—' };
  }, [forms, counts]);

  if (loading) return <Shell><div className="zt-center">Loading…</div></Shell>;
  if (error || !user) return <Shell><div className="zt-center">{error || 'Profile not found.'}</div></Shell>;

  const since = new Date(user.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Shell>
      <div className="zt-page">
        <div className="zt-narrow">
          <div className="zt-who">
            <img className="zt-avatar big" alt="" src={(isOwner && google?.picture) || `https://api.dicebear.com/9.x/shapes/svg?seed=${user._id}`} />
            <div>
              <div className="zt-mono">{isOwner ? 'Your account' : 'Profile'}</div>
              <h1 className="zt-page-title" style={{ textTransform: 'capitalize', marginTop: 8 }}>{user.name}</h1>
              <p className="zt-hint" style={{ marginTop: 8 }}>Member since {since}</p>
            </div>
          </div>

          {isOwner && (
            <div className="zt-stats">
              <div className="zt-stat"><span className="zt-mono">Surveys created</span><b>{overview.created}</b></div>
              <div className="zt-stat"><span className="zt-mono">Responses received</span><b>{overview.total}</b></div>
              <div className="zt-stat"><span className="zt-mono">Live now</span><b>{overview.live}</b></div>
              <div className="zt-stat"><span className="zt-mono">Next unlock</span><b>{overview.next}</b></div>
            </div>
          )}

          <div className="zt-row" style={{ marginTop: 56 }}>
            <h2 className="zt-h2" style={{ fontSize: 38, margin: 0 }}>{isOwner ? 'Your surveys' : 'Open surveys'}</h2>
            {isOwner && <Link to="/createform" className="zt-btn primary">New survey →</Link>}
          </div>
          <SurveyList forms={forms} counts={counts} isOwner={isOwner} onActivate={handleActivate} />

          {isOwner && (
            <>
              <h2 className="zt-h2" style={{ fontSize: 38, margin: '72px 0 0' }}>Privacy</h2>
              <p className="zt-page-sub">What ZeroTrace keeps, and what it never has.</p>
              <div className="zt-grid-2" style={{ marginTop: 28, alignItems: 'stretch' }}>
                <div className="zt-panel">
                  <span className="zt-tag solid">About you</span>
                  <dl className="zt-kv">
                    <div><dt>Name</dt><dd>{user.name}</dd></div>
                    <div><dt>Email</dt><dd>{google?.email || '—'}</dd></div>
                    <div><dt>Sign-in</dt><dd>Google</dd></div>
                    <div><dt>Surveys</dt><dd>{overview.created} created</dd></div>
                  </dl>
                  <p className="zt-hint">Only you can see your email. It isn’t shown on your public profile.</p>
                </div>
                <div className="zt-panel">
                  <span className="zt-tag red">About your respondents</span>
                  <dl className="zt-kv">
                    <div><dt>Identity</dt><dd>Not stored</dd></div>
                    <div><dt>Linked to</dt><dd>A proof, not a person</dd></div>
                    <div><dt>Answers</dt><dd>Encrypted until unlock</dd></div>
                    <div><dt>You see</dt><dd>Totals only</dd></div>
                  </dl>
                  <p className="zt-hint">Each response is stored with a cryptographic commitment instead of a user ID. The counts above are the only numbers we show you, and we never show anything about an individual.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
};

export default UserProfile;
