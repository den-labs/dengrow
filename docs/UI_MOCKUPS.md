# DenGrow UI Mockups - Impact Flow

**Created:** 2026-02-06
**Purpose:** Visual reference for implementing impact policy UX

---

## 1. Plant Detail Page (After Graduation)

### Current State (Before Implementation)
```
┌──────────────────────────────────────────────────┐
│  My Plant #123                          [< Back] │
├──────────────────────────────────────────────────┤
│                                                  │
│              🌳                                  │
│         [Tree Image]                             │
│                                                  │
│  Stage: Tree                                     │
│  Growth: 7/7 ✓                                   │
│  Last Watered: 2 days ago                        │
│                                                  │
│  Traits:                                         │
│  • Pot: Terracotta (Common)                      │
│  • Species: Sunflower (Uncommon)                 │
│                                                  │
│  [Water Button - Disabled]                       │
│  "This plant is fully grown"                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Proposed State (After Implementation)
```
┌──────────────────────────────────────────────────┐
│  My Plant #123                          [< Back] │
├──────────────────────────────────────────────────┤
│                                                  │
│              🌳                                  │
│         [Tree Image]                             │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  🎉 Your plant graduated!                  │ │
│  │                                            │ │
│  │  This tree is now in the Impact Pool      │ │
│  │  and will be converted into a real tree.  │ │
│  │                                            │ │
│  │  Next redemption: Monday, Feb 12           │ │
│  │  Current pool: 8/10 trees                  │ │
│  │                                            │ │
│  │  [Track Impact →]  [Mint Another Plant]   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Stage: Tree (Graduated)                         │
│  Graduated: Jan 30, 2026                         │
│                                                  │
│  Status: ⏳ Waiting for batch redemption         │
│                                                  │
│  Traits:                                         │
│  • Pot: Terracotta (Common)                      │
│  • Species: Sunflower (Uncommon)                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 2. Impact Dashboard (Before Redemption)

```
┌────────────────────────────────────────────────────────┐
│  Impact Dashboard                                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🌍 Total Impact                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │  42 Trees Graduated                              │ │
│  │  30 Trees Redeemed                               │ │
│  │  12 Trees Waiting                                │ │
│  │                                                  │ │
│  │  [████████████░░░░] 71% redeemed                │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ⏰ Next Redemption                                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Monday, February 12 @ 10:00 AM UTC              │ │
│  │                                                  │ │
│  │  Batch will include: 10-12 trees                 │ │
│  │  Estimated processing: 2-3 days                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📋 Redemption History                                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Batch #2 - Feb 5, 2026                          │ │
│  │  ✅ 20 trees redeemed                             │ │
│  │  🌱 One Tree Planted - Global Reforestation      │ │
│  │  [View Proof →]                                  │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  Batch #1 - Jan 29, 2026                         │ │
│  │  ✅ 10 trees redeemed                             │ │
│  │  🌱 One Tree Planted - Amazon Rainforest         │ │
│  │  [View Proof →]                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ℹ️ How It Works                                       │
│  [Expandable section explaining the process]          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Impact Dashboard (After Redemption)

```
┌────────────────────────────────────────────────────────┐
│  Impact Dashboard                                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🎉 NEW BATCH REDEEMED!                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │  Batch #3 - February 12, 2026                    │ │
│  │  ✅ 12 trees successfully redeemed                │ │
│  │                                                  │ │
│  │  Partner: One Tree Planted                       │ │
│  │  Project: Kenya Reforestation Initiative         │ │
│  │                                                  │ │
│  │  [View Certificate →]  [Share on Twitter]       │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  🌍 Total Impact                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │  54 Trees Graduated    ↑ 12                      │ │
│  │  42 Trees Redeemed     ↑ 12                      │ │
│  │  12 Trees Waiting      → 0                       │ │
│  │                                                  │ │
│  │  [████████████████░░] 78% redeemed               │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📋 Redemption History                                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Batch #3 - Feb 12, 2026              🆕         │ │
│  │  ✅ 12 trees redeemed                             │ │
│  │  🌱 One Tree Planted - Kenya                     │ │
│  │  [View Proof →]                                  │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  Batch #2 - Feb 5, 2026                          │ │
│  │  ✅ 20 trees redeemed                             │ │
│  │  🌱 One Tree Planted - Global                    │ │
│  │  [View Proof →]                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 4. Proof Page (Certificate Detail)

```
┌────────────────────────────────────────────────────────┐
│  Redemption Proof - Batch #3                 [← Back]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🌱 12 Trees Planted                                   │
│  February 12, 2026                                     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │  [Certificate Image/PDF Preview]                 │ │
│  │                                                  │ │
│  │  ONE TREE PLANTED                                │ │
│  │  Certificate of Impact                           │ │
│  │                                                  │ │
│  │  Project: Kenya Reforestation Initiative         │ │
│  │  Location: Kakamega Forest, Kenya                │ │
│  │  GPS: -0.2841, 34.7519                           │ │
│  │                                                  │ │
│  │  Species: Native Mix (Acacia, Melia, etc)        │ │
│  │  Planting Date: February 10, 2026                │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📸 Photos                                             │
│  ┌─────────┬─────────┬─────────┐                     │
│  │ [Img 1] │ [Img 2] │ [Img 3] │                     │
│  │ Planting│ Site    │ Seedling│                     │
│  └─────────┴─────────┴─────────┘                     │
│                                                        │
│  🔗 On-Chain Verification                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Transaction ID:                                 │ │
│  │  0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t      │ │
│  │                                                  │ │
│  │  Block Height: 123456                            │ │
│  │  Timestamp: Feb 12, 2026 10:23:14 UTC            │ │
│  │                                                  │ │
│  │  Proof Hash:                                     │ │
│  │  QmXoYpzfZfF9qCxHjTGVwW4xJDpF3rMnLkSe2gT8vB     │ │
│  │                                                  │ │
│  │  [View on Explorer →]                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Download PDF]  [Share Proof]                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 5. My Plants Page (Overview with Status)

```
┌────────────────────────────────────────────────────────┐
│  My Plants                                   [+ Mint]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Your Impact: 3 trees graduated, 2 redeemed            │
│                                                        │
│  ┌──────────────┬──────────────┬──────────────┐       │
│  │  Plant #123  │  Plant #124  │  Plant #125  │       │
│  │              │              │              │       │
│  │     🌳       │     🌸       │     🌱       │       │
│  │              │              │              │       │
│  │  Tree        │  Bloom       │  Seed        │       │
│  │  ✅ Redeemed │  Growing...  │  Just Minted │       │
│  │              │  6/7 waters  │  0/7 waters  │       │
│  │              │              │              │       │
│  │  [View] →    │  [Water] →   │  [Water] →   │       │
│  └──────────────┴──────────────┴──────────────┘       │
│                                                        │
│  🎉 Achievement: Tree Planter (2 trees redeemed)       │
│  🏆 Next milestone: 5 trees                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 6. Notification Examples (Future Enhancement)

### Email Notification
```
Subject: 🌳 Your DenGrow tree was redeemed!

Hi there,

Great news! Your plant #123 was included in this week's
redemption batch.

12 real trees were planted in Kenya through our partnership
with One Tree Planted.

View proof: https://dengrow.vercel.app/impact/batch/3

Ready to grow another tree? Mint a new plant:
https://dengrow.vercel.app

Keep growing,
The DenGrow Team 🌱
```

### In-App Notification (Toast)
```
┌─────────────────────────────────────────┐
│  🎉 Your tree was redeemed!             │
│                                         │
│  Plant #123 → Real tree in Kenya        │
│                                         │
│  [View Proof]              [Dismiss]    │
└─────────────────────────────────────────┘
```

---

## Component Hierarchy

### New Components Needed

```
components/
├── impact/
│   ├── GraduationBanner.tsx      // Shows on plant detail after Tree
│   ├── ImpactStats.tsx            // Total/redeemed/waiting numbers
│   ├── NextRedemption.tsx         // Countdown to Monday
│   ├── RedemptionHistory.tsx      // List of past batches
│   ├── ProofViewer.tsx            // Certificate display
│   └── RedemptionStatus.tsx       // Per-plant status badge
│
└── notifications/
    └── RedemptionToast.tsx        // In-app notification
```

### Modified Components

```
apps/web/src/app/my-plants/[tokenId]/page.tsx
- Add <GraduationBanner /> after stage === STAGE_TREE check

apps/web/src/app/impact/page.tsx
- Add <NextRedemption />
- Enhance <RedemptionHistory />

apps/web/src/app/my-plants/page.tsx
- Add <RedemptionStatus /> badge on graduated plants
```

---

## Design Tokens

### Colors
```css
--impact-green: #10b981;      /* Success/redeemed */
--impact-orange: #f59e0b;     /* Waiting/pending */
--impact-blue: #3b82f6;       /* Info/upcoming */
--impact-gray: #6b7280;       /* Neutral */
```

### Icons
- 🌳 Tree/graduated
- ⏳ Waiting
- ✅ Redeemed
- 🌱 Partner logo
- 📋 History
- 🎉 Celebration

---

## Implementation Priority

### Phase 1 (MVP - Must Have)
1. ✅ GraduationBanner on plant detail
2. ✅ "Mint Another Plant" button
3. ✅ NextRedemption countdown on impact dashboard
4. ✅ RedemptionHistory with proof links

### Phase 2 (Post-Launch)
5. ProofViewer full page with certificate
6. RedemptionStatus badges on My Plants
7. Enhanced stats with user-specific numbers

### Phase 3 (Future)
8. Email notifications
9. In-app toast notifications
10. Leaderboard integration

---

**Total Estimated Development Time:**
- Phase 1: 6-8 hours (1 dev day)
- Phase 2: 4-6 hours (half dev day)
- Phase 3: 8-12 hours (1-1.5 dev days)

**Total: 2-3 dev days for complete implementation**
