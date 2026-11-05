# Money Lab investment worlds — first playable version

World 1 keeps the existing personal-finance game. The header now includes World 1, 2 and 3 navigation.

World 2 uses 25 spaces in a 5×5 tourism district, 3–6 players, and strictly more than 1,000 accumulated server HUB (integer threshold 1,001). World 3 uses 36 spaces in a 6×6 map, 4–6 players, at least 10,000 server HUB, and five times the simulated USD scale. All players must meet the threshold; the API checks it on creation, join, readiness and start. Shared wallet accounts use the same authoritative HUB profile as World 1 Solo/Online. Browser-local guest Solo balances do not migrate or bypass server checks.

Entry currently checks eligibility only. It does not spend, lock, transfer or reward HUB. Real token purchases/trading, World 2/3 wagers and HUB reward amounts are not defined or implemented. Visitors may inspect maps and a three-stage project walkthrough without joining a match. No demo funds are awarded to production accounts.

Fixed-zoning projects include resort, hotel, homestay, farmstay, dorm, restaurant, café, convenience store, supermarket, hair salon, spa, bakery, bicycle rental, seafood restaurant, gift shop and campsite. Land purchase requires planning liquidity equal to land plus the first construction tranche; it deducts land cost only. Three separate landings on one's own plot purchase the land, fund 60% of construction, then fund the remaining 40% and open. No operating revenue is received before completion. The next owner month starts revenue and operating expense. Visitor service fees apply only to completed opponent-owned projects and transfer only actual paid funds.

Each investor retains regular salary, living costs, debt installment and reserves. The initial stage lengths are 36 owner months (World 2) and 48 (World 3). A turn lasts at most 60 seconds. Timeout auto-rolls if necessary and declines voluntary opportunities/support while mandatory obligations, repairs and tourism seasons persist. Synchronization catches up expired turns, bounded by the finite stage. Solvency first, then contributed-cost net worth determine the final ranking. The initial version has no new loans, sales, auctions, transfers or market valuation. These remain extension points.

Cross-device rooms use the existing identity/profile system, a separate D1 estate room table and revision-guarded writes. Membership prevents simultaneous entry in World 1/2/3. Room codes, ready/start, resign, reopen and leave are supported. State and results are server-managed, not onchain. Seed and private identity IDs are omitted from public room snapshots.

The optional TapeOut comparison reads the activated REF circuit and applies its native R/C/D result to illustrative financial signals computed by Money Lab. This is not a proof of all World 2/3 gameplay or real-world input accuracy. No blockchain transaction is created by estate play. Existing account journal deletion/anonymization also handles the new rooms while retaining opponents' economic outcomes.

Validation covers map sizes/zoning, player/HUB thresholds, forged eligibility, three landing stages, monthly operations, timeout catch-up, room authority, duplicate/concurrent writes, no HUB charges, conserved visitor fees, privacy scrubbing, and World 1 regression checks.
