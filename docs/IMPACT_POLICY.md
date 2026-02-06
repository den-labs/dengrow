# DenGrow — Impact Policy

**Version:** 1.0 (Draft)
**Last Updated:** 2026-02-06
**Status:** Needs Team Decision

---

## Purpose

This document clarifies HOW DenGrow converts virtual trees into real-world impact. It answers the questions users naturally ask after their plant graduates.

---

## The User Journey

```
1. MINT      → User gets a unique Plant NFT
2. GROW      → Daily watering for 28 days (7 per stage × 4 stages)
3. GRADUATE  → Plant becomes Tree, enters Impact Pool
4. WAIT      → Tree awaits batch redemption
5. REDEEM    → Admin converts batch to real-world impact
6. VERIFY    → User can verify proof on-chain
7. ???       → What's next for the user?
```

---

## Open Questions (Need Team Decision)

### 1. What happens after graduation?

**Current state:** Nothing. The game effectively ends.

**Options to consider:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Mint again | User can mint a new plant | Simple, extends engagement | No special reward for completing |
| B. Achievement NFT | User receives a "Tree Planter" badge | Recognition, collectible | Extra complexity |
| C. Leaderboard | User appears on public leaderboard | Social proof, competition | Needs new feature |
| D. Discount/Benefit | Free mint for next plant | Reward for completion | Economic implications |

**Recommended:** Option A + C (Mint again + Leaderboard in M7)

---

### 2. Who performs redemptions?

**Current state:** "Admin" - undefined.

**Options:**

| Option | Description | Trust Model |
|--------|-------------|-------------|
| A. DenGrow Team | Core team manually records batches | Centralized, requires trust |
| B. DAO | Token holders vote on redemptions | Decentralized, complex |
| C. Automated Oracle | External service triggers redemptions | Technical complexity |
| D. Partner Integration | Tree-planting org has direct access | Requires partnership |

**Recommended for MVP:** Option A (DenGrow Team)

**Future:** Option D with verified partners

---

### 3. Where are real trees planted?

**Current state:** Not specified.

**Options for partnerships:**

| Organization | Region | Cost per Tree | Verification |
|--------------|--------|---------------|--------------|
| One Tree Planted | Global | ~$1 USD | Certificate + GPS |
| Ecosia | Global | Varies | Quarterly reports |
| Trees for the Future | Africa | ~$0.25 USD | Impact reports |
| Local partners | TBD | TBD | Direct verification |

**Recommended:** Start with One Tree Planted (established, verifiable)

---

### 4. When do redemptions happen?

**Current state:** "Weekly" - no specific schedule.

**Proposed schedule:**

- **Redemption Day:** Every Monday
- **Minimum Batch Size:** 10 trees (to justify partnership transaction costs)
- **Maximum Wait:** If pool < 10 for 4 weeks, redeem anyway
- **Announcement:** Post on social media before redemption

---

### 5. How do users verify impact?

**Current state:** Proof hash + URL stored on-chain.

**Verification flow:**

```
1. User checks Impact Dashboard
2. Sees "X trees redeemed in Y batches"
3. Clicks batch → sees proof URL
4. Proof URL leads to:
   - Partner receipt/certificate
   - GPS coordinates (if available)
   - Photos (if available)
```

**What's missing:**
- Individual token tracking ("Was MY tree #123 in batch #5?")
- Direct notification to user when their tree is redeemed

---

### 6. What does the user "win"?

**Current state:** Nothing tangible.

**Proposed value proposition:**

| What User Gets | Type | Implementation |
|----------------|------|----------------|
| Satisfaction | Emotional | Messaging, proof |
| Verifiable proof | On-chain | Already exists |
| Social recognition | Social | Leaderboard (M7) |
| Achievement badge | NFT | Optional (M7) |
| Real-world impact | Physical | Tree planting |

**Key message:** "You didn't win a prize. You made real impact. Here's the proof."

---

## Transparency Commitments

1. **All redemptions recorded on-chain** with proof hashes
2. **Proof documents publicly accessible** via URLs
3. **No false promises** - we redeem based on actual capacity
4. **Pool stats always visible** on Impact Dashboard
5. **Batch history queryable** by anyone

---

## Economic Model

### MVP (Current)

- **Funding source:** Project treasury / grants
- **Cost per tree:** ~$1 USD (via partner)
- **Revenue:** None (free to play, only gas fees)

### Future Considerations

- Optional donations at mint
- Sponsored batches (partners pay for redemptions)
- Premium traits that fund trees

---

## Action Items

Before mainnet launch, the team needs to:

- [ ] **Decide on partnership** (One Tree Planted recommended)
- [ ] **Set redemption schedule** (Every Monday proposed)
- [ ] **Define minimum batch size** (10 trees proposed)
- [ ] **Create comms plan** (How to announce redemptions)
- [ ] **Design "What's Next" UX** (After graduation)
- [ ] **Fund initial redemptions** (Treasury allocation)

---

## User-Facing FAQ

### "My plant graduated. Now what?"

Your tree is now in the Impact Pool! It will be included in our next batch redemption, where we convert virtual trees into real trees through our partner organization. You can track progress on the Impact Dashboard.

### "When will my tree be redeemed?"

We process redemptions weekly (every Monday) when the pool reaches our minimum batch size. Check the Impact Dashboard to see current pool status.

### "How do I know a real tree was planted?"

Every redemption batch is recorded on-chain with a proof hash and URL. The proof links to our partner's certificate, which may include GPS coordinates and photos of the planting site.

### "Do I get anything for completing the game?"

You get the satisfaction of contributing to real-world impact, plus verifiable on-chain proof that your virtual tree became a real tree. In the future, we plan to add leaderboards and achievement badges.

### "Can I play again?"

Yes! You can mint a new plant anytime and grow another tree. Each tree you graduate adds to the Impact Pool.

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-06 | Initial draft with open questions |

---

*This document is a living draft. Decisions marked as "TBD" require team alignment before mainnet launch.*
