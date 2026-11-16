# Submission readiness — 16 November 2026

This is a factual checkpoint, not a security audit or completed submission.

## Verified in this review

- Automated suite: 201 tests passed, zero failed (Node 24).
- HTTP 200: home, online rooms, founder mainnet, public mainnet, testnet and independent decision verifier.
- Fresh X Layer RPC reads at block `0x488e781`: all four NAND #48 cases and all eight REF #49 cases. Full responses are in [evidence](submission-readiness-evidence.json).
- All three historical founder settlement receipts still succeed and include the settlement event.
- Public config is ready; separate public deployment succeeds and code exists at `0x28Ead12d270Da38971522DF1C88390f8dbc7ac32`.
- Live English guest UI: start Easy, review before roll with no active timer, roll to reveal two choices with active countdown, select an opportunity and invest. Month 1 completed, $1,000 holding appeared, cash updated and timer returned to pre-roll state.
- Live explicit TapeOut check: native REF #49 result appeared, with R/C/D and the four NAND composition steps at block 76081220. No signature or transaction was sent.
- Corrected outdated Decision Lab wording that said no new circuit had been deployed.

## Remaining release acceptance

- Fresh full 12-month browser run, result screen, Replay and exported receipt round-trip through the independent verifier.
- Real phone checks in VI/EN, especially light choice-card contrast, scrolling, board size and end-of-stage layout.
- Two distinct signed-in players/devices: shared progression when all qualify, a nonqualifying member, reconnect and timeout behavior. Automated coverage exists; it is not equivalent to this live test.
- Founder supplies final video URL and checks the competition form. No form was submitted during this review.

## Submission package

Use the [judge guide](judge-review.md), README, public demo and evidence links together. Keep the video under three minutes and show a decision, its consequence, a real circuit read and a settled result. Distinguish guest simulated balances, testnet, founder mainnet and public mainnet.

Core claim: Money Lab teaches liquidity discipline through twelve simulated months, replayable choices and explicit TapeOut rule checks. #48 supplies the investment STOP gate; #49 combines game-computed R/C/D conditions. Gameplay and financial inputs remain offchain; mainnet contracts validate server-signed outcomes. Do not describe the entire simulation as proven onchain.

Target users: beginners learning cash-flow and risk trade-offs, and facilitators running group learning. Premium educational scenarios and facilitated sessions are business hypotheses, not validated revenue. Worlds 2/3 are prototypes.

After acceptance and submission, keep Money Lab stable and move the main development focus to Decision Check, beginning with Portfolio Insider inputs, read-only analysis and reproducible rule definitions.

To refresh public observations (no signer): `node --use-env-proxy scripts/submission-readiness.mjs`.
