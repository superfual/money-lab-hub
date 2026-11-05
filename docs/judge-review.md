# Judge review guide — 5 November 2026

## A short product tour

1. Open [Money Lab](https://fual-money-lab-x.phamphuanloc.chatgpt.site). Choose VI or EN. Guest World 1 requires no wallet.
2. Start Easy. Review cash, reserve coverage and upcoming payments without time pressure. Roll to begin the 60-second decision window.
3. Compare two route opportunities, choose one, then invest or keep cash. Review the monthly financial effect and lesson. Existing investments update monthly even without a large market-shock landing.
4. Inspect the TapeOut/Risk Lab section. The binding STOP gate uses #48; explicit REF policy checks use deployed #49 when activated. Financial comparison inputs are computed by Money Lab.
5. At stage end, inspect the score and use Replay Decision to change one choice under recorded event seeds. This does not pay a second HUB reward.
6. For cross-device Duet/Group, use the online room link and separate players/devices. These balances and stakes are simulated, server-managed points.
7. Inspect [mainnet pilot evidence](mainnet-live-evidence.json) and the three transaction links in the README. Public visitors can review evidence; the current ledger only permits founder registration. Do not assume judges need real OKB to try the guest game.

## Evidence and limitations

| Claim | Inspect | Boundary |
| --- | --- | --- |
| Real TapeOut integration | `dist/tapeout.mjs`, `dist/ref-reader.mjs`, `dist/risk-circuit.mjs`, `docs/ref-deployment.md`, live REF configuration | Circuit checks supplied bits; Money Lab supplies simulated financial inputs |
| Native REF #49 | Mint transaction and all eight cases in `mainnet-live-evidence.json` | Mainnet RPC observations, not a security audit |
| Actual mainnet settlement | `contracts/MoneyLabMainnet.sol`, three successful `RunSettled` transaction receipts | Founder-only pilot, offchain game and server-signed results |
| Replay | `dist/decision-lab.mjs`, its tests and Replay UI | Historical recorded seeds; no fabricated future paths or extra reward |
| Completeness | World 1 Solo, online rooms, timers, lessons and result handling | External RPC can be unavailable; not a fully decentralized service |
| Growth potential | `CONTRIBUTING.md`, investment-world guide | Worlds 2/3 are early playable prototypes; token sale/revenue are not claimed |

## Demo video outline (under three minutes)

- 0:00–0:25: problem and target users — learning liquidity discipline before using real money.
- 0:25–1:15: real World 1 gameplay, two options, cash-flow panel, portfolio and a consequence/lesson.
- 1:15–1:55: Capital Survival Gate, native REF rule check and replay comparison. Explain what is onchain and what is offchain.
- 1:55–2:20: show mainnet settlement evidence; distinguish founder testing from user traction.
- 2:20–2:45: mention multiplayer and Worlds 2/3. Proposed business experiments: premium educational scenarios and facilitated group learning; not validated revenue.
- 2:45–3:00: founder invitation to teammates and the long-term product vision.

Use the current public site for gameplay and public explorer links for evidence. Do not show seed phrases, wallet passwords, runtime secrets or private player journals. Video recording and submission are performed by the founder; this repository update does not submit the competition form.
