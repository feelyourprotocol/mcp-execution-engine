import type { EipIntroduction } from '../types.js'
import { type LineageForkId, predecessorFork, resolveForkAlias } from './lineage.js'

/** When each EIP activated — compact facts for agents (not runnable twin encoding). */
export const EIP_INTRODUCTIONS: EipIntroduction[] = [
  {
    eip: 1559,
    name: 'Fee market change for ETH 1.0 chain',
    summary:
      'EIP-1559 base fee and priority fee — paid transaction gas reflects the fee market from London onward.',
    keywords: ['1559', 'eip-1559', 'base fee', 'priority fee', 'fee market'],
    introducedAt: 'london',
    observableShapes: ['transaction'],
  },
  {
    eip: 2565,
    name: 'ModExp gas cost',
    summary:
      'First ModExp (0x05) gas repricing — superseded by later fork repricings (7883 on Osaka).',
    keywords: ['modexp', '2565', 'precompile'],
    introducedAt: 'berlin',
    observableShapes: ['simulate'],
  },
  {
    eip: 2718,
    name: 'Typed Transaction Envelope',
    summary: 'Typed transaction envelopes (EIP-2718) — run_transaction uses legacy type-0 lab txs.',
    keywords: ['2718', 'typed transaction', 'envelope'],
    introducedAt: 'berlin',
    observableShapes: ['transaction'],
  },
  {
    eip: 2929,
    name: 'Gas cost increases for state access opcodes',
    summary:
      'Cold/warm access gas for account and storage touches — affects SLOAD, SSTORE, CALL, etc.',
    keywords: ['2929', 'cold access', 'warm access', 'state access gas'],
    introducedAt: 'berlin',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 2930,
    name: 'Optional access lists',
    summary:
      'Optional transaction access lists — warm declared addresses/storage before execution.',
    keywords: ['2930', 'access list', 'yParity'],
    introducedAt: 'berlin',
    observableShapes: ['transaction'],
  },
  {
    eip: 3198,
    name: 'BASEFEE opcode',
    summary: 'BASEFEE opcode returns the current block base fee per gas (London+).',
    keywords: ['basefee', '3198', 'opcode'],
    introducedAt: 'london',
    observableShapes: ['simulate'],
  },
  {
    eip: 3529,
    name: 'Reduction in refunds',
    summary:
      'SELFDESTRUCT and SSTORE refund reductions — changes net gas on destructive/storage paths.',
    keywords: ['3529', 'refund', 'selfdestruct'],
    introducedAt: 'london',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 3541,
    name: 'Reject transactions from contracts',
    summary:
      'Contract-initiated transactions rejected — EOAs only from London until later EIP-7702 paths.',
    keywords: ['3541', 'contract sender'],
    introducedAt: 'london',
    observableShapes: ['transaction'],
  },
  {
    eip: 3675,
    name: 'Upgrade consensus to Proof-of-Stake',
    summary:
      'The Merge — consensus moves to proof-of-stake. Not replayable in this isolated EL lab.',
    keywords: ['merge', 'pos', 'proof of stake'],
    introducedAt: 'paris',
  },
  {
    eip: 4399,
    name: 'Supplant DIFFICULTY with PREVRANDAO',
    summary: 'PREVRANDAO opcode replaces DIFFICULTY after The Merge.',
    keywords: ['prevrandao', 'difficulty', 'random'],
    introducedAt: 'paris',
    observableShapes: ['simulate'],
  },
  {
    eip: 3651,
    name: 'Warm COINBASE',
    summary:
      'Coinbase address is warm at transaction start — lower gas for accessing the fee recipient.',
    keywords: ['coinbase', 'warm coinbase'],
    introducedAt: 'shanghai',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 3855,
    name: 'PUSH0 instruction',
    summary: 'PUSH0 (0x5f) pushes zero onto the stack — invalid on Paris and earlier.',
    keywords: ['push0', '0x5f', 'stack'],
    introducedAt: 'shanghai',
    observableShapes: ['simulate'],
  },
  {
    eip: 3860,
    name: 'Limit and meter initcode',
    summary: 'Initcode size limit and gas metering for contract creation.',
    keywords: ['initcode', 'create'],
    introducedAt: 'shanghai',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 4895,
    name: 'Beacon chain push withdrawals',
    summary:
      'Execution-layer withdrawal operations from the beacon chain — not modeled in this lab.',
    keywords: ['withdrawals', 'staking'],
    introducedAt: 'shanghai',
  },
  {
    eip: 1153,
    name: 'Transient storage opcodes',
    summary: 'TLOAD and TSTORE — transient storage that clears after the transaction.',
    keywords: ['tload', 'tstore', 'transient storage'],
    introducedAt: 'cancun',
    observableShapes: ['simulate'],
  },
  {
    eip: 4844,
    name: 'Shard Blob Transactions',
    summary: 'Blob-carrying transactions — blob sidecars are not in scope for this lab.',
    keywords: ['blob', '4844', 'dencun'],
    introducedAt: 'cancun',
  },
  {
    eip: 4788,
    name: 'Beacon block root in the EVM',
    summary: 'Parent beacon block root available to the EVM — header context only in full blocks.',
    keywords: ['beacon root', '4788'],
    introducedAt: 'cancun',
  },
  {
    eip: 5656,
    name: 'MCOPY instruction',
    summary: 'MCOPY — memory copying instruction in Cancun.',
    keywords: ['mcopy', 'memory'],
    introducedAt: 'cancun',
    observableShapes: ['simulate'],
  },
  {
    eip: 6780,
    name: 'SELFDESTRUCT only in same transaction',
    summary:
      'SELFDESTRUCT restricted to destroying only contracts created in the same transaction.',
    keywords: ['selfdestruct', '6780'],
    introducedAt: 'cancun',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 7516,
    name: 'BLOBBASEFEE opcode',
    summary: 'BLOBBASEFEE opcode — blob base fee not meaningful without blob txs in this lab.',
    keywords: ['blobbasefee'],
    introducedAt: 'cancun',
    observableShapes: ['simulate'],
  },
  {
    eip: 2537,
    name: 'Precompile for BLS12-381 curve operations',
    summary: 'BLS12-381 precompiles for curve operations.',
    keywords: ['bls12-381', 'precompile'],
    introducedAt: 'prague',
    observableShapes: ['simulate'],
  },
  {
    eip: 2935,
    name: 'Save historical block hashes in state',
    summary: 'Historical block hashes stored in state for BLOCKHASH beyond 256 blocks.',
    keywords: ['blockhash', 'history'],
    introducedAt: 'prague',
  },
  {
    eip: 6110,
    name: 'Supply validator deposits on chain',
    summary: 'On-chain validator deposit requests — consensus layer, not isolated EL bytecode lab.',
    keywords: ['deposits', 'validator'],
    introducedAt: 'prague',
  },
  {
    eip: 7002,
    name: 'Execution layer triggerable withdrawals',
    summary: 'Triggerable exits and withdrawals via EL — not fully modeled here.',
    keywords: ['withdrawals', '7002'],
    introducedAt: 'prague',
  },
  {
    eip: 7251,
    name: 'Increase the MAX_EFFECTIVE_BALANCE',
    summary: 'Consensus staking parameter — not an EL opcode change in this lab.',
    keywords: ['staking', '7251'],
    introducedAt: 'prague',
  },
  {
    eip: 7623,
    name: 'Increase calldata cost',
    summary: 'Higher calldata floor cost — affects paid transaction gas.',
    keywords: ['calldata', '7623'],
    introducedAt: 'prague',
    observableShapes: ['transaction'],
  },
  {
    eip: 7685,
    name: 'General purpose execution layer requests',
    summary: 'Request container for EL — Prague bundle infrastructure.',
    keywords: ['requests', '7685'],
    introducedAt: 'prague',
  },
  {
    eip: 7691,
    name: 'Blob throughput increase',
    summary: 'Blob target/max changes — not observable without blob txs.',
    keywords: ['blob', '7691'],
    introducedAt: 'prague',
  },
  {
    eip: 7702,
    name: 'Set EOA account code for one transaction',
    summary: 'Set-code delegation for EOAs — Pectra account abstraction path.',
    keywords: ['7702', 'eoa', 'delegation'],
    introducedAt: 'prague',
    observableShapes: ['transaction', 'simulate'],
  },
  {
    eip: 7594,
    name: 'PeerDAS',
    summary: 'PeerDAS data availability — consensus / blob path, not isolated EL bytecode.',
    keywords: ['peerdas', '7594'],
    introducedAt: 'osaka',
  },
  {
    eip: 7823,
    name: 'ModExp input bounds',
    summary: 'ModExp input size bounds — pairs with EIP-7883 gas repricing on Osaka.',
    keywords: ['modexp', '7823', 'bounds'],
    introducedAt: 'osaka',
    observableShapes: ['simulate'],
  },
  {
    eip: 7825,
    name: 'Transaction gas limit cap',
    summary: 'Per-transaction gas limit cap at 16.7M on Osaka.',
    keywords: ['gas limit', '7825'],
    introducedAt: 'osaka',
    observableShapes: ['transaction'],
  },
  {
    eip: 7883,
    name: 'ModExp gas cost increase',
    summary: 'ModExp (0x05) gas formula repricing on Osaka (Fusaka).',
    keywords: ['modexp', '7883', 'repricing'],
    introducedAt: 'osaka',
    observableShapes: ['simulate'],
  },
  {
    eip: 7892,
    name: 'Blob parameter only upgrade',
    summary: 'Blob target/max parameter changes — not a user-facing opcode in this lab.',
    keywords: ['blob', '7892'],
    introducedAt: 'osaka',
  },
  {
    eip: 7939,
    name: 'Count leading zeros (CLZ) opcode',
    summary: 'CLZ opcode on Osaka when bundled in the client.',
    keywords: ['clz', '7939', 'opcode'],
    introducedAt: 'osaka',
    observableShapes: ['simulate'],
  },
  {
    eip: 7951,
    name: 'secp256r1 precompile support',
    summary: 'P-256 verify precompile at 0x100 on Osaka.',
    keywords: ['secp256r1', 'p-256', '7951', 'precompile'],
    introducedAt: 'osaka',
    observableShapes: ['simulate'],
  },
  {
    eip: 7918,
    name: 'Blob base fee bounded by execution cost',
    summary: 'Blob fee economics — not observable without blob txs.',
    keywords: ['blob', '7918'],
    introducedAt: 'osaka',
  },
  {
    eip: 2780,
    name: 'Reduce intrinsic transaction gas',
    summary: 'Lower intrinsic tx gas on Amsterdam (experimental in client).',
    keywords: ['intrinsic gas', '2780'],
    introducedAt: 'amsterdam',
    observableShapes: ['transaction'],
  },
  {
    eip: 7708,
    name: 'ETH transfers emit a log',
    summary: 'Synthetic Transfer logs on nonzero ETH moves on Amsterdam.',
    keywords: ['7708', 'transfer log'],
    introducedAt: 'amsterdam',
    observableShapes: ['transaction', 'simulate'],
  },
  {
    eip: 7843,
    name: 'SLOTNUM opcode',
    summary: 'SLOTNUM pushes header slot number — use run_block with header.slotNumber.',
    keywords: ['slotnum', '7843', 'header'],
    introducedAt: 'amsterdam',
    observableShapes: ['block'],
  },
  {
    eip: 7778,
    name: 'Deterministic factory predeploy',
    summary: 'CREATE2 factory predeploy on Amsterdam.',
    keywords: ['7778', 'factory', 'predeploy'],
    introducedAt: 'amsterdam',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 7928,
    name: 'Block-level access lists',
    summary: 'Block access lists — generate verb planned; not observable as BAL JSON yet.',
    keywords: ['7928', 'bal', 'access list'],
    introducedAt: 'amsterdam',
  },
  {
    eip: 7954,
    name: 'SELFDESTRUCT no burn',
    summary: 'SELFDESTRUCT no longer burns ETH on Amsterdam.',
    keywords: ['selfdestruct', '7954'],
    introducedAt: 'amsterdam',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 7976,
    name: 'Builder execution requests',
    summary: 'Builder requests — block builder path, limited in isolated lab.',
    keywords: ['7976', 'builder'],
    introducedAt: 'amsterdam',
  },
  {
    eip: 7981,
    name: 'State creation gas cost increase',
    summary: 'Related state-creation gas modeling — see also EIP-8037 twin.',
    keywords: ['7981', 'state gas'],
    introducedAt: 'amsterdam',
  },
  {
    eip: 7997,
    name: 'Block gas limit increase',
    summary: 'Block gas limit policy on Amsterdam.',
    keywords: ['7997', 'block gas'],
    introducedAt: 'amsterdam',
  },
  {
    eip: 8024,
    name: 'Backward compatible SWAPN, DUPN, EXCHANGE',
    summary: 'DUPN, SWAPN, EXCHANGE stack opcodes on Amsterdam.',
    keywords: ['8024', 'dupn', 'swapn', 'exchange'],
    introducedAt: 'amsterdam',
    observableShapes: ['simulate'],
  },
  {
    eip: 8037,
    name: 'State creation gas cost increase',
    summary: 'Two-dimensional gas — state creation charges on Amsterdam.',
    keywords: ['8037', 'state gas', 'first-touch'],
    introducedAt: 'amsterdam',
    observableShapes: ['transaction', 'simulate'],
  },
  {
    eip: 8038,
    name: 'State-access gas cost update',
    summary: 'State-access repricing — SSTORE write jump on Amsterdam.',
    keywords: ['8038', 'sstore', 'state access'],
    introducedAt: 'amsterdam',
    observableShapes: ['simulate', 'transaction'],
  },
  {
    eip: 8246,
    name: 'EIP-8246 (Amsterdam bundle)',
    summary: 'Bundled in Amsterdam client — see execution-specs for behavior.',
    keywords: ['8246'],
    introducedAt: 'amsterdam',
  },
  {
    eip: 8282,
    name: 'EIP-8282 (Amsterdam bundle)',
    summary: 'Bundled in Amsterdam client — see execution-specs for behavior.',
    keywords: ['8282'],
    introducedAt: 'amsterdam',
  },
]

export function listEipIntroductions(): EipIntroduction[] {
  return [...EIP_INTRODUCTIONS]
}

export function introductionForEip(eip: number): EipIntroduction | undefined {
  return EIP_INTRODUCTIONS.find((entry) => entry.eip === eip)
}

export function introductionForKeyword(keyword: string): EipIntroduction | undefined {
  const normalized = keyword.trim().toLowerCase()
  return EIP_INTRODUCTIONS.find(
    (entry) =>
      entry.keywords.some((k) => k.toLowerCase() === normalized) ||
      entry.name.toLowerCase().includes(normalized) ||
      String(entry.eip) === normalized,
  )
}

export function derivedComparisonForEip(eip: number):
  | {
      baselineForkId: string
      previewForkId: string
    }
  | undefined {
  const intro = introductionForEip(eip)
  if (!intro) {
    return undefined
  }
  const baseline = predecessorFork(intro.introducedAt)
  if (!baseline) {
    return undefined
  }
  return { baselineForkId: baseline, previewForkId: intro.introducedAt }
}

export function introductionsAtFork(forkId: LineageForkId): EipIntroduction[] {
  return EIP_INTRODUCTIONS.filter((entry) => entry.introducedAt === forkId)
}

export function resolveIntroductionFork(id: string): LineageForkId | undefined {
  return resolveForkAlias(id)
}
