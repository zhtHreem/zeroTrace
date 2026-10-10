import express from 'express';
import { Group } from '@semaphore-protocol/group';
import User from '../User/schema.js';
import { Member, GroupRoot } from './schema.js';

const router = express.Router();

// Confirm with Google itself that the bearer token is real, unexpired and ours.
async function verifyGoogleToken(token) {
  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
  if (!r.ok) return null;
  const info = await r.json();
  const expected = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (expected && info.aud !== expected) return null; // token was issued to some other app
  if (!info.sub) return null;
  return info; // { sub, email, email_verified, aud, ... }
}

const sortedCommitments = async () => (await Member.find().sort({ _id: 1 }).select('commitment')).map((m) => m.commitment);

// Join the anonymous group. One identity per verified Google account, permanently:
// allowing re-registration would let one person mint many identities and answer many times.
router.post('/identity/register', async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const { commitment } = req.body || {};
    if (!token) return res.status(401).json({ code: 'NO_TOKEN', message: 'Sign in first.' });
    if (typeof commitment !== 'string' || !/^\d{1,80}$/.test(commitment)) {
      return res.status(400).json({ code: 'BAD_COMMITMENT', message: 'Invalid identity commitment.' });
    }

    const info = await verifyGoogleToken(token);
    if (!info) return res.status(401).json({ code: 'BAD_TOKEN', message: 'Your sign-in could not be verified. Please sign in again.' });

    const user = await User.findOne({ googleId: info.sub }) || (info.email && await User.findOne({ email: info.email }));
    if (!user) return res.status(404).json({ code: 'NO_ACCOUNT', message: 'Account not found. Please sign in again.' });

    const existing = await Member.findOne({ user: user._id });
    if (existing) {
      if (existing.commitment === commitment) return res.json({ registered: true, already: true });
      return res.status(409).json({
        code: 'IDENTITY_EXISTS',
        message: 'This account already has an anonymous identity. Restore it with your recovery key.',
      });
    }
    if (await Member.exists({ commitment })) {
      return res.status(409).json({ code: 'COMMITMENT_TAKEN', message: 'That identity is already registered.' });
    }

    await Member.create({ user: user._id, commitment });
    const commitments = await sortedCommitments();
    const group = new Group(commitments.map((c) => BigInt(c)));
    await GroupRoot.updateOne({ root: String(group.root) }, { $setOnInsert: { size: commitments.length } }, { upsert: true });

    res.status(201).json({ registered: true, members: commitments.length });
  } catch (error) {
    console.error('Error registering identity:', error);
    res.status(500).json({ code: 'REGISTER_FAILED', message: 'Could not register your identity.' });
  }
});

// The public group: commitments only. Everything here is already public by design.
router.get('/identity/group', async (req, res) => {
  try {
    const members = await sortedCommitments();
    res.json({ size: members.length, members });
  } catch (error) {
    console.error('Error loading group:', error);
    res.status(500).json({ message: 'Error loading group' });
  }
});

export default router;
