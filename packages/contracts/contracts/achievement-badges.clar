;; ============================================================================
;; Achievement Badges Contract v1.0.0
;; ============================================================================
;; Soulbound achievement badges for DenGrow players.
;; Badges are non-transferable and claimed by providing evidence (token-ids).
;; The contract verifies eligibility by reading plant-storage and impact-registry.
;;
;; Badge Types:
;;   1 = First Seed    - Own at least one plant
;;   2 = First Tree    - Graduate a plant to Tree stage
;;   3 = Green Thumb   - Graduate 3 plants to Tree stage
;;   4 = Early Adopter - Own a plant with token-id <= 100
;; ============================================================================

;; ============================================================================
;; CONSTANTS
;; ============================================================================

(define-constant CONTRACT_ADMIN tx-sender)

;; Badge IDs
(define-constant BADGE-FIRST-SEED u1)
(define-constant BADGE-FIRST-TREE u2)
(define-constant BADGE-GREEN-THUMB u3)
(define-constant BADGE-EARLY-ADOPTER u4)

;; Number of defined badges
(define-constant TOTAL-BADGE-TYPES u4)

;; Error codes
(define-constant ERR-ALREADY-CLAIMED (err u200))
(define-constant ERR-NOT-ELIGIBLE (err u201))
(define-constant ERR-INVALID-BADGE (err u202))

;; ============================================================================
;; DATA STORAGE
;; ============================================================================

;; Track which badges each principal has earned
(define-map badges
  { owner: principal, badge-id: uint }
  { earned-at: uint }
)

;; Count of badges per principal
(define-map badge-counts principal uint)

;; Global count of badges claimed
(define-data-var total-badges-claimed uint u0)

;; ============================================================================
;; PRIVATE HELPERS
;; ============================================================================

(define-private (has-badge (owner principal) (badge-id uint))
  (is-some (map-get? badges { owner: owner, badge-id: badge-id }))
)

(define-private (grant-badge (owner principal) (badge-id uint))
  (begin
    (map-set badges
      { owner: owner, badge-id: badge-id }
      { earned-at: block-height }
    )
    (map-set badge-counts
      owner
      (+ (default-to u0 (map-get? badge-counts owner)) u1)
    )
    (var-set total-badges-claimed (+ (var-get total-badges-claimed) u1))
    (print {
      event: "badge-earned",
      owner: owner,
      badge-id: badge-id,
      block-height: block-height
    })
    (ok {
      badge-id: badge-id,
      earned-at: block-height
    })
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - Badge Claims
;; ============================================================================

;; Claim "First Seed" badge - prove you own a plant by providing its token-id
(define-public (claim-first-seed (token-id uint))
  (let (
    (plant (unwrap! (contract-call? .plant-storage get-plant token-id) ERR-NOT-ELIGIBLE))
  )
    ;; Must not already have badge
    (asserts! (not (has-badge tx-sender BADGE-FIRST-SEED)) ERR-ALREADY-CLAIMED)
    ;; Caller must be the plant owner
    (asserts! (is-eq tx-sender (get owner plant)) ERR-NOT-ELIGIBLE)
    ;; Grant badge
    (grant-badge tx-sender BADGE-FIRST-SEED)
  )
)

;; Claim "First Tree" badge - prove you graduated a plant (stage >= 4)
(define-public (claim-first-tree (token-id uint))
  (let (
    (plant (unwrap! (contract-call? .plant-storage get-plant token-id) ERR-NOT-ELIGIBLE))
  )
    (asserts! (not (has-badge tx-sender BADGE-FIRST-TREE)) ERR-ALREADY-CLAIMED)
    (asserts! (is-eq tx-sender (get owner plant)) ERR-NOT-ELIGIBLE)
    (asserts! (>= (get stage plant) u4) ERR-NOT-ELIGIBLE)
    (grant-badge tx-sender BADGE-FIRST-TREE)
  )
)

;; Claim "Green Thumb" badge - prove you graduated 3 plants
(define-public (claim-green-thumb
    (token-id-1 uint)
    (token-id-2 uint)
    (token-id-3 uint)
  )
  (let (
    (plant-1 (unwrap! (contract-call? .plant-storage get-plant token-id-1) ERR-NOT-ELIGIBLE))
    (plant-2 (unwrap! (contract-call? .plant-storage get-plant token-id-2) ERR-NOT-ELIGIBLE))
    (plant-3 (unwrap! (contract-call? .plant-storage get-plant token-id-3) ERR-NOT-ELIGIBLE))
  )
    (asserts! (not (has-badge tx-sender BADGE-GREEN-THUMB)) ERR-ALREADY-CLAIMED)
    ;; All 3 must be owned by caller
    (asserts! (is-eq tx-sender (get owner plant-1)) ERR-NOT-ELIGIBLE)
    (asserts! (is-eq tx-sender (get owner plant-2)) ERR-NOT-ELIGIBLE)
    (asserts! (is-eq tx-sender (get owner plant-3)) ERR-NOT-ELIGIBLE)
    ;; All 3 must be trees
    (asserts! (>= (get stage plant-1) u4) ERR-NOT-ELIGIBLE)
    (asserts! (>= (get stage plant-2) u4) ERR-NOT-ELIGIBLE)
    (asserts! (>= (get stage plant-3) u4) ERR-NOT-ELIGIBLE)
    ;; All 3 must be different plants
    (asserts! (not (is-eq token-id-1 token-id-2)) ERR-NOT-ELIGIBLE)
    (asserts! (not (is-eq token-id-1 token-id-3)) ERR-NOT-ELIGIBLE)
    (asserts! (not (is-eq token-id-2 token-id-3)) ERR-NOT-ELIGIBLE)
    (grant-badge tx-sender BADGE-GREEN-THUMB)
  )
)

;; Claim "Early Adopter" badge - prove you own a plant with token-id <= 100
(define-public (claim-early-adopter (token-id uint))
  (let (
    (plant (unwrap! (contract-call? .plant-storage get-plant token-id) ERR-NOT-ELIGIBLE))
  )
    (asserts! (not (has-badge tx-sender BADGE-EARLY-ADOPTER)) ERR-ALREADY-CLAIMED)
    (asserts! (is-eq tx-sender (get owner plant)) ERR-NOT-ELIGIBLE)
    (asserts! (<= token-id u100) ERR-NOT-ELIGIBLE)
    (grant-badge tx-sender BADGE-EARLY-ADOPTER)
  )
)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

;; Check if a principal has a specific badge
(define-read-only (get-badge (owner principal) (badge-id uint))
  (map-get? badges { owner: owner, badge-id: badge-id })
)

;; Check if a principal has a specific badge (bool)
(define-read-only (has-badge-read (owner principal) (badge-id uint))
  (is-some (map-get? badges { owner: owner, badge-id: badge-id }))
)

;; Get badge count for a principal
(define-read-only (get-badge-count (owner principal))
  (default-to u0 (map-get? badge-counts owner))
)

;; Get total badges claimed globally
(define-read-only (get-total-badges-claimed)
  (var-get total-badges-claimed)
)

;; Get total badge types available
(define-read-only (get-total-badge-types)
  TOTAL-BADGE-TYPES
)

;; Get badge name
(define-read-only (get-badge-name (badge-id uint))
  (if (is-eq badge-id BADGE-FIRST-SEED) "First Seed"
    (if (is-eq badge-id BADGE-FIRST-TREE) "First Tree"
      (if (is-eq badge-id BADGE-GREEN-THUMB) "Green Thumb"
        (if (is-eq badge-id BADGE-EARLY-ADOPTER) "Early Adopter"
          "Unknown"))))
)

;; Get badge description
(define-read-only (get-badge-description (badge-id uint))
  (if (is-eq badge-id BADGE-FIRST-SEED) "Planted your first seed"
    (if (is-eq badge-id BADGE-FIRST-TREE) "Graduated your first tree"
      (if (is-eq badge-id BADGE-GREEN-THUMB) "Graduated 3 trees"
        (if (is-eq badge-id BADGE-EARLY-ADOPTER) "Minted in the first 100"
          "Unknown badge"))))
)
