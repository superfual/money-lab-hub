# Money Lab Hub

**Practice managing money before risking real money.**

A bilingual Vietnamese/English financial-education game by **Fual Nguyễn (Phạm Phú An Lộc)**. Navigate 12 simulated months, manage cash and reserves, invest, meet obligations, and explore how different decisions change liquidity. Money Lab integrates TapeOut circuits on X Layer and includes a founder-operated mainnet result-settlement pilot.

[Play Money Lab](https://fual-money-lab-x.phamphuanloc.chatgpt.site) · [Judge review guide](docs/judge-review.md) · [Mainnet pilot](https://fual-money-lab-x.phamphuanloc.chatgpt.site/mainnet.html) · [Contribute](CONTRIBUTING.md)

## A message from the founder

> I did not have enough time to find teammates to develop this product together before the submission. I am still actively looking for them: people who share the vision and want to help refine World 1 and build World 2 and World 3 with me. Money Lab is a long-term project, and I want to keep learning, testing with players, and improving it with a team.
> — Fual Nguyễn

> Tôi không đủ thời gian để tìm đồng đội cùng phát triển sản phẩm này trước khi nộp bài. Nhưng tôi vẫn luôn tìm kiếm họ — những người cùng chung tầm nhìn, để cùng nhau hoàn thiện World 1 và xây dựng World 2, World 3. Money Lab là một dự án dài hạn; tôi muốn tiếp tục học hỏi, lắng nghe người chơi và phát triển sản phẩm cùng một đội ngũ.

This is a solo-founder, AI-assisted prototype. It is not represented as the work of a staffed development team or as independently audited software. Potential contributors can open an issue in this repository; see [collaboration priorities](CONTRIBUTING.md).

## What works today

| Area | Current scope |
| --- | --- |
| World 1 | Illustrated 16-space board; 12 months; Easy/Medium/Hard; cash, reserves, debt, installments and monthly portfolio changes; specific global investment scenarios, side jobs, windfalls, expenses and lessons |
| Decision time | Unlimited pre-roll review; 60 seconds starts on a successful dice roll, covers route/event decisions, and is not renewed by reload. The next month waits for another roll |
| Multiplayer | Same-device Duet/Group and server-managed cross-device rooms; shared-level progression when every member qualifies; simulated HUB stakes and treasury accounting |
| Replay Decision | Compare one changed decision against recorded event seeds without changing the original score or HUB |
| TapeOut | Mainnet NAND circuit #48 for the binding STOP gate; deployed native REF circuit #49 for explicit three-condition educational policy checks |
| Wallet identity | Optional signed-message EOA login and server-persisted progress. Guest saves remain local and separate |
| Mainnet pilot | Separate chain-196 contract with free, nontransferable HUB; founder-only registration; user-signed start and settlement transactions; all three difficulties have successful settlement receipts |
| Worlds 2/3 | First playable multiplayer tourism-investment prototypes, with fixed zoning and land → construction → operation stages. Not complete commercial worlds or mainnet integrations |
| Interface | Responsive PC/mobile layout; compact cash-flow/holdings panels; month indicator near decisions; emerald-and-silver theme; optional original browser-generated soundtrack |

**Money on the board is hypothetical USD. Ordinary HUB, testnet tHUB and mainnet pilot HUB are distinct ledgers.** There is no HUB sale, transfer, withdrawal, redemption or guaranteed monetary value. Real OKB is used only for explicitly approved mainnet gas/operations. Mainnet pilot HUB does not unlock server World 2/3 balances.

## TapeOut integration and evidence

- **Processor:** HashPortAI #167, X Layer mainnet (196), `0x4f3b708af365b8f339dd35a8985ffe06c2553400`.
- **Circuit #48:** Tape ID `48.2.167`; two inputs, one output, NAND truth table. The existing Capital Survival Gate uses verified outputs to block investment under its STOP condition.
- **Circuit #49:** Tape ID `49.2.167`; three inputs, one output; four references to #48 form `R AND C AND D`. Native evaluation was verified for all eight input combinations. [Deployment transaction](https://www.oklink.com/xlayer/tx/0x1e42ebe28a0fce42acdd8fb2d413d53b2a0d52134e47e65638fc868ea0fad4a1).
- **Policy:** Money Lab computes R/C/D from simulated financial state. TapeOut evaluates their Boolean combination. This does not prove real-world bank balances, market prices, or the entire game state.
- **Trust:** gameplay runs offchain; the result server signs a structured outcome and the ledger checks that signature, stage identity and settlement rules. This is not a fully trustless game, a zero-knowledge proof, or an independent security audit.

See [captured live configuration and receipts](docs/mainnet-live-evidence.json), [REF design/deployment](docs/ref-deployment.md), [risk-engine boundaries](docs/tapeout-risk-engine.md) and [mainnet pilot guide](docs/mainnet-pilot.md). Captured RPC observations are inspectable evidence, not cryptographic storage proofs; re-read the chain to verify current state.

## Founder mainnet demonstration

Ledger: [`0x945b8E9Cc8401bB18580897dba4c2055b22D045d`](https://www.oklink.com/xlayer/address/0x945b8E9Cc8401bB18580897dba4c2055b22D045d).

| Difficulty | Score | Outcome | HUB reward | Settlement |
| --- | ---: | --- | ---: | --- |
| Easy | 68/100 | Won | 14 | [Transaction](https://www.oklink.com/xlayer/tx/0x50d931b5ce3eeb50d965ba7f6a860673c249cb936508b95bf757ad93d694f492) |
| Medium | 80/100 | Won | 34 | [Transaction](https://www.oklink.com/xlayer/tx/0xe48794f5aa9a81d765f684bc1edf4b09d7f21348fe5ac5f8e0de1fc10faf4b4c) |
| Hard | 19/100 | Lost; 80-point bond forfeited | 0 | [Transaction](https://www.oklink.com/xlayer/tx/0x12ec7c319fabc4187368999c8edfb416effdde4bb62d3fc01cddc7fb38879eed) |

These are founder-operated pilot runs, **not three independent users or evidence of commercial traction**. Their settlement arithmetic was 80 + 14 + 34 − 80 = 48 HUB at the captured checkpoint. Outcomes remain public even if server journals are deleted. Mainnet access is restricted to the founder wallet in the current contract.

## Run, test and build

Use Node.js **22.13+** (the local preview/tests use `node:sqlite`; the current validation ran on Node 24). From a fresh checkout:

```sh
npm ci
npm test
npm run build
npm run dev
```

The preview prints its local URL. Server APIs require the included SQLite/D1 adapter and SQL migrations; merely serving `dist/` as static files supports only part of the product. Blockchain-attestation secrets and production user data are not included. Local EVM tests use generated test signers and never spend mainnet funds. The configured browser-wallet flows always require the owner to review/sign; no deployment is performed by the build or test commands.

The 5 November 2026 review passed **190 tests, 0 failures**, including accounting, replay, circuit/REF checks, identity/origin/revision guards, timers, multiplayer and local-EVM contract settlement. Tests do not substitute for an independent audit. Live external RPC availability may affect interactive play.

## Repository map

- `dist/`: authored pages, shared simulation modules, circuit adapters and assets.
- `client/`: browser entrypoints bundled by `scripts/build-online.mjs`.
- `worker/`: identity, Solo, multiplayer, analytics, REF activation and ledger APIs.
- `contracts/`: distinct testnet and mainnet pilot Solidity ledgers.
- `drizzle/`: schema migrations; no production database contents.
- `tests/`: simulation/API/adapter/local-EVM validation.
- `docs/`: architecture, limitations, public chain evidence and development notes.

The GitHub hosting manifest intentionally omits the production Site identity. Production signing keys stay in runtime secret storage. [Earlier prototype notes](docs/development-history.md) preserve the development history; the current README and judge guide take precedence over older deployment-status descriptions.
