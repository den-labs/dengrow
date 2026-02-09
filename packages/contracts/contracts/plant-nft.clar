;; ============================================================================
;; Plant NFT Contract v2.0.0
;; ============================================================================
;; SIP-009 Compliant NFT with Upgradeable Architecture Support
;;
;; Purpose:
;;   - Manage NFT ownership (mint, transfer)
;;   - Sync plant state with storage on mint/transfer
;;   - Support upgradeable game logic via configurable game-logic reference
;;
;; Architecture:
;;   - Mint: Calls storage directly to initialize plant
;;   - Transfer: Calls active game-logic to update owner (preserves authorization chain)
;;   - Admin can update game-logic reference without redeploying NFT
;; ============================================================================

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token plant-nft uint)

;; Token ID counter
(define-data-var last-token-id uint u0)

;; Admin (set once at deployment)
(define-constant CONTRACT_OWNER tx-sender)
(define-constant COLLECTION_LIMIT u10000000)

;; Base URI for metadata
(define-data-var base-uri (string-ascii 80) "https://dengrow.app/api/metadata/{id}")

;; Error Codes
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_SOLD_OUT (err u300))
(define-constant ERR_INVALID_TIER (err u302))

;; ============================================================================
;; SIP-009 READ-ONLY FUNCTIONS
;; ============================================================================

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get base-uri)))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? plant-nft token-id))
)

;; ============================================================================
;; PUBLIC FUNCTIONS
;; ============================================================================

;; Transfer NFT to another owner
;; Also updates plant owner in game logic
(define-public (transfer
    (token-id uint)
    (sender principal)
    (recipient principal)
  )
  (begin
    ;; Verify sender owns the token
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    ;; Transfer the NFT
    (try! (nft-transfer? plant-nft token-id sender recipient))
    ;; Update plant owner via game logic (game-v1 calls storage.update-plant-owner)
    ;; This maintains the authorization chain: NFT -> game-v1 -> storage
    (try! (contract-call? .plant-game-v1 update-owner token-id recipient))
    (ok true)
  )
)

;; Mint a new NFT
;; Creates NFT and initializes plant in storage
(define-public (mint (recipient principal))
  (let ((token-id (+ (var-get last-token-id) u1)))
    ;; Admin only -- public minting uses mint-with-tier
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    ;; Check collection limit
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    ;; Mint the NFT
    (try! (nft-mint? plant-nft token-id recipient))
    ;; Initialize plant in storage (storage will verify NFT is authorized)
    (try! (contract-call? .plant-storage initialize-plant token-id recipient))
    ;; Update counter
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

;; ============================================================================
;; ADMIN FUNCTIONS
;; ============================================================================

;; Update base URI (admin only)
(define-public (set-base-uri (new-uri (string-ascii 80)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set base-uri new-uri))
  )
)

;; ============================================================================
;; TIER PRICING
;; ============================================================================

(define-constant TIER-BASIC u1000000)    ;; 1 STX
(define-constant TIER-PREMIUM u2000000)  ;; 2 STX
(define-constant TIER-IMPACT u3000000)   ;; 3 STX

(define-read-only (get-tier-price (tier uint))
  (if (is-eq tier u1) (some TIER-BASIC)
    (if (is-eq tier u2) (some TIER-PREMIUM)
      (if (is-eq tier u3) (some TIER-IMPACT) none))))

(define-read-only (get-mint-tier (token-id uint))
  (match (contract-call? .plant-storage get-extension-data "mint-tier" token-id)
    data (from-consensus-buff? uint (get value data))
    none))

;; Paid mint -- validates payment via stx-transfer before minting
(define-public (mint-with-tier (recipient principal) (tier uint))
  (let (
    (token-id (+ (var-get last-token-id) u1))
    (price (unwrap! (get-tier-price tier) ERR_INVALID_TIER))
  )
    (try! (stx-transfer? price tx-sender CONTRACT_OWNER))
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    (try! (nft-mint? plant-nft token-id recipient))
    (try! (contract-call? .plant-storage initialize-plant token-id recipient))
    (try! (contract-call? .plant-storage set-extension-data
      "mint-tier" token-id (unwrap-panic (to-consensus-buff? tier))))
    (var-set last-token-id token-id)
    (print { event: "paid-mint", token-id: token-id, tier: tier, price: price })
    (ok token-id)))
