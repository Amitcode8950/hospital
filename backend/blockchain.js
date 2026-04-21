const crypto = require('crypto');
const Block = require('./models/BlockchainBlock');

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}
 
function computeHash(idx, timestamp, data, prevHash, nonce = 0) {
  return sha256(`${idx}${timestamp}${JSON.stringify(data)}${prevHash}${nonce}`);
}

async function getLastBlock() { 
  return Block.findOne().sort({ idx: -1 });
}

async function initBlockchain() {
  const last = await getLastBlock(); 
  if (!last) {
    const timestamp = new Date().toISOString();
    const data = { type: 'GENESIS', message: 'MediChain Genesis Block — Immutable Medical Records' };
    const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const hash = computeHash(0, timestamp, data, prevHash);
    await Block.create({ idx: 1, timestamp, data, prev_hash: prevHash, hash, nonce: 0 });
    console.log('⛓️  Genesis block created in MongoDB');
  } else {
    console.log(`⛓️  Blockchain loaded from MongoDB — ${last.idx} block(s)`);
  }
}

async function addBlock(data) {
  const last = await getLastBlock();
  const timestamp = new Date().toISOString();
  const prevHash = last ? last.hash : '0'.repeat(64);
  const newIdx = last ? last.idx + 1 : 1;
  const hash = computeHash(newIdx, timestamp, data, prevHash);

  const block = await Block.create({
    idx: newIdx,
    timestamp,
    data,
    prev_hash: prevHash,
    hash,
    nonce: 0,
  });

  return { idx: block.idx, timestamp, data, prev_hash: prevHash, hash };
}

async function getChain() {
  const blocks = await Block.find().sort({ idx: 1 }).lean();
  return blocks;
}

async function validateChain() {
  const blocks = await Block.find().sort({ idx: 1 }).lean();
  for (let i = 1; i < blocks.length; i++) {
    const cur = blocks[i];
    const prev = blocks[i - 1];
    if (cur.prev_hash !== prev.hash) {
      return { valid: false, error: `Block ${cur.idx}: prev_hash mismatch` };
    }
    const expected = computeHash(cur.idx, cur.timestamp, cur.data, cur.prev_hash, cur.nonce);
    if (cur.hash !== expected) {
      return { valid: false, error: `Block ${cur.idx}: hash invalid — chain tampered!` };
    }
  }
  return { valid: true, blockCount: blocks.length };
}

module.exports = { initBlockchain, addBlock, getChain, validateChain };
