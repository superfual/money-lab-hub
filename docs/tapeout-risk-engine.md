# TapeOut × Money Lab: check, replay, verify

> Current checkpoint (5 November 2026): deployed native REF #49 now evaluates explicit R/C/D combinations. Money Lab still computes the financial inputs offchain, and the existing binding STOP gate remains #48. The separate mainnet pilot also records server-attested outcomes. See [current overview](../README.md) and [live evidence](mainnet-live-evidence.json). Earlier statements about an undeployed REF refer to the initial design milestone.

## Shipped scope

- **Before a decision:** a shared financial preflight projects the same engine action on an isolated copy and shows cash, reserves, debt and the next known mandatory obligations. It is reused in Solo, local multiplayer, online own-seat views and Testnet Lab. It never signs, changes a real game, awards HUB or records analytics.
- **One policy:** `moneylab-risk-1` defines R (one month reserve), C (next known payments covered), D (installments ≤30% next income). New replay traces pin the descriptor; exported receipts include a canonical SHA-256 policy digest and a snapshot/action digest. These hashes are local commitments, not onchain anchors. Unpinned old traces are labelled; altered/unsupported policy descriptors are rejected by exact replay comparison.
- **Actual TapeOut reads:** explicit checks read chain 196, circuit metadata/owner, netlist and all four NAND cases at one block. The existing Capital Survival Gate remains the binding investment stop rule. R/C/D composition is educational and offchain; it does not silently change win thresholds, existing stages or rewards.
- **Replay:** original and counterfactual use the same engine and recorded event seeds. Financial input calculations use the same policy module as preflight. No missing future events or substitute player decisions are fabricated.
- **Result verification:** Testnet Lab can export the exact stored server state, then the browser reads the pinned ledger `results(runId)` on chain 1952. It verifies runtime code, player, level, score, survival, win/reward and keccak256 of the exact serialized state at one confirmed block. Zero entries are “not settled”; other discrepancies are “mismatch.” The result checker has no signing or sending methods.
- **Independent file checker:** `/verify-result.html` reads a selected JSON locally and re-reads the ledger. It does not trust a status or an expected score embedded in the file and never uploads the journal. This is a second verification path, not an independent security audit of the website's code.

## Public walkthrough

`/risk-lab.html`: fixed illustrative “buffer”, “thin reserve” and “STOP active” scenarios; not player records. `/decision-lab.html`: completed illustrative stage for exact counterfactual replay. `/testnet.html`: sign in, select **Check onchain settlement** for a completed journal, then download evidence. A file contains wallet and decision history; users choose whether to share it. Erasing server journals removes replay/export availability but does not erase blockchain data.

Money on the board is **simulated USD**. HUB/tHUB balances are separate fictional educational points. No token purchase, transfer, withdrawal, new real-value asset or contract deployment is added here.

## Circuit reuse: undeployed REF design

The downloadable draft uses 4 REF records pointing to the existing mainnet circuit #48 on processor `0x4f3b708af365b8f339dd35a8985ffe06c2553400`, implementing `R AND C AND D`:

| Record | Inputs | Output signal |
|---|---|---|
| REF #48 | R=2, C=3 | 5 = NAND(R,C) |
| REF #48 | 5,5 | 6 = AND(R,C) |
| REF #48 | 6,D=4 | 7 = NAND(RC,D) |
| REF #48 | 7,7 | 8 = AND(R,C,D) |

148 encoded bytes, 3 input pins, 1 output, 0 state, 4 references, 12 expanded gates because #48 reports 3 gates. No top-level NAND/LATCH records. The encoding follows the TAP-02 **draft**, not a declaration of finalized cross-chain conformance. All eight Boolean vectors are checked locally using the actual read truth table. **This does not simulate a tape-out or deploy the design.** Processor registration, current target-chain semantics, fee and burn requirements need a fresh read-only transaction simulation before any real tape-out. This release quotes no transaction cost and spends no funds.

This demonstrates a meaningful TapeOut extension: a reusable financial rule circuit design and an inspectable learning workflow. It does not claim arithmetic circuit evaluation of USD amounts; Money Lab computes the comparisons and supplies their bits.

## Trust boundaries

- TapeOut verifies logic results for supplied bits, not financial data sources.
- Preflight/replay compositions run offchain; only the referenced NAND calls are mainnet reads.
- Match rooms can use their already verified circuit snapshot; its source block remains labelled. Explicit preflight checks make a fresh read.
- The ledger authenticates a **server-attested result**. It does not prove each game transition, fair randomness or honest server operation.
- A local guest save can be edited. Neither its trace nor local SHA-256 proves honest play.
- Public RPC reads depend on RPC availability/trust. Wrong-network/code/data failures produce no verified result. No cost/speed/security superiority is asserted.
- No container is opened. DeWEB, TapeKit hosting and TapeSend remain research items, not integrated features.

## Primary sources checked 2026-11-04

- [TAP-02: Circuit Netlist Format and Evaluation Semantics](https://github.com/TapeOutProtocol/TAPs/blob/main/TAPs/TAP-02.md): draft, updated 2026-10-04; REF encoding and evaluation rules. Its deployed-source verification statements concern BNB Chain, so they are not treated as X Layer deployment proof.
- [TAP-10: DeWEB Access and Messaging Layers](https://github.com/TapeOutProtocol/TAPs/blob/main/TAPs/TAP-10.md): draft access/messaging specification.
- [TapeKit README](https://github.com/TapeOutProtocol/TapeKit): chain/name support and verification model. Support in an upstream tool is not evidence that Money Lab is hosted with that tool.

## Validation

Tests cover projection isolation/accounting, STOP/funds rejection, policy/input digest changes, policy pin mismatch, REF byte layout/eight vectors, result hash and all outcome fields, wrong chain/runtime, absent settlement, unavailable RPC and owner-scoped read-only evidence. Existing engine, room, wallet and EVM contract checks continue to run. No migration or contract replacement is required.

### REF draft revision 2

The initial undeployed design omitted the two constant signal slots. Revision 2 reserves signals 0/1 for constants, uses inputs R/C/D at 2/3/4 and produces output at 8. The running offchain composition and existing #48 circuit were unaffected. Byte-level tests now decode the encoded REF records independently of the design evaluator.

### Native X Layer simulation — no broadcast

Revision 2 passed all 8 inputs at mainnet source block **75,027,318**. `scripts/check-ref-atomic.mjs` compiles a temporary helper and supplies its code using the standard `eth_call` state-override parameter at an otherwise empty address. Inside that one ephemeral call, the helper calls actual `tapeout`, checks the stored netlist, reads the 3/1/0/12 shape, and invokes actual processor `eval` for all eight inputs. Outputs are `0,0,0,0,0,0,0,1`. No transaction is broadcast and none of that call's writes persist. The returned circuit ID belongs only to the simulation and is **not** an existing new mainnet circuit.

See [raw atomic simulation](ref-atomic-simulation.json) and [read-only fee preflight](ref-preflight.json). These are point-in-time observations, not permanent quotes. Re-run both scripts before creating a real transaction. The wallet must show the final fee before any signature. No container is opened.

Reproduce from the repository root (Node with proxy support if required):

```sh
node --use-env-proxy scripts/simulate-ref.mjs docs/ref-preflight.json
node --use-env-proxy scripts/check-ref-atomic.mjs docs/ref-atomic-simulation.json
```
