import mongoose from 'mongoose';

// One anonymous identity per verified account. Only the PUBLIC commitment is stored;
// the secret never leaves the member's browser. This table says "this account joined the
// group"; it cannot say which member submitted which answer, because answers carry only a
// zero-knowledge proof and a per-survey nullifier.
const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  commitment: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Every group state (Merkle root) that has ever existed. A proof made against an
// earlier, smaller group stays valid; a made-up root never is.
const groupRootSchema = new mongoose.Schema({
  root: { type: String, required: true, unique: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Member = mongoose.model('Member', memberSchema);
export const GroupRoot = mongoose.model('GroupRoot', groupRootSchema);
