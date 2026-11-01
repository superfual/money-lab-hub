# Money Lab — analytics in chat

The owner can ask ChatGPT: “Show Money Lab statistics for the last 7 days”, “Compare stage starts and endings by difficulty”, “Show server-confirmed wins and scores”, or “Exclude QA and chart repeat play”. Use live aggregate records rather than counting raw browser profiles as people.

## Retrieval workflow

1. Resolve the existing Money Lab Site from `.openai/hosting.json` or Sites metadata; preserve its project ID and public audience. Use the owner/editor Sites connection. No new admin secret or public report page is needed.
2. Refresh the report cache with a same-origin POST to the existing deployed Site's `/api/analytics/refresh` endpoint. Set `Origin` to the Site's origin. It returns only `{ok:true}`, never report values. It is throttled to a cache age of at least 60 seconds and creates no page-view or play event. Do not create a fake visitor or fake game to refresh statistics.
3. Call Sites `read_database_overview`, then use the exact returned binding/table names to read `moneylab_analytics_daily` and `moneylab_analytics_snapshot`. Follow only `model_projection.next_offset` until null. Check truncation/omitted columns. These tables contain flat aggregate rows, not raw history JSON. Never read wallet sessions or challenges for reporting.
4. Feed `{daily:[...rows],snapshot:[...rows]}` into `node scripts/analytics-report.mjs --days=7`. Include all pages. `--include-test` is explicit; default reports exclude cohort `test`.
5. Present the observed period, recording start, source and freshness. Use an inline chart for daily trends or per-level comparisons. Use actual numbers from the report; missing dates before instrumentation are unknown, not zero.

The supported date-window helper accepts 1–90 days. It does not query the live database itself or embed credentials. It turns aggregate rows retrieved through the authorized Sites connection into a reproducible chart-ready report.

## Metric definitions

| Metric | Meaning |
|---|---|
| page_view, client | First-party browser page-open event, distinct from Sites' own visitor analytics; not an SDK-detected unique person |
| stage_started | A new stage accepted by the server, or explicitly client-reported for guest/local play |
| stage_finished | A stage ended in a result, including early liquidity failure; not necessarily a full 12 months |
| stage_survived | A finished stage completed 12 months with no unpaid required costs |
| stage_won | A stage also cleared its difficulty's score threshold |
| stage_abandoned | Explicitly abandoned stage/surrender, separate from finished results; disconnecting is not abandonment |
| score | Count and sum of final scores; average = sum_value / count; separate verified server and unverified client data |
| active_profiles | Deduplicated pseudonymous identities per Vietnam day/mode/source; mode `all` deduplicates server modes |
| active_7d_… snapshot | Distinct retained profile identifiers across the last 7 Vietnam calendar dates, not the sum of daily active counts |
| returning_play_7d_… | Profiles starting stages on at least two different Vietnam dates within 7 days; not a validated retention percentage |
| room_created / match_started / match_settled | Room creation and online match lifecycle; one match is not one player stage |
| …_retained snapshot | Current totals derivable from existing server profiles; includes legacy/test activity, can decrease after deletion, and is not a dated event history |

`count` is the number of observations, `sum_value` is the numeric sum (scores in the score metric). Winning rate = server stage_won / server stage_finished within the chosen period; no denominator means unavailable. Starts and endings in a window may belong to different cohorts, so do not label their ratio as a conversion/retention rate.

## Coverage and QA

- Dated measurements begin at `recording_started`. Older guest and same-device-only history cannot be reconstructed. Do not backdate it.
- Cohort `unclassified` is not “real users verified”. It may contain the owner's play, untagged tests or automation. One person may use several browsers/wallets; browser and wallet populations overlap.
- Add `?ml_test=1` when doing QA; the browser persists the test flag and sends `X-MoneyLab-Analytics-Test: 1`. Clear it with `?ml_test=0`. Tagging is a reporting aid, not an authentication or anti-bot mechanism. Server API smoke tests must send that header. Existing legacy records are not silently classified as production.
- Server-confirmed outcomes and client-reported guest/local events are separate. Client counters are spoofable, may be opted out and can be lost on network failures. They are not proof of adoption.
- A stage already underway before measurement may end without a recorded start. Historical profile snapshots still include prior QA. Report both limitations.
- Free-stage retries are real stage attempts, not necessarily distinct players. Stage results do not demonstrate validated learning improvement.

## Privacy and access

No aggregate-report read endpoint is exposed to the public. The owner/editor reads the aggregate tables through Sites. Ingestion and cache-refresh routes return only acknowledgement/errors. No dashboard is added to the public game.

Event details use a SHA-256 pseudonym, category, level, Vietnam date and server time; no wallet addresses, names, emails, URL query strings or device fingerprints are included in those event rows or reports. Host infrastructure may separately keep operational request logs; do not claim that no infrastructure logs exist.

Raw pseudonymous events are pruned to 90 days during snapshot refresh. Daily non-identifying rollups remain. Clearing account history/deleting an account removes account-linked event detail; prior aggregate totals remain. Browser statistics can be disabled in the visible privacy notice, which removes event detail linked to that browser identifier. Server progress/settlement still works. When no request invokes maintenance, expired detail may remain until the next refresh; do not promise timed deletion by a background scheduler that has not been installed.

Metrics are best effort and isolated from the gameplay transaction. Errors must not change a decision, score, HUB balance or completed settlement. A crash between a game commit and metrics writing can cause a missing measurement; this is product analytics, not an audited ledger.

## Suggested chat outputs

- Daily line chart: server starts/endings and client starts/endings shown separately.
- Difficulty bar chart: server-confirmed stage endings and wins for Easy/Medium/Hard.
- Score table: count, average score and win rate per level, with small-sample caveats.
- Current-storage bar chart: retained profiles/wallet accounts/rooms, explicitly including legacy/test data; never label these bars as unique real players.

Do not publish individual wallet addresses, display names, room invitation codes or session data in reports. Never reuse a chart with old numbers as if it were a fresh retrieval.
