# DenGrow Testnet Deployment

**Date**: 2026-02-04
**Network**: Stacks Testnet
**Status**: ✅ Successfully Deployed (Clarity 2)

---

## Deployed Contracts

### Deployer Address
```
ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ
```

**Explorer**: https://explorer.hiro.so/address/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ?chain=testnet

---

## Contract Addresses

Once confirmed, contracts will be available at:

| Contract | Clarity | Address | Transaction ID | Status |
|----------|---------|---------|----------------|--------|
| **nft-trait** | 1 | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.nft-trait` | [`959410b2...3ad2c`](https://explorer.hiro.so/txid/959410b24db5619a0249c8721f56fea9fa28e2655f3ec91ab581603cb943ad2c?chain=testnet) | ✅ Confirmed |
| **sip-010-trait-ft-standard** | 1 | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.sip-010-trait-ft-standard` | [`78ac8f8d...9dbb7`](https://explorer.hiro.so/txid/78ac8f8d6e9d3b2759c67d36fc6065cfa5d219a6ccf32eada6724e0e1e79dbb7?chain=testnet) | ✅ Confirmed |
| **plant-game** | **2** | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game` | [`0421847...1acd`](https://explorer.hiro.so/txid/0x0421847934a956d17da561f0fcb774e711c348dc142fc192a1d969e04af91acd?chain=testnet) | ✅ **Deployed** |
| **plant-nft** | **2** | `ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft` | [`a2f57bd...b0f1`](https://explorer.hiro.so/txid/0xa2f57bdfb6a4e5c254833c4768410c9b87c96df2497dedf3ab95e614c093b0f1?chain=testnet) | ✅ **Deployed** |

---

## Deployment Configuration

- **Total Cost**: 2.258414 STX
- **Network**: Testnet
- **Stacks Node**: https://api.testnet.hiro.so
- **Deployment Plan**: `deployments/default.testnet-plan.yaml`

---

## Next Steps

### 1. Wait for Confirmation

Stacks testnet blocks are produced approximately every **10 minutes**. Monitor the transaction links above to see when they confirm.

### 2. Test Contracts on Testnet

Once confirmed, you can interact with the contracts:

```bash
# Test mint (public minting is enabled)
stx contract-call \
  ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ \
  plant-nft \
  mint \
  <your-address> \
  --testnet

# Check plant state
stx contract-call-read \
  ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ \
  plant-game \
  get-plant \
  u1 \
  --testnet

# Water your plant
stx contract-call \
  ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ \
  plant-game \
  water \
  u1 \
  --testnet
```

### 3. Update Web App Configuration

Edit `apps/web/src/constants/contracts.ts`:

```typescript
export const CONTRACTS = {
  testnet: {
    plantNft: 'ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-nft',
    plantGame: 'ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ.plant-game',
  },
  // mainnet TBD
}
```

### 4. Test in Web App

```bash
# Set environment to testnet
export NEXT_PUBLIC_STACKS_NETWORK=testnet

# Run web app
pnpm dev
```

---

## Contract Features

### plant-game.clar

Core gameplay mechanics:
- 5 growth stages: Seed → Sprout → Plant → Bloom → Tree
- Daily watering cooldown (144 blocks ≈ 24 hours)
- 7 successful waters to reach Tree stage
- Tree finality (cannot water after graduation)
- Owner tracking synchronized with NFT

### plant-nft.clar

SIP-009 compliant NFT:
- Public minting enabled (anyone can mint)
- Collection limit: 10M NFTs
- Base URI: `https://dengrow.app/api/metadata/{id}`
- Integrated with plant-game for state management

---

## Verification Checklist

- [x] Contracts broadcasted to testnet
- [x] nft-trait confirmed
- [x] sip-010-trait-ft-standard confirmed
- [x] plant-game confirmed (block 3768499, 2026-02-04 17:21:41 UTC)
- [x] plant-nft confirmed (block 3768499, 2026-02-04 17:21:41 UTC)
- [ ] Manual testing: mint NFT
- [ ] Manual testing: water plant
- [ ] Manual testing: verify cooldown
- [ ] Manual testing: verify growth progression
- [x] Web app constants updated (apps/web/src/constants/contracts.ts)
- [ ] Frontend tested with testnet

---

## Troubleshooting

### Check Transaction Status

```bash
# Via API
curl "https://api.testnet.hiro.so/extended/v1/tx/be5c9586d02e56ea100b6af406360c93deef63af22a241afde0b9a0b3e82a5e1"
```

### Check Contract Deployment

```bash
# Via API (after confirmation)
curl "https://api.testnet.hiro.so/v2/contracts/interface/ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ/plant-game"
```

### Re-deploy if Needed

If transactions fail:

1. Check transaction error in explorer
2. Fix any issues in contracts
3. Regenerate deployment plan:
   ```bash
   cd packages/contracts
   rm deployments/default.testnet-plan.yaml
   clarinet deployments generate --testnet --medium-cost
   ```
4. Re-deploy:
   ```bash
   yes | clarinet deployments apply -p deployments/default.testnet-plan.yaml --no-dashboard
   ```

---

## Resources

- **Hiro Explorer (Testnet)**: https://explorer.hiro.so/?chain=testnet
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Clarinet Docs**: https://docs.hiro.so/clarinet
- **SIP-009 Spec**: https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md

---

**Last Updated**: 2026-02-04 (Auto-generated during deployment)
