# DenGrow - Testnet Deployment Guide

**Fecha:** 2026-02-04
**Target Network:** Stacks Testnet
**Estado:** Ready for Deployment ✅

---

## Pre-Deployment Checklist

### ✅ Completado

- [x] Security fix aplicado (update-owner vulnerability)
- [x] Todos los tests pasando (31/31)
- [x] Contratos compilando correctamente
- [x] Clarinet check exitoso

### 🔄 Pendiente (Decisiones Necesarias)

- [ ] **Decisión: Mint Permission**
  - Opción A: Solo deployer puede mintear (actual)
  - Opción B: Mint público para testing
  - Opción C: Mint con fee

- [ ] **Decisión: Metadata URI**
  - Actualizar base-uri con URL real o placeholder informativo

- [ ] **Decisión: NFT Trait**
  - Cambiar a testnet trait (STM...) o mantener mainnet (SP...)

---

## Opción 1: Deployment con Clarinet

### Prerrequisitos

```bash
# Instalar Clarinet (si no está instalado)
curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-macos-x64.tar.gz | tar xz
sudo mv clarinet /usr/local/bin

# Verificar instalación
clarinet --version

# Tener STX en testnet
# Usar faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
```

### Paso 1: Configurar Wallet para Testnet

```bash
cd packages/contracts

# Exportar tu private key de testnet
export STACKS_PRIVATE_KEY="tu-private-key-aquí"

# O usar account del Devnet.toml (NO recomendado para testnet público)
# Deployer: 753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601
```

### Paso 2: Crear Deployment Plan para Testnet

```bash
# Generar plan de testnet
clarinet deployment generate --testnet

# Esto crea: deployments/default.testnet-plan.yaml
```

### Paso 3: Review del Deployment Plan

El archivo `default.testnet-plan.yaml` debe verse así:

```yaml
---
id: 0
name: Testnet deployment
network: testnet
stacks-node: "https://api.testnet.hiro.so"
plan:
  batches:
    - id: 0
      transactions:
        - requirement-publish:
            contract-id: SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait
            remap-sender: <TU-TESTNET-ADDRESS>
            cost: 4680
        - contract-publish:
            contract-name: plant-game
            expected-sender: <TU-TESTNET-ADDRESS>
            cost: 35000
            path: contracts/plant-game.clar
        - contract-publish:
            contract-name: plant-nft
            expected-sender: <TU-TESTNET-ADDRESS>
            cost: 21410
            path: contracts/plant-nft.clar
```

### Paso 4: Deploy

```bash
# Aplicar deployment plan
clarinet deployment apply -p deployments/default.testnet-plan.yaml

# Confirmar cuando pregunte
```

### Paso 5: Verificar Deployment

```bash
# Verificar que plant-game fue desplegado
curl https://api.testnet.hiro.so/v2/contracts/interface/<address>/plant-game

# Verificar que plant-nft fue desplegado
curl https://api.testnet.hiro.so/v2/contracts/interface/<address>/plant-nft
```

---

## Opción 2: Deployment Manual con Stacks CLI

### Prerrequisitos

```bash
# Instalar Stacks CLI
npm install -g @stacks/cli

# Verificar
stx --version

# Configurar red testnet
stx -t
```

### Paso 1: Deploy plant-game

```bash
cd packages/contracts

# Deploy plant-game
stx deploy_contract \
  contracts/plant-game.clar \
  plant-game \
  35000 \
  0 \
  --testnet

# Guardar transaction ID
```

### Paso 2: Esperar Confirmación

```bash
# Verificar status de transacción
stx tx <transaction-id> --testnet

# Esperar hasta que status = success
```

### Paso 3: Deploy plant-nft

```bash
# Deploy plant-nft (DESPUÉS de que plant-game esté confirmado)
stx deploy_contract \
  contracts/plant-nft.clar \
  plant-nft \
  21410 \
  0 \
  --testnet
```

---

## Opción 3: Deployment con Platform.hiro.so

### Paso 1: Ir a Hiro Platform

1. Abrir https://platform.hiro.so
2. Conectar wallet (Hiro/Xverse)
3. Cambiar a Testnet

### Paso 2: Deploy Contracts

1. Click en "Deploy Contract"
2. Copiar contenido de `contracts/plant-game.clar`
3. Contract name: `plant-game`
4. Click "Deploy"
5. Confirmar en wallet

Repetir para `plant-nft.clar`

---

## Post-Deployment

### 1. Guardar Direcciones de Contratos

Crear archivo `deployed-contracts.json`:

```json
{
  "network": "testnet",
  "deployer": "ST1ABC...",
  "contracts": {
    "plant-game": {
      "address": "ST1ABC...plant-game",
      "tx": "0x123...",
      "block": 12345
    },
    "plant-nft": {
      "address": "ST1ABC...plant-nft",
      "tx": "0x456...",
      "block": 12346
    }
  }
}
```

### 2. Actualizar Web App

Editar `apps/web/src/constants/contracts.ts`:

```typescript
export const CONTRACTS = {
  testnet: {
    plantNft: 'ST1ABC...plant-nft',
    plantGame: 'ST1ABC...plant-game',
  },
  // ...
}
```

### 3. Testing en Testnet

```bash
# Test 1: Mint NFT
stx contract-call \
  <deployer> \
  plant-nft \
  mint \
  <recipient> \
  --testnet

# Test 2: Check plant state
stx contract-call-read \
  <deployer> \
  plant-game \
  get-plant \
  u1 \
  --testnet

# Test 3: Water plant
stx contract-call \
  <deployer> \
  plant-game \
  water \
  u1 \
  --testnet
```

### 4. Verificar en Explorer

Abrir:
- https://explorer.hiro.so/txid/<tx-id>?chain=testnet
- https://explorer.hiro.so/address/<deployer>?chain=testnet

---

## Cambios Opcionales Pre-Deployment

### A. Habilitar Mint Público (Recomendado para Testnet)

**Archivo:** `contracts/plant-nft.clar`

**Cambio:**
```clarity
;; ANTES (solo owner puede mintear)
(asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)

;; DESPUÉS (cualquiera puede mintear)
;; (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
```

**Pro:** Usuarios pueden testear sin necesidad de que les mintees
**Con:** Cualquiera puede mintear (spam posible)

### B. Cambiar NFT Trait a Testnet

**Archivo:** `contracts/plant-nft.clar`

**Cambio:**
```clarity
;; ANTES (mainnet trait)
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; DESPUÉS (testnet trait)
(impl-trait 'STM6S3AESTK9NAYE3Z7RS00T11ER8JJCDNTKG711.nft-trait.nft-trait)
```

**Pro:** Más correcto para testnet
**Con:** Requiere re-compilación

### C. Actualizar Metadata URI

**Archivo:** `contracts/plant-nft.clar`

**Cambio:**
```clarity
;; ANTES (placeholder de perros)
(define-data-var base-uri (string-ascii 80) "https://placedog.net/500/500?id={id}")

;; DESPUÉS (placeholder informativo)
(define-data-var base-uri (string-ascii 80) "https://dengrow-testnet-placeholder.com/metadata/{id}")
```

---

## Troubleshooting

### Error: "Contract already exists"

**Causa:** Ya desplegaste este contrato antes
**Solución:** Cambiar el nombre del contrato o usar otra wallet

### Error: "Insufficient funds"

**Causa:** No tienes suficientes STX
**Solución:** Pedir STX del faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet

### Error: "Contract not found: .plant-game"

**Causa:** plant-nft se desplegó antes que plant-game
**Solución:** Desplegar en orden correcto: plant-game primero, luego plant-nft

### Error: "Analysis error"

**Causa:** Error de sintaxis en el contrato
**Solución:** Correr `clarinet check` localmente para ver el error específico

---

## Gas Costs Estimados

| Operación | Cost (μSTX) |
|-----------|-------------|
| Deploy plant-game | ~35,000 |
| Deploy plant-nft | ~21,410 |
| Mint NFT | ~2,000 |
| Water plant | ~800 |
| Transfer NFT | ~1,500 |

**Total para deployment:** ~56,410 μSTX (~0.056 STX)

---

## Comandos Útiles

```bash
# Ver balance de testnet
stx balance <address> --testnet

# Ver contratos desplegados
stx accounts <address> --testnet

# Ver detalles de transacción
stx tx <tx-id> --testnet

# Llamar función read-only
stx contract-call-read <deployer> plant-game get-plant u1 --testnet

# Llamar función pública
stx contract-call <deployer> plant-game water u1 --testnet
```

---

## Next Steps Después de Testnet

1. ✅ Deploy exitoso a testnet
2. 🔄 Testing manual con usuarios reales
3. 🔄 Implementar Milestone 2 (Web UI integration)
4. 🔄 Testing E2E en testnet
5. 🔄 Preparar para mainnet
6. 🔄 Auditoría externa (recomendado)
7. 🔄 Mainnet deployment

---

## Enlaces Útiles

- **Testnet Faucet:** https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Testnet Explorer:** https://explorer.hiro.so/?chain=testnet
- **Hiro Platform:** https://platform.hiro.so
- **Clarinet Docs:** https://docs.hiro.so/clarinet
- **Stacks CLI Docs:** https://docs.hiro.so/stacks-cli

---

**Status:** 📋 Ready for Deployment
**Última Actualización:** 2026-02-04
**Próximo Milestone:** M2 - Web MVP
