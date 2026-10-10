import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { commitmentOf, exportRecoveryKey, fetchGroup, importRecoveryKey } from '../../lib/anonIdentity';

// Shows the member's anonymous identity: whether it is active on this device,
// how big the anonymous group is, and how to back it up or restore it.
export default function IdentityPanel({ uid }) {
  const [state, setState] = useState({ loading: true });
  const [reveal, setReveal] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const restoreNeeded = (() => { try { return localStorage.getItem('zt_restore_needed') === '1'; } catch (e) { return false; } })();

  const load = async () => {
    try {
      const [mine, group] = await Promise.all([commitmentOf(uid), fetchGroup()]);
      setState({ loading: false, size: group.size, onDevice: !!mine, registered: !!mine && group.members.includes(mine) });
    } catch (e) {
      setState({ loading: false, error: true });
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [uid]);

  const copy = () => {
    navigator.clipboard.writeText(exportRecoveryKey(uid) || '');
    toast.success('Recovery key copied. Keep it somewhere private.');
  };

  const restore = async () => {
    setBusy(true);
    try {
      await importRecoveryKey(uid, text);
      try { localStorage.removeItem('zt_restore_needed'); } catch (e) { /* ignore */ }
      setText('');
      toast.success('Identity restored on this device.');
      await load();
    } catch (e) {
      toast.error(e.message || 'Could not restore that key.');
    } finally {
      setBusy(false);
    }
  };

  if (state.loading) return null;
  const ok = state.onDevice && state.registered;

  return (
    <div className="zt-panel" style={{ marginTop: 18, borderColor: restoreNeeded && !ok ? 'var(--red)' : undefined }}>
      <div className="zt-actions">
        <span className={`zt-tag ${ok ? 'solid' : 'red'}`}>{ok ? 'Active' : 'Action needed'}</span>
        <span className="zt-mono">Your anonymous identity</span>
      </div>

      {state.error && <p className="zt-hint">We couldn’t load your identity just now.</p>}

      {!state.error && ok && (
        <p className="zt-page-sub" style={{ fontSize: 16 }}>
          Your anonymous identity is set up on this device. When you answer a survey, your browser proves you’re one of the{' '}
          <b>{state.size}</b> registered member{state.size === 1 ? '' : 's'}, without saying which one.
        </p>
      )}

      {!state.error && !ok && (
        <p className="zt-page-sub" style={{ fontSize: 16 }}>
          {restoreNeeded
            ? 'This account already has an anonymous identity, created on another device or browser. Paste its recovery key below to answer surveys here.'
            : 'There’s no anonymous identity on this device yet. Sign out and back in to create one, or paste a recovery key below.'}
        </p>
      )}

      {ok && (
        <div style={{ marginTop: 18 }}>
          <div className="zt-actions">
            <button className="zt-btn sm" onClick={() => setReveal(!reveal)}>{reveal ? 'Hide recovery key' : 'Show recovery key'}</button>
            {reveal && <button className="zt-btn sm primary" onClick={copy}>Copy</button>}
          </div>
          {reveal && (
            <>
              <textarea className="zt-textarea" readOnly value={exportRecoveryKey(uid) || ''} style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 13 }} rows={3} onFocus={(e) => e.target.select()} />
              <p className="zt-hint red">Anyone with this key can answer surveys as you. Never share it. If you clear your browser data without saving it, you won’t be able to answer surveys again.</p>
            </>
          )}
        </div>
      )}

      {!ok && (
        <div style={{ marginTop: 18 }}>
          <label className="zt-label">Recovery key</label>
          <textarea className="zt-textarea" rows={3} value={text} placeholder="Paste your recovery key" onChange={(e) => setText(e.target.value)} style={{ fontFamily: 'var(--mono)', fontSize: 13 }} />
          <div className="zt-actions" style={{ marginTop: 12 }}>
            <button className="zt-btn primary sm" onClick={restore} disabled={busy || !text.trim()}>{busy ? 'Restoring…' : 'Restore identity'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
