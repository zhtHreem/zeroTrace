/* global BigInt */
// Anonymous identity, kept entirely in the browser.
//
// The SECRET never leaves this device. Only its public commitment is sent to the server, once,
// to join the group of verified members. When answering a survey the browser proves
// "I am one of the members" without saying which one, and the server never sees a user id.
//
// Heavy cryptography is loaded on demand so it doesn't weigh down the rest of the site.

const API = process.env.REACT_APP_LOCAL_URL;
const keyFor = (uid) => `zt_identity_${uid}`;

const lib = async () => {
  const [{ Identity }, { Group }, { generateProof }] = await Promise.all([
    import('@semaphore-protocol/identity'),
    import('@semaphore-protocol/group'),
    import('@semaphore-protocol/proof'),
  ]);
  return { Identity, Group, generateProof };
};

const read = (uid) => { try { return localStorage.getItem(keyFor(uid)); } catch (e) { return null; } };
const write = (uid, v) => { try { localStorage.setItem(keyFor(uid), v); } catch (e) { /* storage blocked */ } };

export const hasIdentity = (uid) => !!(uid && read(uid));
export const exportRecoveryKey = (uid) => read(uid);

export async function loadIdentity(uid) {
  const saved = read(uid);
  if (!saved) return null;
  const { Identity } = await lib();
  try { return Identity.import(saved); } catch (e) { return null; }
}

export async function commitmentOf(uid) {
  const id = await loadIdentity(uid);
  return id ? String(id.commitment) : null;
}

export async function fetchGroup() {
  const r = await fetch(`${API}/api/identity/group`);
  if (!r.ok) throw new Error('Could not load the anonymous group.');
  return r.json(); // { size, members: [commitment strings] }
}

// Sign-in time: make sure this account has an identity and has joined the group.
// Returns { status: 'ok' | 'restore-needed' | 'error', message }.
export async function ensureIdentity(uid, accessToken) {
  try {
    const { Identity } = await lib();
    let identity = read(uid) ? Identity.import(read(uid)) : null;
    const created = !identity;
    if (!identity) identity = new Identity();

    const r = await fetch(`${API}/api/identity/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ commitment: String(identity.commitment) }),
    });
    const body = await r.json().catch(() => ({}));

    if (r.ok) { if (created) write(uid, identity.export()); return { status: 'ok', created }; }
    if (r.status === 409 && body.code === 'IDENTITY_EXISTS') {
      // this account already joined from another device; we must NOT keep the new secret
      return { status: 'restore-needed', message: body.message };
    }
    return { status: 'error', message: body.message || 'Could not set up your anonymous identity.' };
  } catch (e) {
    console.error('ensureIdentity failed:', e);
    return { status: 'error', message: 'Could not set up your anonymous identity.' };
  }
}

// Restore an identity on a new device from its recovery key.
export async function importRecoveryKey(uid, text) {
  const { Identity } = await lib();
  let identity;
  try { identity = Identity.import(text.trim()); } catch (e) { throw new Error('That recovery key isn’t valid.'); }
  const group = await fetchGroup();
  if (!group.members.includes(String(identity.commitment))) {
    throw new Error('That key doesn’t belong to a registered member.');
  }
  write(uid, identity.export());
  return true;
}

// Answer-time: build a zero-knowledge proof bound to this survey and these exact answers.
export async function proveMembership(uid, formId, payload) {
  const { Group, generateProof } = await lib();
  const identity = await loadIdentity(uid);
  if (!identity) { const e = new Error('NO_IDENTITY'); e.code = 'NO_IDENTITY'; throw e; }

  const { members } = await fetchGroup();
  if (!members.includes(String(identity.commitment))) { const e = new Error('NOT_IN_GROUP'); e.code = 'NOT_IN_GROUP'; throw e; }

  const group = new Group(members.map((m) => BigInt(m)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  const message = BigInt('0x' + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join(''));
  const scope = BigInt('0x' + formId);

  return generateProof(identity, group, message, scope);
}
