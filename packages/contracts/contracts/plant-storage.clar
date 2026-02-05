;; ============================================================================
;; Plant Storage Contract v1.0.0
;; ============================================================================
;; IMMUTABLE DATA LAYER - Never redeploy this contract
;;
;; Purpose:
;;   - Store all plant game data persistently
;;   - Control which logic contracts can write via authorization whitelist
;;   - Support multiple authorized contracts (game, pvp, events, etc.)
;;
;; Upgrade Pattern:
;;   - Deploy new logic contract (e.g., plant-game-v2)
;;   - Admin calls authorize-contract(.plant-game-v2)
;;   - New logic contract can now read/write to this storage
;;   - Optionally revoke old version
;; ============================================================================

;; Error Codes
(define-constant ERR-NOT-AUTHORIZED (err u105))
(define-constant ERR-PLANT-NOT-FOUND (err u101))
(define-constant ERR-PLANT-ALREADY-EXISTS (err u104))
(define-constant ERR-ADMIN-ONLY (err u100))

;; Contract Admin (set once at deployment, immutable)
(define-data-var contract-admin principal tx-sender)

;; ============================================================================
;; DATA STORAGE
;; ============================================================================

;; Core Plant Data - Primary game state
(define-map plants
  { token-id: uint }
  {
    stage: uint,              ;; 0=Seed, 1=Sprout, 2=Plant, 3=Bloom, 4=Tree
    growth-points: uint,      ;; Cumulative successful waters
    last-water-block: uint,   ;; Block height of last water action
    owner: principal          ;; Current owner (synced with NFT)
  }
)

;; Future extensibility: Generic key-value storage for new features
;; Example: PvP stats, achievements, seasonal data
(define-map extension-data
  { category: (string-ascii 32), key: uint }
  { value: (buff 256) }
)

;; ============================================================================
;; AUTHORIZATION SYSTEM
;; ============================================================================

;; Whitelist of contracts authorized to write to storage
;; Multiple contracts can be authorized simultaneously
(define-map authorized-contracts principal bool)

;; Check if a contract is authorized
(define-read-only (is-authorized (contract principal))
  (default-to false (map-get? authorized-contracts contract))
)

;; Authorize a contract to write to storage (admin only)
(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-admin)) ERR-ADMIN-ONLY)
    (print { event: "contract-authorized", contract: contract, block: block-height })
    (ok (map-set authorized-contracts contract true))
  )
)

;; Revoke authorization from a contract (admin only)
(define-public (revoke-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-admin)) ERR-ADMIN-ONLY)
    (print { event: "contract-revoked", contract: contract, block: block-height })
    (ok (map-delete authorized-contracts contract))
  )
)

;; Get admin address
(define-read-only (get-admin)
  (var-get contract-admin)
)

;; ============================================================================
;; PLANT DATA - WRITE FUNCTIONS (Authorization Required)
;; ============================================================================

;; Initialize a new plant (called on NFT mint)
(define-public (initialize-plant (token-id uint) (owner principal))
  (begin
    ;; Verify caller is authorized
    (asserts! (is-authorized contract-caller) ERR-NOT-AUTHORIZED)
    ;; Ensure plant doesn't already exist
    (asserts! (is-none (map-get? plants { token-id: token-id })) ERR-PLANT-ALREADY-EXISTS)
    ;; Create initial plant state
    (print { event: "plant-initialized", token-id: token-id, owner: owner, block: block-height })
    (ok (map-set plants
      { token-id: token-id }
      {
        stage: u0,
        growth-points: u0,
        last-water-block: u0,
        owner: owner
      }
    ))
  )
)

;; Update plant game state (called on water action)
(define-public (update-plant-state
    (token-id uint)
    (new-stage uint)
    (new-points uint)
    (new-water-block uint))
  (let
    (
      (plant-data (unwrap! (map-get? plants { token-id: token-id }) ERR-PLANT-NOT-FOUND))
    )
    ;; Verify caller is authorized
    (asserts! (is-authorized contract-caller) ERR-NOT-AUTHORIZED)
    ;; Update plant state (preserve owner)
    (ok (map-set plants
      { token-id: token-id }
      {
        stage: new-stage,
        growth-points: new-points,
        last-water-block: new-water-block,
        owner: (get owner plant-data)
      }
    ))
  )
)

;; Update plant owner (called on NFT transfer)
(define-public (update-plant-owner (token-id uint) (new-owner principal))
  (let
    (
      (plant-data (unwrap! (map-get? plants { token-id: token-id }) ERR-PLANT-NOT-FOUND))
    )
    ;; Verify caller is authorized
    (asserts! (is-authorized contract-caller) ERR-NOT-AUTHORIZED)
    ;; Update only owner, preserve all other state
    (print { event: "plant-owner-updated", token-id: token-id, new-owner: new-owner, block: block-height })
    (ok (map-set plants
      { token-id: token-id }
      (merge plant-data { owner: new-owner })
    ))
  )
)

;; ============================================================================
;; PLANT DATA - READ FUNCTIONS (No Authorization Required)
;; ============================================================================

;; Get complete plant state
(define-read-only (get-plant (token-id uint))
  (map-get? plants { token-id: token-id })
)

;; Get only the stage
(define-read-only (get-stage (token-id uint))
  (match (map-get? plants { token-id: token-id })
    plant-data (some (get stage plant-data))
    none
  )
)

;; Get only the growth points
(define-read-only (get-growth-points (token-id uint))
  (match (map-get? plants { token-id: token-id })
    plant-data (some (get growth-points plant-data))
    none
  )
)

;; Get last water block
(define-read-only (get-last-water-block (token-id uint))
  (match (map-get? plants { token-id: token-id })
    plant-data (some (get last-water-block plant-data))
    none
  )
)

;; Get plant owner
(define-read-only (get-plant-owner (token-id uint))
  (match (map-get? plants { token-id: token-id })
    plant-data (some (get owner plant-data))
    none
  )
)

;; Check if plant exists
(define-read-only (plant-exists (token-id uint))
  (is-some (map-get? plants { token-id: token-id }))
)

;; ============================================================================
;; EXTENSION DATA - For Future Features (PvP, Achievements, etc.)
;; ============================================================================

;; Set extension data (authorized contracts only)
(define-public (set-extension-data
    (category (string-ascii 32))
    (key uint)
    (value (buff 256)))
  (begin
    (asserts! (is-authorized contract-caller) ERR-NOT-AUTHORIZED)
    (ok (map-set extension-data { category: category, key: key } { value: value }))
  )
)

;; Get extension data (no authorization required)
(define-read-only (get-extension-data (category (string-ascii 32)) (key uint))
  (map-get? extension-data { category: category, key: key })
)

;; Delete extension data (authorized contracts only)
(define-public (delete-extension-data (category (string-ascii 32)) (key uint))
  (begin
    (asserts! (is-authorized contract-caller) ERR-NOT-AUTHORIZED)
    (ok (map-delete extension-data { category: category, key: key }))
  )
)
