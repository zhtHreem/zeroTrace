// responseSchema.js
import mongoose from 'mongoose';
import crypto from 'crypto';
import { buildPoseidon } from 'circomlibjs';
import { Response, SubmissionTracking } from './schema.js';

import { groth16 } from 'snarkjs';

class ZKPSubmissionManager {
  constructor() {
    this.poseidon = null;
  }

  async initializePoseidon() {
    if (!this.poseidon) {
      try {
        // Initialize Poseidon using circomlibjs
        this.poseidon = await buildPoseidon();
        
//          console.log('Full Poseidon object:', {
//   methods: Object.keys(this.poseidon),
//   F_methods: Object.keys(this.poseidon.F),
//   F_properties: Object.getOwnPropertyDescriptors(this.poseidon.F)
// });
        
      } catch (error) {
        console.error('Error initializing Poseidon:', error);
      }
    }
    return this.poseidon;
  }

  /**
   * Generate a zero-knowledge commitment for a submission
   * @param {string} userId - User identifier
   * @param {string} formId - Form identifier
   * @returns {Object} Commitment and nullifier
   */
  async generateZKPCommitment(userId, formId) {
    await this.initializePoseidon();
     
    try {

//       console.log('Poseidon Field Prime (p):', this.poseidon.F.p);
// if (!this.poseidon.F.p) {
//   throw new Error('Poseidon finite field prime (p) is not initialized');
// }

      // Ensure inputs are strings and not empty
    if (!userId || !formId) {
      throw new Error('User ID and Form ID must be non-empty strings');
    }

console.log('Raw user ID:', userId);
      console.log('Raw form ID:', formId);
      const userHash = crypto.createHash('sha256').update(String(userId)).digest('hex');
      const formHash = crypto.createHash('sha256').update(String(formId)).digest('hex');
       
     if (!/^[0-9a-fA-F]+$/.test(userHash)) {
      console.error('Invalid userHash:', userHash);
      }

     if (!/^[0-9a-fA-F]+$/.test(userHash)) {
       console.error('Invalid userHash:', formHash);
    }


   // console.log("poseidon", BigInt(this.poseidon.F.p));
   //console.log("poseidon", this.poseidon.F.p);



      // Convert to BigInt and apply modulo
    const userBigInt = BigInt('0x' + userHash) % this.poseidon.F.p;
    const formBigInt = BigInt('0x' + formHash) % this.poseidon.F.p;

    // Debugging logs
    console.log('User BigInt:', userBigInt.toString());
    console.log('Form BigInt:', formBigInt.toString());
      


     
    //  const commitment = '0x' +this.poseidon([userBigInt, formBigInt]).toString(16);


      const poseidonHash = this.poseidon([userBigInt, formBigInt]);
      // Convert comma-separated array to hex
    const commitment = '0x' + 
      poseidonHash
        .toString()
        .split(',')
        .map(num => parseInt(num).toString(16).padStart(2, '0'))
        .join('');
    // Generate a nullifier to prevent replay attacks
    const nullifier = crypto.randomBytes(32).toString('hex');

//      console.log({
//     rawCommitment: commitment,
//     cleanCommitment: commitment.replace(/^0x/, '').replace(/,/g, ''),
//     nullifier
//   });
    return { commitment,nullifier };

    } catch (error) {
      console.error('Error generating ZKP commitment:', error);
      
      // Detailed error logging
    //   console.log('Raw user ID:', userId);
    //   console.log('Raw form ID:', formId);
    //   console.log('User hash:', userHash);
    //   console.log('Form hash:', formHash);
    //   console.log('Finite Field Prime:', this.poseidon.F.p.toString());

      throw new Error(`Failed to generate commitment: ${error.message}`);
    }
  }

  /**
   * Verify submission uniqueness using ZKP principles
   * @param {string} commitment - Submission commitment
   * @param {string} nullifier - Unique submission token
   * @returns {boolean} Submission uniqueness status
   */
  async verifySubmissionUniqueness(commitment, nullifier,formId) {
    // Check if commitment already exists
    const existingSubmission = await SubmissionTracking.findOne({ 
      submissionHash: commitment 
    });

    if (existingSubmission) {
      return false; // Submission already exists
    }

    return true;
  }
}

export  default ZKPSubmissionManager;