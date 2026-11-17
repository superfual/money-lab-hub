# Manual acceptance and scrolling review — 17 November 2026

## User-supplied acceptance evidence

The founder supplied three decision-policy exports and one Duet settlement screenshot during testing. These are manual acceptance observations, not an independently reproduced full game or a device attestation.

| Session | Actual summary | Replay summary | Scope |
| --- | --- | --- | --- |
| Desktop guest | Month 12, score 85, net worth 14,964.87, liquid 10,162.69, reserve 2,400 | Month 12, score 81, reserve 1,900 | Previously reviewed export; no full state/action trace |
| Phone guest | Month 12, score 94, net worth 16,876.62, liquid 14,650, reserve 3,500 | Month 12, score 90, reserve 3,000 | Founder-reported physical phone; audio later confirmed working |
| Two-device guest Duet | Month 12, score 94, net worth 15,236.63, liquid 11,785.86, reserve 3,500 | Month 12, score 90, reserve 3,000 | Export matches one player's screenshot score; two devices reported by founder |

All three actual summaries record zero shortfall and zero forced sales. Replay reduces the initial reserve transfer by 500; these examples retain equal net worth and liquid assets while reserve and score differ.

The Duet screenshot shows both players at month 12, scores 94 and 83, final balances 109 and 90 HUB. The winner receives its 10 HUB stake back, 24 HUB stage reward and 5 HUB wager reward. The other player receives 20 HUB stage reward and forfeits its 10 HUB stake. The remaining 5 HUB goes to the treasury. This is fictional room accounting, not a mainnet settlement.

The Duet export includes NAND #48 and REF #49 receipts at block 76,092,411 and the original choice snapshot at 76,091,962. Its two branch compositions are internally consistent with the exported truth tables. The historical RPC recheck timed out during that review; do not label those reads independently reverified. The export lacks room members, device identities and the complete game trace. The screenshot plus founder report supplements it but does not provide cryptographic proof of cross-device play.

## Decision-panel scrolling correction

After a successful user roll or choice, the next rendered decision panel resets its internal scroll and is brought into view. When the next-roll button is available after completing a month, the button itself is centered and focused, rather than merely revealing the top of a potentially long result panel. The heading receives focus without another scroll. Local handoff dialogs take priority. Ordinary room polling and automatic timeouts do not request this scrolling. A new transition back to the local player's online turn reveals that player's decision once.

Implemented in guest Solo, wallet Solo, local Duet/Group, online rooms, and the shared founder/public-mainnet client. No wallet transaction was sent during this review.

Validation: 213 existing automated tests passed, zero failed; build and JavaScript syntax checks passed. Interactive browser checks confirmed the guest Solo route and event panel at viewport top with internal scroll zero, including a 390 px wide responsive frame. This frame checks responsive layout, not an actual iOS/Android browser. Local Duet roll/handoff checks are recorded in the release review. Wallet/mainnet gameplay was not exercised with a signed transaction.

## Remaining before submission

- Confirm the newly published scrolling on a physical phone.
- Complete independent-verifier round-trip with a suitable full-trace export.
- Check wallet multiplayer, cross-round progression, reconnect and timeout acceptance cases separately.
- Supply the final demo video URL and complete the competition form; this review does not submit a form.

Follow-up next-month regression: browser checks completed an opportunity by passing on desktop and applied a market event at 390 px width. In both cases the next-roll button was focused and fully visible near the viewport center without manual scrolling. All 213 automated tests still pass.
