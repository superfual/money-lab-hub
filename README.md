# Money Lab Hub

**Practice money decisions before using real money.**

A Vietnamese–English financial learning board game: navigate twelve simulated months, protect liquidity, assess investments and learn from the consequences of your choices.

[Play Money Lab](https://fual-money-lab-x.phamphuanloc.chatgpt.site/) · [Online Duet / Group](https://fual-money-lab-x.phamphuanloc.chatgpt.site/online.html) · [Rules](https://fual-money-lab-x.phamphuanloc.chatgpt.site/rules.html)

Prototype 24 · Built by Fual Nguyen with AI-assisted development for X Layer TapeOut Accelerate.

> All money, asset scenarios and HUB balances are fictional. HUB is nontransferable and nonredeemable. No live HUB token, token sale, real-value wagering or investment return is offered. This educational prototype is not investment advice or an audited financial service.

## What players do

- Play a sixteen-space board through twelve simulated months, in English or Vietnamese.
- Choose between two routes in the same category, with capital, lockup and installment previews.
- Manage cash, emergency reserves, liquid investments, locked business/property capital and debt.
- Experience monthly valuations and cash distributions, additional market shocks, expenses, windfalls and specific side jobs.
- Read decision lessons and track liquidity, net worth and known upcoming obligations.
- Progress through Easy, Medium and Hard. New profiles receive 80 fictional HUB; winning stages unlock the next level. Free Easy play remains available to rebuild a depleted balance.
- Try Solo without a wallet; optionally sign in with a wallet for cross-device progress and a shared Solo/online HUB balance.
- Play online Duet / Group rooms with 2–6 people on separate devices, or use the separate local same-device mode.

Online match rewards are additional fictional HUB accounting, separate from ordinary stage rewards. Only players who clear the financial stage can qualify for match rewards. Full rules, ties and treasury/carry treatment are disclosed in the game.

## TapeOut integration on X Layer

Money Lab uses a real deployed TapeOut circuit as the **Capital Survival Gate**.

| Identifier | Value |
|---|---|
| Network | X Layer mainnet, chain ID 196 |
| Processor | HashPortAI #167 |
| Processor contract | `0x4f3b708af365b8f339dd35a8985ffe06c2553400` |
| Circuit ID | `48` |
| Tape ID | `48.2.167` |
| Verified author / owner | `0x1839231f7fc0d55a3ec58736574aca13f711326d` |
| Circuit creation transaction | `0xabeb7c746c58e42de338b8f6cd7277b8fae6a8c9aacda9b4b9edd2c609e2c1ef` |
| Creation receipt | Success (`0x1`), block `74614726` |

IN0 means the emergency reserve is depleted. IN1 means a mandatory payment exceeds liquid funds available before payment. The circuit computes NAND: when both inputs are 1, OUT0 is 0 and new investments are paused. An output of 1 only means this particular stop condition is inactive; it is not a safety guarantee or a buy recommendation.

`dist/tapeout.mjs` checks the network, owner, circuit metadata and four binary input cases. It reads actual `eth_call` outputs with the calldata, raw response and block provenance. Guest Solo reads from the browser; authenticated Solo reads from the server before committing actions. Online rooms pin the four actual receipts from a verified snapshot at match start; actions reuse the matching receipt. A recent stored snapshot may be reused for up to five minutes when another match starts. Online actions do not each generate a fresh chain read or transaction.

The circuit is a small explicit rule, not the whole game, a market predictor, a custodian or a cryptographic proof of the complete simulation. Content, calculations, accounts and history remain offchain. Required-read failures leave attempted actions uncommitted. Public RPC endpoints can rate-limit reads.

See [captured circuit evidence](docs/circuit-48-live-proof.json), [circuit specification](dist/content/capital-survival-gate.json) and [release manifest](tapeout-release-plan.json). The captured proof is a historical RPC observation, not a storage proof or security audit. A container and a new processor are not required by this implementation.

## Wallet accounts and privacy

Optional wallet login uses an expiring, one-use, origin-bound EIP-4361 message, verified server-side with ethers. It requires no gas, payment or token approval. Sessions use Secure, HTTP-only, SameSite=Lax cookies and expire after seven days.

Standard EVM externally owned account signatures are supported through injected providers, including the OKX browser extension and OKX Wallet's in-app DApp browser. Contract-wallet ERC-1271 verification and WalletConnect QR pairing are not implemented.

Authenticated Solo actions, random draws, HUB rewards and online settlement are server-authoritative. Stale writes are rejected; the browser cannot upload a fabricated balance or score. Guest/local progress is separate and is not silently imported into a wallet account. A wallet is not proof of one human; multiple-wallet abuse is not eliminated.

Users can clear past history while retaining HUB, unlocks, aggregate stats and question memory. Account deletion removes the profile and Solo save, revokes sessions and anonymizes personal records in completed rooms while retaining shared settlement figures. A deterministic wallet-address hash and deletion marker remain for the prototype's lifetime to prevent another welcome grant to the same wallet. The hash can be matched to a known address; it is not fully anonymous. Re-signing after deletion creates a zero-HUB profile. Finish or abandon Solo and leave online rooms before clearing or deleting. Public blockchain records cannot be erased.

## Run locally

Requirements: **Node.js 24+** and npm. Node's built-in SQLite supports the local preview and tests.

```sh
npm ci
npm run build
npm test
npm run dev
```

Open `http://localhost:4173/`. The preview creates its own ignored SQLite database and applies the two schema migrations. Set `PORT` or `MONEYLAB_PREVIEW_DB` to override the port or local database path. The preview server is a development tool; do not expose it as a production service.

For guest Solo only, `dist/` can also be served statically. Wallet accounts and online rooms require the API server and database; static hosting alone does not provide these features. Wallet login uses Secure cookies: use a secure context/localhost that supports them, and use HTTPS for hosted environments.

The Worker build embeds authored static assets into `dist/server/index.js`. A production deployment needs the logical D1 binding `DB`, both `drizzle/` migrations, HTTPS and the appropriate hosting configuration. The exported `.openai/hosting.json` intentionally contains no account-specific Site ID. Do not overwrite an existing live deployment's identity or database when setting up another host.

## Architecture

```text
dist/       Authored browser modules, visuals and game rules
worker/     Wallet authentication, authoritative Solo and online APIs
scripts/    Worker build, local SQLite preview and balance simulation
drizzle/    Append-only database migrations
tests/      Game, authentication, persistence and settlement checks
docs/       Technical evidence and synthetic balance/playtest notes
```

Primary gameplay modules: `engine.mjs`, `monthly.mjs`, `hub.mjs`, `competition.mjs`, `duel-core.mjs`. The browser and server share these modules. `worker/identity.mjs` verifies wallet ownership; `worker/solo.mjs` and `worker/online.mjs` persist authorized actions.

The source baseline has **99 passing automated tests**. They cover game accounting, duplicate-request handling, concurrent account operations, wallet signatures, cross-device recovery, deletion and failure without partial writes. They are not an independent security audit. Offline balance results in `docs/` are synthetic experiments, not real player metrics.

## Project status

Working prototype, entering invited friend playtesting. No validated retention, revenue, learning-efficacy or product-market-fit claims are made. Possible advanced scenario packs and educator-hosted sessions are business hypotheses, not existing paid products. A real HUB token is only a conditional research direction; no launch, market value or return is promised.

Demo video: being prepared. [Source provenance](docs/SOURCE-PROVENANCE.md) records the deployed source baseline. The live website remains hosted separately; updating this repository does not automatically deploy it.

## Credits and licensing

Original project material has **no open-source license selected yet**; public source visibility does not grant a general reuse license. Third-party dependencies retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Project visuals were generated for Money Lab with AI assistance. Music is a procedural Web Audio composition in `dist/soundtrack.mjs`. DM Sans and Manrope are loaded from Google Fonts, with system-font fallbacks.

This is an independent educational project. It is not an official product or endorsement of OKX, X Layer, TapeOut, Hasbro or Monopoly.

## Aggregate analytics

Owner-authorized chat reports now cover daily stage attempts, outcomes, scores, difficulty and repeat play. Browser-reported guest metrics and server-confirmed outcomes remain separate; tagged QA is excluded by default. No public statistics-read endpoint or player database is published. See [analytics guide](docs/analytics-guide.md) for retrieval, consent and coverage limitations. Dated reporting begins with this update; legacy storage totals include test activity.
