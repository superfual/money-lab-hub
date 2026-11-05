# Archived development notes

These notes preserve earlier prototype milestones. Statements such as “not deployed”, “single-player only” and “undeployed REF” describe their historical version, not the current product. For current scope, use [README](../README.md), [review guide](judge-review.md) and [live evidence](mainnet-live-evidence.json).

## Prototype 25 — isolated X Layer Testnet Lab

Adds a testnet-only, nontransferable tHUB ledger and server-attested stage settlements, with a wallet deployment/review screen at `/testnet.html`. Blockchain deployment still requires the owner wallet; no contract address is fabricated. Existing game balances and TapeOut mainnet integration remain separate. See [testnet guide](docs/testnet-lab.md).

## v24 — owner-readable product analytics

First-party stage measurements and flat daily aggregates support on-demand charts in chat. See [the analytics retrieval and metric guide](docs/analytics-guide.md) and `scripts/analytics-report.mjs`. Owners/editors read private aggregate tables through Sites; no public report endpoint is exposed. Dated counters start at deployment, not at the project's original launch. Historical snapshots include QA; profiles are never claimed as unique real people. QA can be tagged with `?ml_test=1`. Browser measurements are optional; server-confirmed outcomes are kept separate. No game rules, HUB economics or wallet-transfer features change.

## v23 — Wallet accounts and cross-device progress

- Optional EVM wallet login uses an expiring, origin-bound EIP-4361 message, verified with ethers on the server. Standard EOA signatures are supported; contract-wallet ERC-1271 verification and WalletConnect QR pairing are not implemented. OKX browser extension and the OKX in-app DApp browser can inject the wallet provider. No gas, payment, token approval, or new token is involved.
- HTTP-only, Secure, SameSite=Lax sessions expire after seven days. The browser never stores a wallet session secret in localStorage. Only a one-use five-minute challenge is signed. Signing in on another device recovers the same account and online seat.
- Authenticated Solo actions, random draws, balances, unlocks, results and revisions are persisted server-side. Solo and online Duet/Group share HUB. Concurrent stale writes are rejected; no browser save or balance is imported into the wallet account. Guest Solo/local saves and legacy online guest seats remain separate.
- Clear history removes journals and past stage entries while retaining HUB, unlocks, aggregate stats and question memory. Account deletion revokes sessions, removes the profile and Solo save, and anonymizes former online seats while retaining shared settlement figures. Both require leaving online rooms and finishing or abandoning Solo first.
- A deterministic wallet-address hash and deletion marker remain for the lifetime of this prototype to prevent a second welcome grant. This hash is linkable to a known address, not fully anonymous. Re-signing after deletion creates a fresh zero-HUB profile; free Easy play can earn HUB. This is not a claim to erase public blockchain data.
- HUB remains fictional, nontransferable and nonredeemable. Guest data is never silently merged or credited to a wallet. Wallet identity alone is not one-person verification; multiple-wallet abuse is not eliminated. Real token issuance, custody and real-value wagering are out of scope.
- Authentication and cloud API routes require the D1 migration `0001_wallet_accounts.sql`. Keep existing applied migration immutable. Preview startup applies both existing migrations to its local SQLite database.

# Money Lab — 12 Months

A bilingual, single-player financial-literacy board game. Players navigate 12 simulated months with income, living costs, unexpected expenses, market shocks, portfolio decisions and knowledge questions.

## Run and check

Serve `dist/` as static files. No installation or build step is required.

```sh
node --test tests/*.test.mjs
```

The game saves only to the current browser's localStorage. It requires no wallet and uses no real money. It is not multiplayer and does not sync between devices.

## TapeOut integration (v7)

Capital Survival Gate is Circuit **#48**, Tape ID **48.2.167**, on HashPortAI #167, X Layer (chain ID 196). Processor circuits contract: `0x4f3b708af365b8f339dd35a8985ffe06c2553400`. Author/owner verified: `0x1839231f7fc0d55a3ec58736574aca13f711326d`.

`dist/tapeout.mjs` reads `eval(uint256,bytes)` via `eth_call` at an explicit block on `https://rpc.xlayer.tech`. Inputs are LSB-first. Startup checks chain ID, owner, shape (2 inputs / 1 output / 0 state / 3 gates) and all four NAND cases. Every gameplay mutation is staged on a clone; its gate output is read from the contract before committing the updated state. A failed read leaves the previous state unchanged and new investment controls locked. There is no offline fallback presented as on-chain verification. The engine's local NAND is used as an expected-output check; the returned contract output is assigned to the committed gate.

STOP activates when reserves have been depleted and the unexpected expense exceeded liquid money available before payment. It blocks new investments until reserves are replenished. The board's money, random die, history and score remain off-chain simulations. This circuit does not custody funds or enforce real portfolio transactions.

Players need no wallet, signatures, OKB, paid transactions or opened container. The UI exposes input/output, latest read block, four-case proof, owner, and a JSON download containing calldata and raw RPC results. Proofs are RPC observations, not cryptographic storage proofs. Contract upgrades or RPC outages can stop gameplay until verification recovers.

The tapeout transaction hash has not been recorded. `transactionHash` intentionally remains null; the processor address is not a transaction hash. `dist/classic.html` preserves the older local-only emergency-fund scenario and is not part of the on-chain integration.

Checks: `node --test tests/*.test.mjs`. Adapter tests cover ABI packing, malformed outputs, network/owner/shape changes, logic mismatch and RPC failure. The browser integration is also checked against live X Layer reads. See `docs/circuit-48-live-proof.json` for a captured read-only verification.

Primary integration reference: https://github.com/NetLayerLabs/Cerebr/blob/main/TAPEOUT.md (fork-verified SDK notes). Live circuit behavior and addresses are independently checked rather than assumed from these notes.

## Simulation assumptions

Initial cash $7,000 + reserves $3,000. Each month adds salary $1,800 and living costs −$1,400. One random die determines the landing tile; only that tile applies. All market rates and costs are fictional scenarios, not forecasts. No fees, taxes, interest or guaranteed returns are modeled. Installment property has explicit principal debt; net worth subtracts outstanding debt. Ordinary purchases/sales and principal repayments do not create wealth. Locked property and business holdings cannot be sold during the game.

Score (0–100) = wealth (40), reserve (35), liquidity (15), knowledge (10). Exact benchmarks are available in How to Play. The score is a learning mechanic, not a validated measure of investing skill.

## Richer scenarios (v7)

- 12 bilingual knowledge questions are drawn without replacement for each game; IDs and shuffled answer positions persist through reloads and language switches. The deck is large enough for every possible turn in a 12-month game. If exhausted, it offers an unscored review instead of repeating questions.
- Unexpected spaces draw essential repairs/medical bills or optional iPhone/car/travel offers. Optional offers can be declined; accepted offers use cash only. Separate enjoyment points recognize the non-financial choice without altering the financial score. Resale values of these optional purchases are deliberately not modeled.
- Opportunities: simulated Apple (AAPL)/Coca-Cola (KO) shares, BTC/ETH, installment property, a fashion-store partnership and restaurant capital. No live prices, token amounts or actual market data are represented. The quick allocation is explicitly a fictional ML-100 fund.
- Holdings show their category, estimated gross value, lockup, debt and installment obligation. Market events apply distinct fictional category shocks. BTC and ETH share the same category shock, as do Apple (AAPL) and Coca-Cola (KO); adding a ticker does not magically diversify those risks.
- Property costs $4,500 gross, paid with $2,700 down and $1,800 debt. Six $300 installments start next turn. Cash is used first, then reserves, then liquid asset sales. Unpaid installments remain debt and end the game early. No interest, rent or distributions are modeled. Property/business capital stays locked for the whole game, including after principal is repaid; final value is a hypothetical mark, not cash proceeds.
- Existing v1 games migrate without resetting cash, reserves, portfolio or turn count. Old anonymous investments become a labeled legacy portfolio. The engine uses version 2 in the existing storage slot.

## Global stock examples (v8)

The stock examples are Apple (AAPL) and Coca-Cola (KO), using hypothetical dollar allocations and category shocks. No live quotes are implied. Prior v7 stock slots migrate to the US examples while preserving every value and decision. Playing remains free; no OKB entry fee or OKB payout exists.

## Continuous campaign and 80 HUB (v12)

Each local profile starts with 80 fictional HUB. Easy is free and requires at least 50/100 plus 12 solvent months to clear. Clearing Easy unlocks Medium (40 HUB commitment, 60-point goal); clearing Medium unlocks Hard (80 HUB, 65-point goal). Higher levels have no free-practice bypass. Failure or abandonment forfeits the commitment. Easy remains available at zero HUB to rebuild funds.

Every completed winning challenge pays a repeatable stage reward: base + floor((score − goal)/5) × step. Easy base/step = 12/2; Medium = 28/3; Hard = 60/4. Commitment is also returned on a win. Each run settles only once, even after reload; replaying requires completing a genuinely new stage. No cash value, transfers, token purchases or wallet claims exist.

Finishing a stage presents direct Continue buttons for unlocked, affordable levels. A new stage starts with that level's scenario budget, while the HUB bank, unlocks, question memory and campaign journal continue. This avoids an extra reset/menu step; it does not carry USD assets into a different difficulty scenario. Old 300-HUB grants are reduced by 220 once, floored at zero, while prior rewards/losses and active commitments are retained. A migration ledger entry explains the change.

| Level | Initial cash / reserve | Salary / living | Extra required pressure | Other risks |
| --- | --- | --- | --- | --- |
| Easy | 7000 / 3000 | 1800 / 1400 | None | Base essential costs and category shocks |
| Medium | 6500 / 2000 | 1700 / 1550 | 450 in month 1; 250 in months 4, 7, 10 | Income cuts 350 in months 4, 8; costs ×1.2; swings ×1.25 |
| Hard | 5500 / 1500 | 1600 / 1650 | 900 in month 1; 450 in months 3, 5, 7, 9, 11 | Income cuts 500 in months 3, 6, 9, 12; costs ×1.5; swings ×1.5 |

The first roll immediately demonstrates different financial pressure, regardless of the landing tile. Required pressure is shown separately on the monthly event card. Content: 36 bilingual questions (conceptual and quantitative tiers), 18 surprises, 12 concrete opportunities, 9 market stories with category-specific effects. Question memory continues across stages until the applicable bank is exhausted; no within-stage repeats.

## Same-device duet (v12)

`duel.html` implements two-player hotseat play, not online matchmaking. Each named player has a separate 80-HUB duet profile and portfolio, independent of the solo profile. Both use an identical seeded dice/event schedule, starting budget and difficulty. Each resolves a monthly decision, then passes the device. Question explanations are withheld until both have completed that turn. After both finish, ranking compares solvent completion, months survived, learning score, net worth, then reserves. Exact ties are draws. Each profile earns HUB for its own cleared goal, rather than taking the opponent's tokens. Profiles, turns, seed and partial match persist locally.

The lobby requires both profiles to unlock and afford a level. Abandoning discloses that both current commitments are forfeited. Next match retains both profile histories and balances. Every gameplay mutation stages a clone and reads the TapeOut gate before committing. This device-local prototype is not a secure real-token ledger, online multiplayer server or anti-cheat system.

## Illustrated game world (v11)

Original isometric miniature art now appears in the intro, board center, all six tile categories and event cards. Images contain no UI text and are shared by both languages. Native labels and buttons remain accessible. See `docs/art-direction-v11.md` for the prompt set and source asset paths. Both images are copied unchanged from built-in image generation. The game rules, HUB balances and read-only TapeOut integration are unchanged; no wallet connection is added.

## v13 — clear rules and movement choices

`rules.html` is a standalone bilingual introduction and complete rulebook. The same guide is available in the board's “About & Rules” dialog. Both solo and duet show an expandable 60-second guide before play. It covers Monopoly inspiration (with historical sources), independent status, objectives, exact score/reward formulae, payments, lockups, chance, worked examples, duet ranking and fictional HUB.

A turn now draws two distinct movement numbers. The player sees both landing types and selects one; the hidden event card is revealed only after selection. Preparing a route does not advance a month or change balances. Selection applies salary and required payments exactly once. Choices and event seed persist across reload, with no reroll or money management while a choice is pending. Existing event saves resolve normally; the next roll uses the new choices. Duet shares both rolls and event seed per month, while different routes can produce different card histories. Same route and draw history still produce equal events. Chance remains; this is not a validated skill ranking.

Checks include route persistence, invalid save rejection, single-use selection and same-choice duet fairness. No on-chain writes, wallet signatures, monetary rewards or audience changes were added.

## v14 — full progress reset

Solo and duet headers now expose “Reset all progress” / “Xóa toàn bộ tiến độ”. A separate confirmation dialog explains permanent deletion and defaults focus to Cancel. Confirming clears only the solo HUB/game bundle, legacy board save and duet profiles, then returns to the board. Fresh profiles have 80 HUB, Easy unlocked, no scores, stage/question history or active commitments. Language and unrelated storage remain. Other tabs running this version reload on a reset epoch, so stale state is discarded. A storage failure restores the original progress where storage permits and displays an error instead of claiming success. The old stage-only reset remains, labeled “New stage · keep HUB”.

## v15 — Hub-first duet and groups (2–6 seats)

The shared-device competition page now supports 2–6 persistent seat profiles. All seats select the same unlocked level and must afford its fictional stake: Easy 10, Medium 40, Hard 80 HUB. This stake replaces the normal solo commitment in multiplayer; it is not charged in addition. Hub stage settlement uses a zero commitment while retaining normal score thresholds, rewards and unlocks. Solo economics are unchanged. Existing active legacy duet saves finish with their original no-wager rules; stakes apply only to newly started matches.

`competition.mjs` first excludes any stage that failed Hub (including abandonment), regardless of score. Up to ceil(N/2) wager winners are then selected from qualifying clears by score, net worth and reserve. Unfilled slots stay empty. Hub rewards are independent: a qualifying clear outside the wager-winning seats still earns its normal stage reward while forfeiting its stake. Winners reclaim their own stakes. Losers forfeit their entire stake; half enters the device-local treasury and half is divided among wager winners by score using largest remainders. A complete tie at the winning cutoff refunds the tied seats instead of choosing an arbitrary seat. If there is no wager winner, half the losing pot enters the treasury and half carries in a separate unclaimed prize pool to the next match with winners.

The result table separates stake locked, stake returned, Hub reward, wager reward, stake lost and final balance. Treasury history records each match's contribution and carry. Settlement is persisted once and cannot be claimed twice on reload. Count changes keep inactive seat profiles in a bench rather than regranting 80 HUB. Abandoning the shared match fails unfinished seats; completed Hub clears retain rewards and eligibility. Full reset also clears treasury/bench/history. These are fictional local balances, not tokens, deposits, transferable value or blockchain treasury assets. No online rooms, wallet signatures or monetary wagering were added.

## v16 — server-backed online rooms and full wager guide

`online.html` supports 2–6 participants on separate devices. The host chooses a level/capacity, shares an eight-character room code, all seats ready, then the host starts. Clients poll room revisions; server-authoritative actions enforce membership, host privileges and turn ownership. Online profiles start with 80 fictional HUB, separate from local progress. A browser-held random seat capability is hashed into the profile ID; it is never included in URLs or room snapshots. The existing Sites access gate remains unchanged. A room invitation does not grant access to the Site itself.

Cloudflare D1 persists profiles, rooms and a unique room/round treasury ledger. Revision-checked room updates and profile/treasury writes are batched atomically, conditional on a unique operation ID. Request IDs prevent duplicate action/stake settlement; cross-room membership reservation prevents concurrent joins from locking a profile into two rooms. No client can submit a score, balance, game state or another seat's actions. TapeOut verification and gameplay reads run server-side before committing gameplay changes; failures leave the prior room revision and balances unchanged. Surrender fails only the actor's seat; disconnecting does not surrender or time out a seat. Same browser resumes a seat; account-level recovery and transferring a seat to a new browser are not implemented. This is an educational prototype, not a Sybil-resistant currency or competitive anti-cheat service.

The fully expanded wager guide is shared between online, local duet/group and the rulebook. The maximum winning-seat cap remains ceil(N/2), but the actual number K can be smaller after Hub failures/ties; prize weights always use the scores of the actual winners only. There is no payout to an empty nominal seat. The online treasury aggregates contributions across rooms; unclaimed prize carry stays in its original room. All balances remain fictional and non-redeemable. Local full reset does not delete server records.

Hosting migrates from static to an embedded-assets Worker. `node scripts/build-online.mjs` deterministically bundles the same engine modules and existing assets into `dist/server/index.js`; `d1: "DB"` provisions persistent storage. The schema-only migration is in `drizzle/0000_online_rooms.sql`. `scripts/preview-online.mjs` uses a preview-only SQLite D1 adapter; production handlers never create tables. Preview database files and generated build output are ignored. Tests exercise independent clients, permissions, idempotency, RPC-failure rollback, surrender, persistent membership and the compiled artifact.

### Online circuit snapshot rate control

Production testing observed X Layer RPC HTTP 429 after repeated verification/read requests. Online matches now pin the actual four `eth_call` receipts from a fully verified TapeOut snapshot. A valid stored snapshot can be reused for up to five minutes when starting another match; each match then retains its source block. Actions select the receipt matching the current input bits, without inventing an output or making more RPC calls. The UI and wager guide disclose snapshot use and the source block. No valid snapshot means the match cannot start. Local solo/shared-device modes retain their live reads. Tests using injected gate services still exercise fail-closed transaction behavior; production uses only the verified server-held snapshot.

### v17 multiplayer board
Online and local multiplayer share a responsive 16-space perimeter board with category strips, numbered player pawns, a central town and a separate decision panel. Other players expose only position and dice alongside phase/month; hidden decisions remain private. Game and HUB settlement rules are unchanged.

### v18 learning and HUB roadmap
Clarifies simulated HUB and a conditional future utility-token roadmap. Clear thresholds are now 60/70/75 for Easy/Medium/Hard. Bilingual post-decision lessons explain consequences, trade-offs and practical habits in solo and multiplayer; multiplayer does not reveal quiz answers early. No token sale or real-money feature is enabled.

### v20 monthly financial simulation
Each new destination draw reveals two distinct spaces in the same category, independent of player position. Scenario seeds vary by landing space; monthly asset conditions are shared. Existing holdings mark to market before living costs and installments every month, with additional Market-space shocks. Property/business cash distributions are tracked separately from valuation; purchases first update next month. Added five one-off windfalls and six named net-income jobs, bilingual monthly statements and practical lessons. No real-money or token transfers. Legacy saved routes retain their locked choices.

### v21 early opportunities, liquidity dashboard and soundtrack
New draws always offer Opportunity in month one, with regular month-one cash flows unchanged. Knowledge visits are capped at two per stage; prior-stage question memory does not consume the cap. Added an always-visible bilingual financial dashboard before gameplay with capital mix, available cash/reserve, locked capital, debt, known next-month obligations and recorded liquidity/net-worth trajectories. Decision receipts now retain financial snapshots; older progress remains compatible. An original Web Audio minor-key soundtrack is user-activated, adjustable, stoppable and pauses on hidden tabs. No audio or financial data leaves the browser for these features.

### v22 measured balance pilot
Compared v21/v22 with 24,000 offline stages each and a separate 24,000-stage holdout. See docs/balance-v22-review.md for methods, limitations, results and HUB faucet accounting. New solvent year-long stages receive exactly two question opportunities; the question bank cycles only after exhaustion. New Hard stages retain the 75 target, initial capital and volatility while reducing known cash-flow shocks; legacy active Hard stages retain original costs. Opportunity route previews disclose capital, lockup, installments and a conservative cash estimate without committing to purchase. Existing HUB reward rules are preserved.


## Decision Lab — learn from the choice, not another roll

A bilingual counterfactual learning panel now compares one changed financial decision against the same recorded event seeds. Open `/decision-lab.html` for an illustrative example, or finish a newly recorded stage. Replay does not alter HUB, scores, analytics or settlement. An optional read-only TapeOut check composes a three-condition illustrative policy from the actual mainnet NAND #48 truth table, with same-block RPC evidence export. The composition is offchain, not a newly deployed circuit or attestation of financial inputs. Old stages without traces cannot be reconstructed. See [implementation and limits](docs/decision-lab.md).

## TapeOut risk engine

Money Lab now provides shared pre-decision projections, a versioned risk policy, a downloadable **undeployed** four-REF circuit design and a testnet result evidence checker. Try `/risk-lab.html`, replay at `/decision-lab.html`, and verify a downloaded result at `/verify-result.html`. USD gameplay finances and HUB points remain separate. R/C/D checks are educational offchain composition from actual mainnet NAND reads; the existing STOP gate still binds investment actions. The ledger verifies server-attested outcomes, not trustless gameplay. [Scope, sources and trust boundaries](docs/tapeout-risk-engine.md).
