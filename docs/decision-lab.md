# Money Lab Decision Lab

> Current checkpoint (5 November 2026): native REF #49 is deployed and activated. Explicit policy checks use its verified onchain output when configured; financial inputs and gameplay remain offchain. See [current overview](../README.md) and [live evidence](mainnet-live-evidence.json). Descriptions of undeployed composition below document earlier development.

## Purpose

Learn from a decision, rather than rerolling luck. After a newly recorded stage, replace one investment/optional purchase with its opposite, or omit one capital management action. Compare monthly cash plus reserves, net worth, forced sales and unpaid obligations. The original game, HUB ledger, scores, settlements and analytics remain unchanged.

The public `/decision-lab.html` example is a fixed illustrative scenario, not player activity or adoption evidence. Both Vietnamese and English are supported. Solo, local multiplayer, online own-seat views and Testnet Lab expose the panel. Completed testnet journals can be opened with **Review decisions** while no chain stage is active; the API authenticates the account and checks ownership and contract scope.

## Exact replay and limits

The shared engine records accepted commands, arguments and event seeds, beginning with the first accepted command in this release. Rejected commands are not recorded. Nested movement records only the player command. Replay uses the same engine, seeds and subsequent choices, changes one choice, and never chooses replacement actions automatically. It stops if the alternate stage ends or a subsequent recorded choice becomes infeasible. Different horizons are disclosed. No unrecorded future months are generated.

A canonical replay must match the saved game before comparison is enabled. Old saves cannot recover missing seeds; their panel explains this limitation and links to the example. An active legacy stage can record only its remaining portion. Logs are capped at 256 commands; truncated traces are not presented as exact replays. Clearing/deleting applicable server journals removes traces with them. Exported files remain under the downloader's control.

These logs are replay inputs, not cryptographic attestations of player honesty. Server games use authoritative server state; guest saves remain editable. This feature is educational, not an audited financial simulator or investment recommendation.

## Creative use of TapeOut

Existing mainnet circuit #48, HashPortAI processor #167, at `0x4f3b708af365b8f339dd35a8985ffe06c2553400` supplies the actual NAND truth table through read-only `eth_call`. On explicit verification, chain 196, owner, circuit shape and all four input/output cases are checked at one block. A failed RPC read produces no verified badge and no local substitute.

The lab composes four NAND applications offchain to evaluate `R AND C AND D`:

- R: emergency reserve covers at least one month of the level's living costs.
- C: current liquid funds plus next known income cover next mandatory costs.
- D: next installment payments do not exceed 30% of next income.

The 1-month and 30% thresholds are illustrative game-authored rules, not external financial standards. TapeOut does not attest the game's financial inputs. This composition is not a newly deployed circuit and does not change the existing game stop gate, score or reward rules. Forecast checks are unavailable after a stage has ended. On explicit download, the JSON export includes actual raw RPC receipts, calldata, block and composed nodes, not a transaction proof of the whole game.

New accepted gameplay actions additionally retain the real stop-gate read receipt when available. Online multiplayer uses the already verified match snapshot and labels that source. Counterfactual outputs are educational recomputations, never represented as historical chain writes.

## Release validation

Automated checks cover replay equality after JSON storage, immutable originals, seed-preserving alternate decisions, malformed/truncated traces, infeasible action stops, all eight composed policy inputs, receipt tampering, and authenticated testnet review isolation. No new contract, database migration, gas payment or blockchain deployment is required by this release.

## Risk engine upgrade

Preflight and replay now share `risk-policy.mjs` and the versioned `moneylab-risk-1` descriptor. New traces pin the policy, while old unpinned traces are labelled. Explicit preflight checks export policy/input digests, real circuit reads and the undeployed REF design conformance vectors. See [risk engine scope and trust boundaries](tapeout-risk-engine.md). Testnet result verification is separate from the TapeOut Boolean proof.
