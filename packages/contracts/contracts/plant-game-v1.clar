;; ============================================================================
;; Plant Game Logic v1.0.0
;; ============================================================================
;; VERSIONABLE LOGIC LAYER - Can deploy v2, v3, etc. without losing data
;;
;; Purpose:
;;   - Implement game mechanics (watering, stage progression)
;;   - Read/write to plant-storage contract
;;   - Can be replaced with new version by deploying new contract
;;
;; Upgrade Pattern:
;;   - Deploy plant-game-v2.clar with new mechanics
;;   - Admin authorizes v2 in storage
;;   - Admin updates NFT to use v2 for update-owner calls
;;   - Users call v2.water() instead of v1.water()
;; ============================================================================

;; Constants - Plant Stages
(define-constant STAGE-SEED u0)
(define-constant STAGE-SPROUT u1)
(define-constant STAGE-PLANT u2)
(define-constant STAGE-BLOOM u3)
(define-constant STAGE-TREE u4)

;; Constants - Game Mechanics
;; TESTNET: Using u0 (no cooldown) for fast testing
;; PRODUCTION: Should be u144 (~24 hours at ~10 min/block)
(define-constant BLOCKS-PER-DAY u0)
(define-constant DAYS-TO-TREE u7)

;; Error Codes
(define-constant ERR-NOT-OWNER (err u100))
(define-constant ERR-PLANT-NOT-FOUND (err u101))
(define-constant ERR-COOLDOWN-ACTIVE (err u102))
(define-constant ERR-ALREADY-TREE (err u103))
(define-constant ERR-NOT-AUTHORIZED (err u105))

;; ============================================================================
;; PRIVATE FUNCTIONS
;; ============================================================================

;; Calculate stage based on growth points
;; 0-1 points = Seed, 2-3 = Sprout, 4-5 = Plant, 6 = Bloom, 7+ = Tree
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

;; ============================================================================
;; PUBLIC FUNCTIONS
;; ============================================================================

;; Water a plant (main gameplay action)
;; Anyone can call, but only owner will succeed
(define-public (water (token-id uint))
  (let
    (
      (plant-data (unwrap! (contract-call? .plant-storage get-plant token-id) ERR-PLANT-NOT-FOUND))
      (current-stage (get stage plant-data))
      (current-points (get growth-points plant-data))
      (last-water (get last-water-block plant-data))
      (plant-owner (get owner plant-data))
      (current-block block-height)
      (new-points (+ current-points u1))
      (new-stage (calculate-stage new-points))
      (stage-changed (not (is-eq current-stage new-stage)))
    )

    ;; Verify caller is the owner
    (asserts! (is-eq tx-sender plant-owner) ERR-NOT-OWNER)

    ;; Verify plant is not already a Tree
    (asserts! (< current-stage STAGE-TREE) ERR-ALREADY-TREE)

    ;; Verify cooldown has passed (skip check if never watered)
    (asserts!
      (or
        (is-eq last-water u0)
        (>= current-block (+ last-water BLOCKS-PER-DAY))
      )
      ERR-COOLDOWN-ACTIVE
    )

    ;; Update plant state in storage
    (try! (contract-call? .plant-storage update-plant-state
      token-id
      new-stage
      new-points
      current-block
    ))

    ;; Emit event if stage changed
    (if stage-changed
      (begin
        (print {
          event: "stage-changed",
          token-id: token-id,
          old-stage: current-stage,
          new-stage: new-stage,
          growth-points: new-points,
          block-height: current-block
        })

        ;; Emit special event when graduating to Tree
        (if (is-eq new-stage STAGE-TREE)
          (begin
            (print {
              event: "tree-graduated",
              token-id: token-id,
              block-height: current-block,
              total-waters: new-points
            })
            ;; Register graduation in Impact Registry
            ;; Note: This requires plant-game-v1 to be authorized as registrar
            (match (contract-call? .impact-registry register-graduation token-id plant-owner)
              success (begin
                (print {
                  event: "impact-registered",
                  token-id: token-id,
                  pool-size: (get total-in-pool success)
                })
                true
              )
              error (begin
                (print {
                  event: "impact-registration-failed",
                  token-id: token-id,
                  error-code: error
                })
                true
              )
            )
            true
          )
          true
        )
      )
      true
    )

    ;; Return success with new state
    (ok {
      new-stage: new-stage,
      growth-points: new-points,
      stage-changed: stage-changed
    })
  )
)

;; Update plant owner (called by NFT contract on transfer)
;; SECURITY: Only plant-nft contract can call this
(define-public (update-owner (token-id uint) (new-owner principal))
  (begin
    ;; Only the plant-nft contract can update ownership
    (asserts! (is-eq contract-caller .plant-nft) ERR-NOT-AUTHORIZED)
    ;; Delegate to storage
    (contract-call? .plant-storage update-plant-owner token-id new-owner)
  )
)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

;; Get complete plant state
(define-read-only (get-plant (token-id uint))
  (contract-call? .plant-storage get-plant token-id)
)

;; Get only the stage
(define-read-only (get-stage (token-id uint))
  (contract-call? .plant-storage get-stage token-id)
)

;; Get only the growth points
(define-read-only (get-growth-points (token-id uint))
  (contract-call? .plant-storage get-growth-points token-id)
)

;; Check if plant can be watered (cooldown check)
(define-read-only (can-water (token-id uint))
  (match (contract-call? .plant-storage get-plant token-id)
    plant-data
      (let
        (
          (last-water (get last-water-block plant-data))
          (current-stage (get stage plant-data))
        )
        (ok (and
          (< current-stage STAGE-TREE)
          (or
            (is-eq last-water u0)
            (>= block-height (+ last-water BLOCKS-PER-DAY))
          )
        ))
      )
    (err ERR-PLANT-NOT-FOUND)
  )
)

;; Get blocks remaining until next water is allowed
(define-read-only (get-blocks-until-water (token-id uint))
  (match (contract-call? .plant-storage get-plant token-id)
    plant-data
      (let
        (
          (last-water (get last-water-block plant-data))
          (next-water-block (+ last-water BLOCKS-PER-DAY))
        )
        (if (is-eq last-water u0)
          (ok u0)
          (if (>= block-height next-water-block)
            (ok u0)
            (ok (- next-water-block block-height))
          )
        )
      )
    (err ERR-PLANT-NOT-FOUND)
  )
)

;; Get plant owner
(define-read-only (get-plant-owner (token-id uint))
  (contract-call? .plant-storage get-plant-owner token-id)
)

;; Get stage name as string (helper for UI)
(define-read-only (get-stage-name (stage uint))
  (if (is-eq stage STAGE-SEED)
    "Seed"
    (if (is-eq stage STAGE-SPROUT)
      "Sprout"
      (if (is-eq stage STAGE-PLANT)
        "Plant"
        (if (is-eq stage STAGE-BLOOM)
          "Bloom"
          (if (is-eq stage STAGE-TREE)
            "Tree"
            "Unknown"
          )
        )
      )
    )
  )
)

;; Get current cooldown setting (for UI display)
(define-read-only (get-cooldown-blocks)
  BLOCKS-PER-DAY
)

;; Get version info
(define-read-only (get-version)
  {
    version: "1.0.0",
    cooldown-blocks: BLOCKS-PER-DAY,
    stages: u5
  }
)
