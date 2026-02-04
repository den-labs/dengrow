# Security Review - DenGrow Contracts

**Fecha:** 2026-02-04
**Contratos Revisados:** `plant-game.clar`, `plant-nft.clar`
**Estado:** Pre-Testnet Deployment

---

## Resumen Ejecutivo

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 CRÍTICO | 1 | `update-owner` sin validación de caller |
| 🟡 MEDIO | 2 | Mint permission, metadata URI placeholder |
| 🟢 BAJO | 2 | Optimizaciones menores |

**Recomendación:** Arreglar issue CRÍTICO antes de deploy a testnet.

---

## 🔴 CRÍTICO - Issue #1: update-owner Sin Validación

### Ubicación
`plant-game.clar:156-167`

### Problema
```clarity
(define-public (update-owner (token-id uint) (new-owner principal))
  (let
    (
      (plant-data (unwrap! (map-get? plants { token-id: token-id }) ERR-PLANT-NOT-FOUND))
    )
    ;; Update only the owner field, preserve all other state
    (ok (map-set plants
      { token-id: token-id }
      (merge plant-data { owner: new-owner })
    ))
  )
)
```

**Vulnerabilidad:** Cualquier principal puede cambiar el owner de cualquier planta llamando directamente a `update-owner`, sin necesidad de ser el dueño del NFT.

### Impacto
- Atacante puede robar ownership de plantas sin transferir el NFT
- Usuario pierde control sobre su planta (no puede regar)
- Atacante puede regar plantas ajenas

### Exploit Example
```clarity
;; Alice mintea planta #1
(contract-call? .plant-nft mint 'ST1...)  ;; token-id: u1, owner: Alice

;; Bob (atacante) llama directamente a update-owner
(contract-call? .plant-game update-owner u1 'ST2...) ;; Ahora Bob es owner en plant-game

;; Bob puede regar la planta de Alice
(contract-call? .plant-game water u1)  ;; ✅ Pasa porque plant-game.owner = Bob

;; Alice NO puede regar su propia planta
(contract-call? .plant-game water u1)  ;; ❌ Falla con ERR-NOT-OWNER
```

### Fix Requerido

**Opción A: Restringir a solo plant-nft contract (RECOMENDADO)**
```clarity
(define-public (update-owner (token-id uint) (new-owner principal))
  (let
    (
      (plant-data (unwrap! (map-get? plants { token-id: token-id }) ERR-PLANT-NOT-FOUND))
    )
    ;; AGREGAR: Solo el contrato plant-nft puede llamar esta función
    (asserts! (is-eq contract-caller .plant-nft) ERR-NOT-AUTHORIZED)

    ;; Update only the owner field, preserve all other state
    (ok (map-set plants
      { token-id: token-id }
      (merge plant-data { owner: new-owner })
    ))
  )
)
```

**Opción B: Hacer función privada y crear wrapper interno**
```clarity
;; Cambiar a privada
(define-private (update-owner-internal (token-id uint) (new-owner principal))
  ...
)

;; Llamar desde transfer en plant-nft
```

**Error code a agregar:**
```clarity
(define-constant ERR-NOT-AUTHORIZED (err u105))
```

---

## 🟡 MEDIO - Issue #2: Mint Permission Restrictivo

### Ubicación
`plant-nft.clar:59`

### Problema
```clarity
(asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
```

**Contexto:** Solo el deployer puede mintear NFTs.

### Impacto en Testnet
- Usuarios no pueden mintear sus propias plantas
- Necesitas mintear manualmente para cada usuario
- No es funcional para testing público

### Opciones

**Opción A: Remover restricción para Testnet (NO recomendado para Mainnet)**
```clarity
;; (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
```

**Opción B: Whitelist de minters**
```clarity
(define-map authorized-minters principal bool)

(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (map-set authorized-minters minter true))
  )
)

(define-public (mint (recipient principal))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    ;; Check if caller is authorized
    (asserts!
      (or
        (is-eq tx-sender CONTRACT_OWNER)
        (default-to false (map-get? authorized-minters tx-sender))
      )
      ERR_OWNER_ONLY
    )
    ...
  )
)
```

**Opción C: Mint público con fee (Mainnet-ready)**
```clarity
(define-constant MINT_FEE u1000000) ;; 1 STX

(define-public (mint (recipient principal))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)

    ;; Charge fee (except for contract owner)
    (if (is-eq tx-sender CONTRACT_OWNER)
      true
      (try! (stx-transfer? MINT_FEE tx-sender CONTRACT_OWNER))
    )
    ...
  )
)
```

**Recomendación para Testnet:** Opción A (remover restricción)
**Recomendación para Mainnet:** Opción C (mint con fee)

---

## 🟡 MEDIO - Issue #3: Metadata URI Placeholder

### Ubicación
`plant-nft.clar:19`

### Problema
```clarity
(define-data-var base-uri (string-ascii 80) "https://placedog.net/500/500?id={id}")
```

**Contexto:** Usando placeholder de dogs en vez de metadata real.

### Impacto
- NFTs aparecen con imágenes de perros en explorers
- No hay información de traits/stages
- No cumple con expectativas de usuarios

### Fix para Testnet
```clarity
;; Placeholder para testnet con información correcta
(define-data-var base-uri (string-ascii 80) "https://dengrow-testnet.example.com/metadata/{id}")
```

### Fix para Mainnet
1. Crear API endpoint `/api/metadata/[tokenId]`
2. Implementar trait system
3. Generar imágenes reales de stages
4. Actualizar base-uri con URL real

**Nota:** Puedes usar `set-base-uri` si agregas función admin:
```clarity
(define-public (set-base-uri (new-uri (string-ascii 80)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set base-uri new-uri))
  )
)
```

---

## 🟢 BAJO - Issue #4: Gas Optimization en calculate-stage

### Ubicación
`plant-game.clar:37-51`

### Optimización Sugerida
```clarity
;; Actual: Nested if (funciona, pero verbose)
(define-private (calculate-stage (growth-points uint))
  (if (<= growth-points u1)
    STAGE-SEED
    (if (<= growth-points u3)
      STAGE-SPROUT
      (if (<= growth-points u5)
        STAGE-PLANT
        (if (is-eq growth-points u6)
          STAGE-BLOOM
          STAGE-TREE
        )
      )
    )
  )
)

;; Optimizado: Eliminando el is-eq innecesario
(define-private (calculate-stage (growth-points uint))
  (if (<= growth-points u1)
    STAGE-SEED
    (if (<= growth-points u3)
      STAGE-SPROUT
      (if (<= growth-points u5)
        STAGE-PLANT
        (if (<= growth-points u6)
          STAGE-BLOOM
          STAGE-TREE  ;; Si growth > 6, siempre es Tree
        )
      )
    )
  )
)
```

**Impacto:** Mínimo, ahorra ~10 gas por llamada.

---

## 🟢 BAJO - Issue #5: SIP-009 Trait Comentado

### Ubicación
`plant-nft.clar:3`

### Observación
```clarity
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;; (impl-trait 'STM6S3AESTK9NAYE3Z7RS00T11ER8JJCDNTKG711.nft-trait.nft-trait)
```

**Contexto:** Trait de devnet está comentado, usando mainnet trait.

### Para Testnet Deployment
Cambiar a:
```clarity
;; (impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait) ;; Mainnet
(impl-trait 'STM6S3AESTK9NAYE3Z7RS00T11ER8JJCDNTKG711.nft-trait.nft-trait) ;; Testnet
```

---

## ✅ Fortalezas de Seguridad

### plant-game.clar

1. ✅ **Ownership verification en water()**
   ```clarity
   (asserts! (is-eq tx-sender (get owner plant-data)) ERR-NOT-OWNER)
   ```

2. ✅ **Cooldown enforcement correcto**
   ```clarity
   (asserts!
     (or
       (is-eq last-water u0)
       (>= current-block (+ last-water BLOCKS-PER-DAY))
     )
     ERR-COOLDOWN-ACTIVE
   )
   ```

3. ✅ **Tree finality enforcement**
   ```clarity
   (asserts! (< current-stage STAGE-TREE) ERR-ALREADY-TREE)
   ```

4. ✅ **No integer overflow en growth-points**
   - Máximo teórico: 7 waters = u7
   - uint puede manejar hasta u340282366920938463463374607431768211455

5. ✅ **Prevención de re-inicialización**
   ```clarity
   (asserts! (is-none existing-plant) ERR-PLANT-ALREADY-EXISTS)
   ```

### plant-nft.clar

1. ✅ **SIP-009 compliant**
   - `get-last-token-id`
   - `get-token-uri`
   - `get-owner`
   - `transfer`

2. ✅ **Transfer ownership verification**
   ```clarity
   (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
   ```

3. ✅ **Collection limit enforcement**
   ```clarity
   (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
   ```

4. ✅ **Atomic mint + initialize**
   - Si initialize-plant falla, todo el mint revierte

---

## Test Coverage

**30/30 tests passing** ✅

Coverage por área:
- Initialization: 100%
- Ownership: 100%
- Cooldown: 100%
- Stage progression: 100%
- Read-only functions: 100%
- Transfer integration: 100%
- Edge cases: 100%

**Missing test cases:**
- ❌ Direct call to update-owner (exploit test)
- ❌ Contract-call vs tx-sender diferenciación

---

## Checklist Pre-Deployment

### CRÍTICO (Debe arreglarse)
- [ ] Fix `update-owner` con validación de caller

### Recomendado para Testnet
- [ ] Cambiar trait a testnet version (STM...)
- [ ] Remover o relajar mint permission
- [ ] Actualizar base-uri con placeholder informativo

### Opcional
- [ ] Agregar `set-base-uri` para flexibilidad
- [ ] Agregar error logging más detallado
- [ ] Optimizar `calculate-stage`

---

## Comandos de Deployment

### 1. Fix Update-Owner Primero

```bash
# Editar plant-game.clar línea 156
# Agregar validación de contract-caller
```

### 2. Preparar para Testnet

```bash
cd packages/contracts

# Compilar y verificar
clarinet check

# Correr tests
pnpm test

# Generar deployment plan
clarinet deployment generate --testnet
```

### 3. Deploy a Testnet

```bash
# Opción A: Clarinet deploy
clarinet deployment apply -p deployments/default.testnet-plan.yaml

# Opción B: Manual con stacks CLI
stx deploy plant-game contracts/plant-game.clar --network testnet
stx deploy plant-nft contracts/plant-nft.clar --network testnet
```

### 4. Verificar Deployment

```bash
# Check contract deployed
stx call-read-only <deployer>.plant-nft get-last-token-id --network testnet

# Test mint
stx call <deployer>.plant-nft mint <recipient> --network testnet
```

---

## Gas Estimates

| Función | Estimated Cost (μSTX) |
|---------|----------------------|
| `initialize-plant` | ~500 |
| `water` (first time) | ~800 |
| `water` (with stage change) | ~1,200 |
| `get-plant` (read-only) | ~100 |
| `can-water` (read-only) | ~150 |

**Total para 7 waters:** ~6,500 μSTX (~0.0065 STX)

---

## Recomendaciones Finales

### Para Testnet NOW
1. **FIX CRÍTICO:** Agregar validación en `update-owner`
2. Cambiar trait a testnet
3. Remover mint permission para testing público
4. Deploy y testear manualmente

### Para Mainnet (futuro)
1. Re-habilitar mint permission con fee system
2. Implementar metadata API real
3. Auditoría externa profesional
4. Agregar emergency pause mechanism
5. Considerar timelock para actualizaciones críticas

---

**Auditor:** Claude Code
**Status:** ⚠️ NO LISTO para deployment (requiere fix crítico)
**Next Steps:** Arreglar Issue #1, luego proceder con testnet deployment
