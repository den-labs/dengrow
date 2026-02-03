# DenGrow — Task Backlog

## Milestone 0 — Monorepo Setup

- [x] Create pnpm-workspace.yaml
- [x] Move front-end → apps/web
- [x] Move clarity → packages/contracts
- [x] Remove package-lock.json
- [x] Update root scripts

DoD:

- pnpm workspace commands work.

---

## Milestone 1 — Contracts v0

- [ ] Implement plant-nft.clar (SIP-009)
- [ ] Implement plant-game.clar
- [ ] Add water() with cooldown
- [ ] Add get-plant() read-only
- [ ] Write Clarinet tests

DoD:

- Tests pass and state updates correctly.

---

## Milestone 2 — Web MVP

- [ ] Wallet connect
- [ ] Mint UI
- [ ] My Plants page
- [ ] Plant detail page
- [ ] Call water() from UI

DoD:

- User can mint and water plants.

---

## Milestone 3 — Traits & Metadata

- [ ] Assign traits at mint
- [ ] Metadata API endpoint
- [ ] Attributes rendered in UI

DoD:

- Metadata validates on NFT viewers.

---

## Milestone 4 — Impact Registry

- [ ] tree-graduated event
- [ ] impact-registry contract
- [ ] record-redemption function
- [ ] Impact dashboard UI

DoD:

- Weekly batch can be recorded and displayed.
