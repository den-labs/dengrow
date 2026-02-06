;; ============================================================================
;; Impact Registry Contract v1.0.0
;; ============================================================================
;; Tracks graduated trees and weekly batch redemptions transparently.
;;
;; Purpose:
;;   - Record when plants graduate to Tree stage
;;   - Track total trees in the Impact Pool
;;   - Record weekly batch redemptions with proof hashes
;;   - Provide read-only data for Impact Dashboard
;;
;; Architecture:
;;   - plant-game-v1 calls `register-graduation` when plant reaches stage 4
;;   - Admin records redemption batches with proof hashes
;;   - Anyone can verify batches and pool stats
;; ============================================================================

;; ============================================================================
;; CONSTANTS
;; ============================================================================

(define-constant CONTRACT_ADMIN tx-sender)

;; Error codes
(define-constant ERR-ADMIN-ONLY (err u100))
(define-constant ERR-UNAUTHORIZED (err u101))
(define-constant ERR-ALREADY-GRADUATED (err u102))
(define-constant ERR-NOT-GRADUATED (err u103))
(define-constant ERR-INVALID-BATCH (err u104))
(define-constant ERR-BATCH-EXISTS (err u105))

;; ============================================================================
;; DATA STORAGE
;; ============================================================================

;; Global counters
(define-data-var total-graduated uint u0)
(define-data-var total-redeemed uint u0)
(define-data-var next-batch-id uint u1)

;; Track which tokens have graduated
(define-map graduated-tokens uint
  {
    graduated-at: uint,      ;; block height when graduated
    owner: principal,        ;; owner at graduation time
    redeemed: bool           ;; whether included in a redemption batch
  }
)

;; Batch redemption records
(define-map redemption-batches uint
  {
    quantity: uint,          ;; number of trees redeemed in this batch
    timestamp: uint,         ;; block height when recorded
    proof-hash: (buff 32),   ;; SHA256 hash of proof document
    proof-url: (string-ascii 256),  ;; URL to proof document
    recorded-by: principal   ;; admin who recorded the batch
  }
)

;; Authorized contracts that can register graduations
(define-map authorized-registrars principal bool)

;; ============================================================================
;; AUTHORIZATION
;; ============================================================================

(define-private (is-admin)
  (is-eq tx-sender CONTRACT_ADMIN)
)

(define-private (is-authorized-registrar (caller principal))
  (default-to false (map-get? authorized-registrars caller))
)

;; Admin: authorize a contract to register graduations
(define-public (authorize-registrar (registrar principal))
  (begin
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    (ok (map-set authorized-registrars registrar true))
  )
)

;; Admin: revoke registrar authorization
(define-public (revoke-registrar (registrar principal))
  (begin
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    (ok (map-delete authorized-registrars registrar))
  )
)

;; ============================================================================
;; GRADUATION TRACKING
;; ============================================================================

;; Called by plant-game-v1 when a plant reaches Tree stage
;; Only authorized registrars can call this
(define-public (register-graduation (token-id uint) (owner principal))
  (begin
    ;; Verify caller is authorized (contract-caller for inter-contract calls)
    (asserts! (or (is-admin) (is-authorized-registrar contract-caller)) ERR-UNAUTHORIZED)
    ;; Verify not already graduated
    (asserts! (is-none (map-get? graduated-tokens token-id)) ERR-ALREADY-GRADUATED)
    ;; Record graduation
    (map-set graduated-tokens token-id {
      graduated-at: block-height,
      owner: owner,
      redeemed: false
    })
    ;; Increment counter
    (var-set total-graduated (+ (var-get total-graduated) u1))
    ;; Return success with token info
    (ok {
      token-id: token-id,
      graduated-at: block-height,
      total-in-pool: (- (var-get total-graduated) (var-get total-redeemed))
    })
  )
)

;; ============================================================================
;; BATCH REDEMPTION (Admin Only)
;; ============================================================================

;; Record a weekly redemption batch
;; This is called by admin after real-world impact is verified
(define-public (record-redemption
    (quantity uint)
    (proof-hash (buff 32))
    (proof-url (string-ascii 256))
  )
  (let (
    (batch-id (var-get next-batch-id))
    (current-pool (- (var-get total-graduated) (var-get total-redeemed)))
  )
    ;; Only admin can record redemptions
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    ;; Quantity must be valid and not exceed pool
    (asserts! (and (> quantity u0) (<= quantity current-pool)) ERR-INVALID-BATCH)
    ;; Record the batch
    (map-set redemption-batches batch-id {
      quantity: quantity,
      timestamp: block-height,
      proof-hash: proof-hash,
      proof-url: proof-url,
      recorded-by: tx-sender
    })
    ;; Update counters
    (var-set total-redeemed (+ (var-get total-redeemed) quantity))
    (var-set next-batch-id (+ batch-id u1))
    ;; Return batch info
    (ok {
      batch-id: batch-id,
      quantity: quantity,
      remaining-in-pool: (- current-pool quantity)
    })
  )
)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

;; Get global pool statistics
(define-read-only (get-pool-stats)
  {
    total-graduated: (var-get total-graduated),
    total-redeemed: (var-get total-redeemed),
    current-pool-size: (- (var-get total-graduated) (var-get total-redeemed)),
    total-batches: (- (var-get next-batch-id) u1)
  }
)

;; Get graduation info for a specific token
(define-read-only (get-graduation (token-id uint))
  (map-get? graduated-tokens token-id)
)

;; Check if a token has graduated
(define-read-only (is-graduated (token-id uint))
  (is-some (map-get? graduated-tokens token-id))
)

;; Get a specific redemption batch
(define-read-only (get-batch (batch-id uint))
  (map-get? redemption-batches batch-id)
)

;; Get the latest batch ID
(define-read-only (get-latest-batch-id)
  (- (var-get next-batch-id) u1)
)

;; Check if a principal is an authorized registrar
(define-read-only (is-registrar (principal principal))
  (default-to false (map-get? authorized-registrars principal))
)
