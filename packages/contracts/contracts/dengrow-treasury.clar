;; ============================================================================
;; DenGrow Treasury Contract v1.0.0
;; ============================================================================
;; Holds STX from mint revenue, pays tree-planting partners on redemption.
;;
;; Flow:
;;   1. Admin deposits accumulated mint revenue into this contract
;;   2. Admin calls redeem-with-payout(qty, proof-hash, proof-url)
;;   3. Treasury forwards qty * price-per-tree to partner wallet
;;   4. Treasury calls impact-registry.record-redemption for batch tracking
;;   5. Remainder stays in treasury for DenGrow operations
;;
;; STX holding: uses (as-contract tx-sender) -- the contract principal holds STX.
;; ============================================================================

;; ============================================================================
;; CONSTANTS
;; ============================================================================

(define-constant CONTRACT_ADMIN tx-sender)

;; Error codes
(define-constant ERR-ADMIN-ONLY (err u100))
(define-constant ERR-INVALID-AMOUNT (err u101))
(define-constant ERR-NO-PARTNER-SET (err u102))
(define-constant ERR-INSUFFICIENT-FUNDS (err u103))
(define-constant ERR-INVALID-PRICE (err u104))
(define-constant ERR-ZERO-QUANTITY (err u106))

;; Default price per tree: 0.5 STX = 500,000 microSTX
(define-constant DEFAULT-PRICE-PER-TREE u500000)

;; ============================================================================
;; DATA STORAGE
;; ============================================================================

;; Partner wallet that receives tree-planting payouts
(define-data-var partner-wallet (optional principal) none)

;; Price per tree in microSTX (admin-configurable)
(define-data-var price-per-tree uint DEFAULT-PRICE-PER-TREE)

;; Counters
(define-data-var total-deposited uint u0)
(define-data-var total-paid-out uint u0)
(define-data-var total-withdrawn uint u0)
(define-data-var total-redemptions uint u0)

;; ============================================================================
;; AUTHORIZATION
;; ============================================================================

(define-private (is-admin)
  (is-eq tx-sender CONTRACT_ADMIN)
)

;; ============================================================================
;; DEPOSIT -- anyone can send STX into treasury
;; ============================================================================

(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    ;; Transfer STX from sender to this contract's principal
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    ;; Track total deposits
    (var-set total-deposited (+ (var-get total-deposited) amount))
    (print {
      event: "treasury-deposit",
      from: tx-sender,
      amount: amount,
      block-height: block-height
    })
    (ok amount)
  )
)

;; ============================================================================
;; ADMIN: SET PARTNER WALLET
;; ============================================================================

(define-public (set-partner (new-partner principal))
  (begin
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    (var-set partner-wallet (some new-partner))
    (print {
      event: "partner-set",
      partner: new-partner,
      block-height: block-height
    })
    (ok new-partner)
  )
)

;; ============================================================================
;; ADMIN: SET PRICE PER TREE
;; ============================================================================

(define-public (set-price-per-tree (new-price uint))
  (begin
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    (asserts! (> new-price u0) ERR-INVALID-PRICE)
    (var-set price-per-tree new-price)
    (print {
      event: "price-updated",
      new-price: new-price,
      block-height: block-height
    })
    (ok new-price)
  )
)

;; ============================================================================
;; ADMIN: REDEEM WITH PAYOUT
;; ============================================================================
;; Atomically: records redemption in impact-registry AND pays partner.

(define-public (redeem-with-payout
    (quantity uint)
    (proof-hash (buff 32))
    (proof-url (string-ascii 256))
  )
  (let (
    (partner (unwrap! (var-get partner-wallet) ERR-NO-PARTNER-SET))
    (price (var-get price-per-tree))
    (payout (* quantity price))
    (treasury-balance (stx-get-balance (as-contract tx-sender)))
  )
    ;; Only admin
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    ;; Quantity must be positive
    (asserts! (> quantity u0) ERR-ZERO-QUANTITY)
    ;; Treasury must have enough funds
    (asserts! (>= treasury-balance payout) ERR-INSUFFICIENT-FUNDS)

    ;; 1. Record redemption in impact-registry (tx-sender propagates as admin)
    (try! (contract-call? .impact-registry record-redemption quantity proof-hash proof-url))

    ;; 2. Send payout from treasury to partner
    (try! (as-contract (stx-transfer? payout tx-sender partner)))

    ;; 3. Update counters
    (var-set total-paid-out (+ (var-get total-paid-out) payout))
    (var-set total-redemptions (+ (var-get total-redemptions) u1))

    (print {
      event: "redeem-with-payout",
      quantity: quantity,
      payout: payout,
      partner: partner,
      treasury-remaining: (- treasury-balance payout),
      block-height: block-height
    })

    (ok {
      quantity: quantity,
      payout: payout,
      partner: partner,
      treasury-remaining: (- treasury-balance payout)
    })
  )
)

;; ============================================================================
;; ADMIN: EMERGENCY WITHDRAW
;; ============================================================================

(define-public (withdraw (amount uint) (recipient principal))
  (begin
    (asserts! (is-admin) ERR-ADMIN-ONLY)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount (stx-get-balance (as-contract tx-sender))) ERR-INSUFFICIENT-FUNDS)
    ;; Transfer from contract to recipient
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    ;; Track withdrawals
    (var-set total-withdrawn (+ (var-get total-withdrawn) amount))
    (print {
      event: "treasury-withdraw",
      amount: amount,
      recipient: recipient,
      block-height: block-height
    })
    (ok amount)
  )
)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

;; All-in-one stats for the dashboard
(define-read-only (get-treasury-stats)
  {
    balance: (stx-get-balance (as-contract tx-sender)),
    partner: (var-get partner-wallet),
    price-per-tree: (var-get price-per-tree),
    total-deposited: (var-get total-deposited),
    total-paid-out: (var-get total-paid-out),
    total-withdrawn: (var-get total-withdrawn),
    total-redemptions: (var-get total-redemptions)
  }
)

;; Live STX balance
(define-read-only (get-treasury-balance)
  (stx-get-balance (as-contract tx-sender))
)

;; Current partner wallet
(define-read-only (get-partner)
  (var-get partner-wallet)
)

;; Current price per tree
(define-read-only (get-price-per-tree)
  (var-get price-per-tree)
)
