# DenGrow — Impact Policy

**Version:** 2.0 (Approved)
**Last Updated:** 2026-02-07
**Status:** ✅ Decisions Made - Ready for Implementation

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

## Decisions Made ✅

### 1. What happens after graduation? ✅ DECIDED

**Decision:** Option A (MVP) + Option C (M7)

**Implementation:**
- **MVP (Mainnet Launch):**
  - Show banner: "🎉 Your plant graduated!"
  - Button: "Mint Another Plant" (regular price)
  - Link: "Track Impact" → Impact Dashboard
  - Message: "You've graduated X trees total"

- **M7 (Future):**
  - Public leaderboard at `/leaderboard`
  - Top growers by total graduated trees
  - Optional: Achievement badge NFT

**Rationale:** Keep MVP simple (just re-mint option). Add competitive features later when there's volume.

---

### 2. Who performs redemptions? ✅ DECIDED

**Decision:** Option A - DenGrow Team (Manual Process)

**Redemption Owner:** Assigned team member with access to:
- Testnet/Mainnet deployer wallet
- Finca contact (WhatsApp/phone)
- IPFS/storage credentials
- Social media accounts

**Process:**
1. Check pool size (every Monday or bi-weekly)
2. If sufficient trees → Contact finca
3. Receive proof (photos/videos via WhatsApp)
4. Upload proof to IPFS or cloud storage
5. Execute `pnpm redeem --quantity X --proof-url "..."`
6. Post announcement on Twitter/Discord with proof link

**Timeline:**
- **Pilot (Month 1-2):** Bi-weekly redemptions (faster feedback)
- **Post-pilot (Month 3+):** Monthly redemptions (more efficient)

**Future:** Option D (Partner API integration) when volume justifies automation

---

### 3. Where are real trees planted? ✅ DECIDED

**Decision:** Local partners in Colombia (Quindío/Valle del Cauca)

**Why NOT One Tree Planted:**
- Too corporate/impersonal for MVP phase
- Slow process (email coordination, invoicing)
- Generic certificates (not our specific trees)
- Higher cost ($1 USD minimum)

**Why YES Local Colombia:**
- ✅ Authentic story ("Real trees in Colombian fincas")
- ✅ Lower cost ($2 USD negotiated vs $5 original)
- ✅ Direct relationship (WhatsApp, not corporate emails)
- ✅ Visitability (team can physically verify)
- ✅ Photo/video proof more personal
- ✅ Supports local farmers/communities

**Partner Options (Priority Order):**
1. **Jardín Botánico del Quindío** (Recommended for MVP)
   - Contact: 3153349307
   - Email: investigaciones@jardinbotanicoquindio.org
   - Region: 15 fincas in 6 municipalities
   - Species: Native (yarumo, guadua, nogal cafetero, etc.)

2. **Red de Guardianes de Semillas (RGSV)**
   - Website: https://www.colombia-redsemillas.org/
   - Region: Valle del Cauca, Cauca
   - Model: Grassroots farmer network

3. **Direct Finca Partnership**
   - Through personal network/contacts
   - Most flexible but requires more coordination

**Next Action:** Call Jardín Botánico this week to negotiate partnership

**Future:** Scale to other regions in Colombia, then potentially international with One Tree Planted

---

### 4. When do redemptions happen? ✅ DECIDED

**Decision:** Flexible schedule based on pilot phase

**Phase 1: Pilot (Month 1-2)**
- **Frequency:** Bi-weekly (every 2 weeks)
- **Minimum Batch:** 1+ trees (flexible, redeem what's available)
- **Day:** First and third Monday of month @ 10:00 AM COT
- **Rationale:** Fast iteration, validate process, show quick impact

**Phase 2: Post-Pilot (Month 3+)**
- **Frequency:** Monthly
- **Minimum Batch:** 5-10 trees
- **Day:** First Monday of month @ 10:00 AM COT
- **Rationale:** More efficient, less operational overhead

**Exception Rules:**
- If pool reaches 50+ trees: Redeem immediately (don't wait)
- If pool < 5 after 2 months: Redeem anyway (don't leave users waiting)

**Communication Timeline:**
- **Thursday before:** "Batch closing Friday 11:59 PM"
- **Monday morning:** "Redemption in progress..."
- **Monday evening:** "✅ X trees redeemed! Proof: [link]"

---

### 5. How do users verify impact? ✅ DECIDED

**Decision:** On-chain proof + Public dashboard (MVP)

**MVP Implementation:**
```
1. User checks Impact Dashboard (/impact)
2. Sees:
   - Total trees graduated
   - Total trees redeemed
   - Current pool size
   - Redemption history (batches)
3. Clicks batch → sees:
   - Proof URL (IPFS or cloud storage)
   - Timestamp
   - Quantity of trees
   - On-chain transaction hash
4. Proof document includes:
   - Photos from finca
   - GPS coordinates (if available)
   - Species planted
   - Farmer/contact info
   - Date planted
```

**What's NOT in MVP (Future/M7):**
- Individual token tracking ("Was MY tree #123 in batch #5?")
  - Requires contract modification (token→batch mapping)
- User notifications (email/push when redeemed)
  - Requires notification system
- Video proof (Treegens-style)
  - Nice-to-have, not critical

**Proof Storage:**
- **Pilot:** Google Drive/Dropbox (simple, fast)
- **Production:** IPFS (decentralized, permanent)

**Transparency:**
- All batch records public on-chain
- Proof URLs accessible to anyone
- Explorer links for verification

---

### 6. What does the user "win"? ✅ DECIDED

**Decision:** Real impact, not financial rewards

**Value Proposition:**
- ✅ **Satisfaction:** "You planted a real tree in Colombia"
- ✅ **Proof:** Verifiable on-chain + photos from finca
- ✅ **NFT:** Your plant NFT with unique traits (collectible)
- ✅ **Impact tracking:** "You've graduated X trees"
- 🔜 **Leaderboard:** Public recognition (M7)
- 🔜 **Badge NFT:** Achievement milestones (M7)

**Key Messaging:**
```
"DenGrow is not about earning money or airdrops.
 It's about patience, consistency, and real-world impact.
 Your reward is making a tangible difference."
```

**Differentiation from other NFT games:**
- NOT: "Play to earn tokens"
- YES: "Play to plant real trees"
- NOT: "Flip for profit"
- YES: "Collect meaningful art with purpose"

**User Communication:**
- At graduation: "Your tree helped plant a real tree in Colombia"
- At redemption: "Your tree was redeemed! [View proof]"
- Re-engagement: "Plant another tree? [Mint again]"

---

## Transparency Commitments

1. **All redemptions recorded on-chain** with proof hashes
2. **Proof documents publicly accessible** via URLs
3. **No false promises** - we redeem based on actual capacity
4. **Pool stats always visible** on Impact Dashboard
5. **Batch history queryable** by anyone

---

## Economic Model ✅ UPDATED

### Cost Structure

```
Cost per tree: $2.00 USD
├─ Seedling/seeds:     $0.50
├─ Labor (planting):   $1.00
├─ Documentation:      $0.30
└─ Coordination:       $0.20
```

**Partner:** Local finca in Quindío/Valle (negotiated from $5 → $2)

### Revenue Model

**Target:** $2+ per user to cover tree cost

**Revenue Streams:**
1. **Mint tiers** (75% of revenue)
   - Basic: 1 STX (~$1) - 60% of users
   - Premium: 2 STX (~$2) - 30% of users
   - Impact: 3 STX (~$3) - 10% of users
   - Weighted average: $1.50/user

2. **Water tips** (10% of revenue)
   - Optional "Water + Plant" (+0.1 STX per water)
   - 25% opt-in rate
   - Average: $0.20/user

3. **Graduation add-ons** (7.5% of revenue)
   - Optional donations
   - Premium features
   - Average: $0.15/user

4. **Re-mints** (5% of revenue)
   - 20% of users mint again
   - Discounted price: 0.5 STX
   - Average: $0.10/user

**Total Revenue:** $1.95-$2.00/user ✅ Covers tree cost

### Sustainability

**Break-even:** 50-100 users/month
**Profitable:** 200+ users/month ($200+/month profit)

**Pilot funding:** $30-50 USD bootstrap (covers first 15-25 trees)

**See:** `docs/ECONOMIC_MODEL.md` for complete analysis

---

## Action Items

### ✅ Decisions Made (2026-02-07)

- [x] **Decide on partnership** → Local finca in Colombia (Jardín Botánico Quindío)
- [x] **Set redemption schedule** → Bi-weekly (pilot), Monthly (post-pilot)
- [x] **Define minimum batch size** → Flexible 1+ trees (pilot), 5-10 (production)
- [x] **Economic model** → $2 revenue/user covers $2 tree cost
- [x] **Post-graduation UX** → "Mint Another Plant" button + Impact tracking
- [x] **Verification method** → On-chain proof + photo documentation

### 🔄 Implementation Tasks (Before Mainnet)

- [ ] **Contact Jardín Botánico** (Call: 3153349307)
  - Negotiate $2/tree pricing
  - Confirm photo/documentation process
  - Set up communication channel (WhatsApp)

- [ ] **Test redemption flow on testnet** (See TESTNET_REDEMPTION_GUIDE.md)
  - Graduate test plants
  - Execute redemption script
  - Verify on-chain recording
  - Test UI display

- [ ] **Implement pricing UI**
  - 3-tier mint pricing ($1/$2/$3)
  - Water tip feature ("Water + Plant")
  - Graduation donation flow

- [ ] **Bootstrap funding**
  - Allocate $30-50 USD for first month
  - Set up payment method for finca

- [ ] **Create comms templates**
  - Twitter announcement template
  - Proof document format
  - User FAQ responses

- [ ] **Assign redemption owner**
  - Who executes redemptions
  - Backup person
  - Process documentation

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
| 2.0 | 2026-02-07 | All 6 decisions made, economic model finalized |

---

## Next Steps

1. **Test redemption flow on testnet** → See `TESTNET_REDEMPTION_GUIDE.md`
2. **Contact Jardín Botánico Quindío** → Schedule call this week
3. **Implement pricing UI** → See `ECONOMIC_MODEL.md` and `UI_MOCKUPS.md`
4. **Launch mainnet** → Once testnet flow validated

---

*This document reflects approved decisions. Implementation tasks are tracked in Action Items section above.*
