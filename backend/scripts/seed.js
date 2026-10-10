// Populate (or clean) example surveys and responses.
//
//   node scripts/seed.js --dry      show what would be created, write nothing
//   node scripts/seed.js            create the surveys and their responses
//   node scripts/seed.js --force    replace a previous seed run
//   node scripts/seed.js --remove   delete everything this script created
//
// Run from the backend directory so .env is picked up. Everything created here is
// stored exactly the way the API stores it (encrypted answers, commitment, nullifier),
// and tagged with a hidden `seedBatch` field so --remove can find it again.

import crypto from 'crypto';
import connectDB from '../src/database/connectivity.js';
import mongoose from 'mongoose';
import Form from '../src/database/models/Form/schema.js';
import User from '../src/database/models/User/schema.js';
import { Response, SubmissionTracking } from '../src/database/models/ResponseForm/schema.js';
import { encryptResponse } from '../src/database/models/Encryption/encryption.js';
import ZKPSubmissionManager from '../src/database/models/ResponseForm/zkp.js';
import { SURVEYS } from './seedContent.js';

const BATCH = 'launch-v1';
const OWNER = { email: 'team@zerotrace.example', name: 'ZeroTrace Team' };
const DAY = 24 * 60 * 60 * 1000;
const args = new Set(process.argv.slice(2));

// small deterministic PRNG so repeated runs produce comparable data
const rng = (() => {
  let a = 0x5eed1234;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
const pickWeighted = (options, weights) => {
  const total = weights.reduce((x, y) => x + y, 0);
  let r = rng() * total;
  for (let i = 0; i < options.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return options.length - 1;
};
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

function answerFor(q, ctx) {
  if (q.type === 'Multiple choice' || q.type === 'Drop down') {
    const idx = pickWeighted(q.options, q.weights);
    if (q.scoreFor === 'enps') ctx.score = idx;
    return q.options[idx];
  }
  if (q.type === 'Checkbox') {
    let chosen = q.options.filter((_, i) => rng() < q.probs[i]);
    if (!chosen.length) chosen = [q.options[q.probs.indexOf(Math.max(...q.probs))]];
    return chosen;
  }
  // free text
  if (!q.pool || rng() > (q.fill ?? 0.7)) return '';
  if (q.byScore) {
    const band = ctx.score <= 6 ? 'detractor' : ctx.score <= 8 ? 'passive' : 'promoter';
    return pick(q.pool[band]);
  }
  return pick(q.pool);
}

async function remove() {
  const forms = await Form.find({ seedBatch: BATCH }).select('_id');
  const ids = forms.map((f) => f._id);
  const r = await Response.deleteMany({ form: { $in: ids } });
  const t = await SubmissionTracking.deleteMany({ formId: { $in: ids } });
  const f = await Form.deleteMany({ seedBatch: BATCH });
  const owner = await User.findOne({ email: OWNER.email });
  let u = 0;
  if (owner && !(await Form.exists({ user: owner._id }))) { await User.deleteOne({ _id: owner._id }); u = 1; }
  console.log(`removed: ${f.deletedCount} surveys, ${r.deletedCount} responses, ${t.deletedCount} tracking records, ${u} owner account`);
}

async function seed() {
  const existing = await Form.countDocuments({ seedBatch: BATCH });
  if (existing && !args.has('--force') && !args.has('--dry')) {
    console.log(`Already seeded (${existing} surveys). Use --force to replace, or --remove to clean up.`);
    return;
  }
  if (existing && args.has('--force')) await remove();

  const now = Date.now();
  const zkp = new ZKPSubmissionManager();
  const dry = args.has('--dry');

  let owner = null;
  if (!dry) owner = (await User.findOne({ email: OWNER.email })) || (await User.create(OWNER));

  for (const s of SURVEYS) {
    const activated = s.state === 'draft' ? null : new Date(now - s.activatedDaysAgo * DAY);
    const ends = activated ? new Date(activated.getTime() + s.durationDays * DAY) : null;
    const created = new Date((activated ? activated.getTime() : now - 2 * DAY) - DAY);
    const unlocked = s.state === 'unlocked';

    console.log(`${s.state.padEnd(9)} ${String(s.responses).padStart(4)} responses  ${s.title}`);
    if (dry) continue;

    const form = await Form.create({
      category: s.category,
      title: s.title,
      description: s.description,
      questions: s.questions.map((q) => ({ title: q.title, type: q.type, options: q.options || [], required: !!q.required })),
      user: owner._id,
      decryptionTime: s.durationDays * 24 * 3600, // stored in seconds, like the builder does
      decryptionUnit: 'seconds',
      status: s.state === 'draft' ? 'draft' : unlocked ? 'closed' : 'active',
      activationTime: activated,
      encryptionEndTime: ends,
      seedBatch: BATCH,
      createdAt: created,
      updatedAt: unlocked ? ends : activated || created,
    });

    const lastSubmit = Math.min(now, ends ? ends.getTime() : now);
    for (let i = 0; i < s.responses; i++) {
      const ctx = {};
      const formatted = form.questions.map((q, qi) => ({
        question: q._id.toString(),
        questionTitle: q.title,
        answer: answerFor(s.questions[qi], ctx),
        questionType: q.type,
      }));
      const { commitment, nullifier } = await zkp.generateZKPCommitment(`seed-${s.key}-${i}-${crypto.randomBytes(6).toString('hex')}`, form._id.toString());
      const { encryptedData, iv } = encryptResponse(JSON.stringify(formatted));
      // earlier in the window is busier, as with real surveys
      const submittedAt = new Date(activated.getTime() + Math.pow(rng(), 1.6) * (lastSubmit - activated.getTime()));

      await Response.create({
        form: form._id,
        commitment,
        nullifier,
        answers: { encryptedData, iv },
        decryptedAnswers: unlocked ? formatted : null, // what the unlock job would have written
        unlockAt: ends,
        submittedAt,
      });
      await SubmissionTracking.create({ formId: form._id, submissionHash: commitment, nullifier, submittedAt });
    }
  }
  console.log(dry ? '\n(dry run: nothing written)' : '\nDone.');
}

await connectDB();
try {
  if (args.has('--remove')) await remove();
  else await seed();
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
