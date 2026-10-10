import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TAGS = { active: ['Live', 'solid'], closed: ['Closed', ''], draft: ['Draft', 'red'] };

export function timeLeft(ms) {
  if (ms <= 0) return 'now';
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${mm}m`;
  return `${Math.max(mm, 1)}m`;
}

const SurveyList = ({ forms, counts, isOwner, onActivate }) => {
  const navigate = useNavigate();

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/form/${id}`);
    toast.success('Link copied. Share it with your respondents.');
  };

  const visible = isOwner ? forms : forms.filter((f) => f.status === 'active');
  if (!visible.length) {
    return <div className="zt-empty">{isOwner ? 'You haven’t created a survey yet.' : 'No open surveys.'}</div>;
  }

  return (
    <div className="zt-ledger" style={{ marginTop: 20 }}>
      {visible.map((form) => {
        const [label, cls] = TAGS[form.status] || TAGS.draft;
        const n = counts[form._id] || 0;
        const unlocks = form.encryptionEndTime ? new Date(form.encryptionEndTime) : null;
        const locked = unlocks && unlocks > new Date();

        let primary = null;
        if (isOwner) {
          if (form.status === 'draft') primary = <button className="zt-btn sm primary" onClick={() => onActivate(form._id)}>Activate</button>;
          else if (locked) primary = <button className="zt-btn sm primary" onClick={() => copyLink(form._id)}>Copy link</button>;
          else primary = <button className="zt-btn sm primary" onClick={() => navigate(`/results/${form._id}`)}>View results</button>;
        } else {
          primary = <button className="zt-btn sm primary" onClick={() => navigate(`/form/${form._id}`)}>Answer →</button>;
        }

        return (
          <div key={form._id} className="zt-mine">
            <div style={{ minWidth: 0 }}>
              <div className="zt-actions" style={{ marginBottom: 8 }}>
                <span className={`zt-tag ${cls}`}>{label}</span>
                {isOwner && <span className="zt-mono">{n} response{n === 1 ? '' : 's'}</span>}
                {isOwner && form.status === 'active' && unlocks && (
                  <span className="zt-mono">· {locked ? `unlocks in ${timeLeft(unlocks - new Date())}` : 'unlocked'}</span>
                )}
              </div>
              <h3 className="zt-mine-t">{form.title}</h3>
              <p className="zt-mine-d">{form.description}</p>
            </div>
            <div className="zt-actions">
              {primary}
              {isOwner && <button className="zt-btn sm" onClick={() => navigate(`/form/${form._id}`)}>Preview</button>}
              {isOwner && form.status !== 'draft' && !locked && <button className="zt-btn sm" onClick={() => copyLink(form._id)}>Copy link</button>}
              {isOwner && locked && <button className="zt-btn sm" onClick={() => navigate(`/results/${form._id}`)}>Results</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurveyList;
