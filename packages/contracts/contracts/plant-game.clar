;; Plant Game Contract
;; Manages plant growth state and watering mechanics

;; Constants - Plant Stages
(define-constant STAGE-SEED u0)
(define-constant STAGE-SPROUT u1)
(define-constant STAGE-PLANT u2)
(define-constant STAGE-BLOOM u3)
(define-constant STAGE-TREE u4)

;; Constants - Game Mechanics
(define-constant BLOCKS-PER-DAY u144) ;; Approx 1 day in Stacks (10min blocks)
(define-constant DAYS-TO-TREE u7) ;; 7 successful waters to reach Tree stage

;; Error Codes
(define-constant ERR-NOT-OWNER (err u100))
(define-constant ERR-PLANT-NOT-FOUND (err u101))
(define-constant ERR-COOLDOWN-ACTIVE (err u102))
(define-constant ERR-ALREADY-TREE (err u103))
(define-constant ERR-PLANT-ALREADY-EXISTS (err u104))
(define-constant ERR-NOT-AUTHORIZED (err u105))

;; Data Maps
;; Stores the state of each plant by token-id
(define-map plants
  { token-id: uint }
  {
    stage: uint,
    growth-points: uint,
    last-water-block: uint,
    owner: principal
  }
)

;; Private Functions

;; Calculate stage based on growth points
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

;; Public Functions

;; Initialize a new plant (called by plant-nft contract on mint)
(define-public (initialize-plant (token-id uint) (owner principal))
  (let
    (
      (existing-plant (map-get? plants { token-id: token-id }))
    )
    ;; Ensure plant doesn't already exist
    (asserts! (is-none existing-plant) ERR-PLANT-ALREADY-EXISTS)

    ;; Create initial plant state
    (ok (map-set plants
      { token-id: token-id }
      {
        stage: STAGE-SEED,
        growth-points: u0,
        last-water-block: u0,
        owner: owner
      }
    ))
  )
)

;; Water a plant (main gameplay action)
(define-public (water (token-id uint))
  (let
    (
      (plant-data (unwrap! (map-get? plants { token-id: token-id }) ERR-PLANT-NOT-FOUND))
      (current-stage (get stage plant-data))
      (current-points (get growth-points plant-data))
      (last-water (get last-water-block plant-data))
      (current-block block-height)
      (new-points (+ current-points u1))
      (new-stage (calculate-stage new-points))
      (stage-changed (not (is-eq current-stage new-stage)))
    )

    ;; Verify caller is the owner
    (asserts! (is-eq tx-sender (get owner plant-data)) ERR-NOT-OWNER)

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

    ;; Update plant state
    (map-set plants
      { token-id: token-id }
      {
        stage: new-stage,
        growth-points: new-points,
        last-water-block: current-block,
        owner: (get owner plant-data)
      }
    )

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

;; Update plant owner (called when NFT is transferred)
(define-public (update-owner (token-id uint) (new-owner principal))
  (let
    (
      (plant-data (unwrap! (map-get? plants { token-id: token-id }) ERR-PLANT-NOT-FOUND))
    )
    ;; Only the plant-nft contract can update ownership
    (asserts! (is-eq contract-caller .plant-nft) ERR-NOT-AUTHORIZED)

    ;; Update only the owner field, preserve all other state
    (ok (map-set plants
      { token-id: token-id }
      (merge plant-data { owner: new-owner })
    ))
  )
)

;; Read-Only Functions

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

;; Check if plant can be watered (cooldown check)
(define-read-only (can-water (token-id uint))
  (match (map-get? plants { token-id: token-id })
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
  (match (map-get? plants { token-id: token-id })
    plant-data
      (let
        (
          (last-water (get last-water-block plant-data))
          (next-water-block (+ last-water BLOCKS-PER-DAY))
        )
        (if (is-eq last-water u0)
          (ok u0) ;; Never watered, can water now
          (if (>= block-height next-water-block)
            (ok u0) ;; Cooldown expired, can water now
            (ok (- next-water-block block-height)) ;; Blocks remaining
          )
        )
      )
    (err ERR-PLANT-NOT-FOUND)
  )
)

;; Get plant owner
(define-read-only (get-plant-owner (token-id uint))
  (match (map-get? plants { token-id: token-id })
    plant-data (some (get owner plant-data))
    none
  )
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
