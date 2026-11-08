# Decision receipts: what TapeOut contributes

## Shipped scope

World 1 Risk Preflight continues to use the original game accounting and educational thresholds. Each executable projected branch now explains:

- available cash plus reserves;
- expected salary, living costs, level charges and installments;
- money left after known obligations;
- R (one month of reserve), C (coverage), D (installment burden);
- the Boolean output supplied by TapeOut truth-table composition and, when activated, native REF #49.

This is not a new rule or a replacement for STOP enforcement. Unknown income and unexpected costs are excluded. No month-13 projection is made after stage completion.

## Export and verification

After a successful chain check, download `moneylab-decision-receipt.json`, schema `moneylab-decision-receipt.v2`. Save its displayed digest separately. It binds the supplied game snapshot, policy and hash, selected actions, projections, exact call receipts and circuit identity/block to one canonical SHA-256 digest. Snapshot export deliberately omits decision history and the full Replay trace; it contains simulated financial data, so share only intentionally.

Open `/decision-verifier.html`, upload/paste the file, and optionally enter the separately recorded digest. Files are processed locally. The verifier recomputes the projections and R/C/D, validates call encodings and recorded truth tables, compares outputs, and checks the digest. It uses the repository's deterministic engine and policy modules: reviewers may run or host the open source themselves. It is independent of the Money Lab game-session API, not an independently authored implementation of all accounting.

An optional second action re-reads #48 and #49 (when present) from X Layer at the recorded block. Only read-only RPC is used. It does not depend on `/api/ref/config`; the deployed #49 design, shape, owner and eight cases are checked. Historical-data availability and RPC honesty remain trust assumptions. A failed/unavailable RPC never yields a successful chain-check badge.

The examples on the page are explicitly synthetic, not historical mainnet receipts. Pass/fail examples demonstrate financial policy output; a modified-output example demonstrates digest rejection. Synthetic receipts cannot be used with the chain re-read action.

## Precise trust boundary

- A self-contained digest proves consistency only. An editor can recompute a new digest.
- A separately trusted digest anchors the supplied file to that earlier value, but does not make inputs true.
- Circuit re-reading checks circuit outputs at a block; it does not authenticate the original game state, offchain data sources, randomness or reward entitlement.
- Neither offline verification nor chain re-reading proves HUB settlement. Use the separate contract receipt verifier for settlement.
- This release sends no transaction, creates no circuit, changes no HUB rewards and introduces no paid API.

## Next research stage, not yet shipped

1. Benchmark a bounded integer comparator/arithmetic circuit so TapeOut computes more than three precomputed flags. Define units, rounding, ranges and overflow behavior first.
2. Pin a challenge's policy/circuit identity and connect appropriate checks to contract enforcement only after adversarial tests and cost measurement.
3. Evaluate improved learning through explanations and same-event Replay, without claiming profit guarantees or fair randomness from a deterministic circuit.
