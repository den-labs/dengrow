# Partner Operations Manual

**Version:** 1.0
**Last Updated:** 2026-02-07
**Owner:** Operations Team
**Purpose:** Complete guide for managing tree planting partnerships

---

## Table of Contents

1. [Overview](#overview)
2. [Partner Selection](#partner-selection)
3. [Initial Contact & Negotiation](#initial-contact--negotiation)
4. [Partnership Agreement](#partnership-agreement)
5. [Weekly Redemption Workflow](#weekly-redemption-workflow)
6. [Communication Templates](#communication-templates)
7. [Payment & Invoicing](#payment--invoicing)
8. [Proof Collection & Verification](#proof-collection--verification)
9. [Emergency Procedures](#emergency-procedures)
10. [Partner Performance Review](#partner-performance-review)

---

## Overview

### What This Document Covers

This manual describes **all non-technical operations** for managing tree planting partnerships. It assumes the DenGrow app is complete and focuses solely on:

- Finding and vetting partners
- Negotiating terms
- Coordinating weekly redemptions
- Collecting proof
- Managing payments
- Handling issues

### What This Document Does NOT Cover

Technical operations are documented elsewhere:
- Contract deployment: See `DEPLOYMENT.md`
- Running redemption scripts: See `TESTNET_REDEMPTION_GUIDE.md`
- Web app maintenance: See `README.md`

### Roles & Responsibilities

**Operations Manager** (YOU):
- Manages partner relationship
- Coordinates redemption batches
- Collects proof and handles payments
- First point of contact for issues

**Tech Team**:
- Runs on-chain redemption script
- Maintains app and contracts
- Provides explorer links and verification

**Partner (Finca/Organization)**:
- Plants trees according to schedule
- Provides photographic proof
- Sends invoice/receipt
- Responds to verification requests

---

## Partner Selection

### Criteria for Ideal Partner

#### Must-Have ✅
- [ ] Located in region you can verify (Colombia preferred)
- [ ] Plants native species (no invasive or non-native)
- [ ] Can provide photo/video proof of planting
- [ ] Accepts payment in USD or STX
- [ ] Available via WhatsApp/phone (fast communication)
- [ ] Can plant minimum 5-10 trees per batch

#### Nice-to-Have 🌟
- [ ] Has existing conservation project
- [ ] Provides GPS coordinates
- [ ] Offers site visits for verification
- [ ] Experience with reforestation projects
- [ ] Lower cost per tree (<$3 USD)
- [ ] Bilingual (Spanish/English)

#### Deal-Breakers 🚫
- Cannot provide any proof of planting
- Only plants non-native/invasive species
- Requires advance payment >$100
- No communication in 48+ hours
- Price >$5 per tree
- Cannot scale beyond 5 trees/month

---

### Current Recommended Partner

**Jardín Botánico del Quindío**

**Why Recommended:**
- ✅ Authentic story ("Real trees in Colombian cloud forests")
- ✅ Lower cost: $2 USD per tree (negotiated from $5)
- ✅ Direct relationship: WhatsApp contact (3153349307)
- ✅ Visitability: Team can physically verify
- ✅ Photo/video proof: Personal and credible
- ✅ Supports local farmers and communities
- ✅ Native species focus: Yarumo, Guadua, Nogal Cafetero

**Contact Information:**
- **Phone:** 3153349307
- **Email:** investigaciones@jardinbotanicoquindio.org
- **Region:** 15 fincas in 6 municipalities (Quindío)
- **Website:** [Jardín Botánico del Quindío](https://jardinbotanicoquindio.org/)

**Alternative Partners:**
1. **Red de Guardianes de Semillas (RGSV)** - Valle del Cauca, grassroots network
2. **Direct Finca Partnership** - Through personal contacts
3. **One Tree Planted** - International, more expensive ($1+ USD), corporate

---

## Initial Contact & Negotiation

### Step 1: First Contact (Phone Call)

**When to Call:** Business hours (9 AM - 5 PM COT)

**Introduction Script (Spanish):**

```
Hola, mi nombre es [Tu Nombre] y llamo de DenGrow.

Somos un proyecto blockchain que conecta personas con reforestación real
en Colombia. Tenemos usuarios que están "graduando" árboles virtuales y
queremos convertirlos en árboles reales.

¿Ustedes tienen capacidad para plantar árboles nativos? Estamos buscando
un aliado local en Quindío.

[Wait for response]

Nuestra propuesta:
- Comenzaríamos con 5-10 árboles cada 2 semanas (fase piloto)
- Luego escalaríamos a 10-20 árboles mensuales
- Necesitamos fotos del proceso como prueba
- Pago en efectivo o transferencia
- Presupuesto: $2-3 USD por árbol

¿Les interesa? ¿Podríamos agendar una reunión para hablar más?
```

**English Translation (for reference):**

```
Hello, my name is [Your Name] and I'm calling from DenGrow.

We're a blockchain project that connects people with real reforestation
in Colombia. We have users "graduating" virtual trees and we want to
convert them into real trees.

Do you have the capacity to plant native trees? We're looking for a
local partner in Quindío.

[Wait for response]

Our proposal:
- We'd start with 5-10 trees every 2 weeks (pilot phase)
- Then scale to 10-20 trees monthly
- We need photos of the process as proof
- Payment in cash or transfer
- Budget: $2-3 USD per tree

Are you interested? Could we schedule a meeting to discuss further?
```

---

### Step 2: Follow-Up Meeting (In-Person or Video Call)

**Agenda:**
1. **Introduce DenGrow** (5 min)
   - Show the web app demo
   - Explain the concept: virtual plant → real tree
   - Share your mission and values

2. **Explain the Process** (10 min)
   - Users mint and grow virtual plants
   - When they reach "Tree" stage, they enter the Impact Pool
   - We redeem the pool weekly/bi-weekly
   - Partner plants real trees
   - We provide proof to users on-chain

3. **Negotiate Terms** (15 min)
   - **Quantity:** Start with 5-10 trees/batch, scale to 20+
   - **Frequency:** Bi-weekly (pilot), then monthly
   - **Species:** Native only (partner suggests best species)
   - **Cost:** Target $2 USD per tree (all-inclusive)
   - **Proof:** Photos via WhatsApp (before/during/after)
   - **Payment:** Within 3-5 days of receiving proof
   - **Timeline:** 1-3 days from request to planting

4. **Proof Requirements** (5 min)
   - Minimum 3 photos per batch:
     - Photo 1: Planting site (wide angle)
     - Photo 2: Seedlings/saplings being planted
     - Photo 3: Farmer/volunteer with planted trees
   - Optional: GPS coordinates, video clip
   - Sent via WhatsApp within 24 hours of planting

5. **Payment Terms** (5 min)
   - **Method:** Bank transfer, cash, or crypto (partner preference)
   - **Timeline:** Within 5 business days of proof receipt
   - **Invoice:** Partner sends simple invoice/receipt
   - **Currency:** USD or COP equivalent

6. **Trial Run** (5 min)
   - Propose a pilot: 5 trees to test the workflow
   - Set date for first planting (1-2 weeks out)
   - Exchange contact info (WhatsApp, phone, email)

**Questions to Ask Partner:**
- What native species do you recommend?
- What's your typical planting timeline?
- Do you need any advance notice?
- Who will be our main point of contact?
- Can we visit the site after planting?
- What payment method works best for you?

---

### Step 3: Partnership Agreement (Written)

**Simple Agreement Template:**

```
ACUERDO DE ASOCIACIÓN DENGROW
(DenGrow Partnership Agreement)

ENTRE (Between):
- DenGrow (Proyecto blockchain de reforestación)
- [Nombre del Partner] ([Partner Name])

FECHA (Date): [DD/MM/YYYY]

TÉRMINOS (Terms):

1. SERVICIO (Service):
   [Partner] plantará árboles nativos en [Region] según solicitud de DenGrow.
   ([Partner] will plant native trees in [Region] as requested by DenGrow.)

2. CANTIDAD Y FRECUENCIA (Quantity & Frequency):
   - Fase Piloto: 5-10 árboles cada 2 semanas
   - Producción: 10-20 árboles mensuales
   (Pilot: 5-10 trees every 2 weeks; Production: 10-20 trees monthly)

3. COSTO (Cost):
   $[X] USD por árbol, incluye semilla, siembra, y documentación.
   ($[X] USD per tree, includes seedling, planting, and documentation.)

4. ESPECIES (Species):
   Nativas de la región: [List species, e.g., Yarumo, Guadua, Nogal Cafetero]

5. PRUEBA (Proof):
   Mínimo 3 fotos por lote vía WhatsApp dentro de 24 horas.
   (Minimum 3 photos per batch via WhatsApp within 24 hours.)

6. PAGO (Payment):
   Transferencia bancaria dentro de 5 días hábiles tras recibir prueba.
   (Bank transfer within 5 business days after receiving proof.)

7. CONTACTO (Contact):
   - DenGrow: [Your Name], [Phone], [Email]
   - Partner: [Contact Name], [Phone], [Email]

8. VIGENCIA (Duration):
   Este acuerdo inicia [Fecha] y puede cancelarse con 30 días de aviso.
   (This agreement begins [Date] and may be canceled with 30 days notice.)

FIRMAS (Signatures):
_________________          _________________
DenGrow                    [Partner Name]
[Tu Nombre]                [Contact Name]
Fecha: [DD/MM/YYYY]        Fecha: [DD/MM/YYYY]
```

**Note:** This is a simple mutual agreement, not a legal contract. For formal legal agreements, consult a lawyer.

---

## Weekly Redemption Workflow

### Overview

**Frequency:** Bi-weekly (pilot), then monthly
**Schedule:** Every other Monday @ 10:00 AM COT
**Timeline:** 3-5 days total (request → planting → proof → payment)

---

### Monday: Check Pool & Contact Partner

#### 1. Check Impact Pool Size (9:00 AM)

**Technical Step (can be automated):**
```bash
cd packages/contracts
pnpm tsx scripts/check-pool.ts
```

**Expected Output:**
```
Total Graduated: X
Total Redeemed: Y
Current Pool: Z  ← This is what you need
```

**Decision Logic:**
- Pool < 5 trees → Skip this week, check again next Monday
- Pool 5-10 trees → Redeem 5 trees (pilot minimum)
- Pool 10-20 trees → Redeem 10 trees
- Pool 20-50 trees → Redeem 20 trees
- Pool > 50 trees → Redeem 25-30 trees (contact partner first)

---

#### 2. Contact Partner via WhatsApp (10:00 AM)

**Message Template (Spanish):**

```
Hola [Nombre del contacto]!

DenGrow aquí. Tenemos [X] árboles listos para redimir esta semana.

¿Pueden plantar [Y] árboles esta semana?
- Especies: [Las que acuerden, ej: Yarumo, Guadua]
- Fecha preferida: [Jueves o Viernes]
- Fotos: Por favor enviar después de plantar

Presupuesto: $[Y × precio] USD

¿Les funciona? Confirmen por favor 🌳
```

**English Translation:**

```
Hello [Contact Name]!

DenGrow here. We have [X] trees ready to redeem this week.

Can you plant [Y] trees this week?
- Species: [Agreed species, e.g., Yarumo, Guadua]
- Preferred date: [Thursday or Friday]
- Photos: Please send after planting

Budget: $[Y × price] USD

Does this work for you? Please confirm 🌳
```

**Wait for Confirmation:** Partner should respond within 24 hours.

---

#### 3. Document Request (Internal)

Create a simple tracking record:

**File:** `docs/redemptions/batch-[XXX]-request.txt`

```
Batch: [XXX]
Request Date: 2026-02-[DD]
Pool Size: [Z] trees
Quantity Requested: [Y] trees
Partner: [Name]
Expected Planting Date: 2026-02-[DD]
Estimated Cost: $[Y × price] USD
Status: REQUESTED
```

---

### Tuesday-Friday: Planting & Proof Collection

#### 4. Partner Plants Trees (Flexible Date)

**Partner's Responsibility:**
- Plants [Y] trees on agreed date
- Takes photos during/after planting
- Sends photos via WhatsApp within 24 hours

**Your Role:**
- Wait for confirmation
- Respond to any questions
- Be patient (planting takes 2-4 hours)

---

#### 5. Receive Proof via WhatsApp

**Expected Proof Package:**
- **Photo 1:** Planting site (wide angle showing location)
- **Photo 2:** Seedlings or saplings being planted
- **Photo 3:** Farmer/volunteer with planted trees
- **Optional:** GPS coordinates, short video, species close-up

**Verification Checklist:**
- [ ] Photos show actual planting (not stock photos)
- [ ] Location looks consistent with partner's region
- [ ] Species mentioned match what's in photos
- [ ] Date stamp or metadata matches expected date
- [ ] Quality is good enough for users to see

**If Proof is Insufficient:**
```
Gracias [Nombre]! Las fotos se ven bien, pero necesitamos una más
que muestre [lo que falta, ej: el sitio completo, las especies].

¿Pueden enviar esa foto adicional?
```

---

#### 6. Save Proof Locally

**File Structure:**
```
docs/redemptions/batch-[XXX]/
├── request.txt          (created Monday)
├── photo-01-site.jpg
├── photo-02-planting.jpg
├── photo-03-farmer.jpg
├── gps.txt              (optional)
└── proof-document.md    (created by you)
```

**Create Proof Document:**

**Template:** `docs/redemptions/batch-[XXX]/proof-document.md`

```markdown
# DenGrow Redemption Batch #[XXX]

**Date:** 2026-02-[DD]
**Location:** [Finca/Site Name], [Municipality], Quindío, Colombia
**Trees Planted:** [Y]
**Species:** [List species with counts]

---

## Planting Details

**Partner:** [Partner Organization Name]
**Farmer/Contact:** [Name]
**Contact Phone:** +57 [Phone]
**Verified by:** DenGrow Operations Team

---

## GPS Coordinates (if available)

- **Latitude:** [XX.XXXX]° N
- **Longitude:** [XX.XXXX]° W
- **Elevation:** [XXX] meters

---

## Species Breakdown

| Species          | Count | Native | Purpose                    |
|------------------|-------|--------|----------------------------|
| [Species 1]      | [N]   | Yes    | [e.g., Fast growth]        |
| [Species 2]      | [N]   | Yes    | [e.g., Erosion control]    |

---

## Photos

![Planting site](./photo-01-site.jpg)
*Photo 1: Planting site overview*

![Planting in progress](./photo-02-planting.jpg)
*Photo 2: Planting in progress*

![Farmer with trees](./photo-03-farmer.jpg)
*Photo 3: [Farmer Name] with planted trees*

---

## Impact Summary

- ✅ [Y] native trees planted in Colombian cloud forest
- ✅ Supports local farmer livelihood
- ✅ Carbon sequestration: ~[calc] tons CO2 over 10 years (estimated)
- ✅ Biodiversity: Habitat for native birds and insects
- ✅ Watershed protection: Erosion control

---

**Proof Verified:** 2026-02-[DD]
**Batch Recorded On-Chain:** [Will be added after tech team runs script]
**Transaction Hash:** [Will be added after tech team runs script]
```

---

### Friday: Upload Proof & Record On-Chain

#### 7. Upload Proof to Public Storage

**Option A: GitHub Gist (Quick & Free)**
1. Go to https://gist.github.com/
2. Create new gist: `dengrow-batch-[XXX].md`
3. Paste proof document content
4. Create public gist
5. Copy **raw URL**: `https://gist.githubusercontent.com/[user]/[id]/raw/[hash]/dengrow-batch-[XXX].md`

**Option B: IPFS (Decentralized - Recommended for Production)**
```bash
# Install IPFS CLI if needed
npm install -g ipfs

# Add proof document
ipfs add docs/redemptions/batch-[XXX]/proof-document.md

# Output: QmXXXXXXXX...
# Public URL: https://ipfs.io/ipfs/QmXXXXXXXX
```

**Option C: Google Drive (Temporary - Only for Pilot)**
1. Upload proof-document.md to shared Drive folder
2. Set sharing to "Anyone with link can view"
3. Copy shareable link

**Save Proof URL:**
Add to `request.txt`:
```
Proof URL: [URL from above]
Proof Uploaded: 2026-02-[DD]
```

---

#### 8. Request Tech Team to Record On-Chain

**Send Handoff Message to Tech Team:**

```
🌳 Batch #[XXX] Ready for On-Chain Recording

Quantity: [Y] trees
Proof URL: [URL from step 7]
Status: Verified ✅

Please run redemption script:
pnpm redeem -- --quantity [Y] --proof-url "[URL]"

Thanks!
```

**What Tech Team Will Do:**
1. Run redemption script (5 minutes)
2. Wait for transaction confirmation (~10 min on mainnet)
3. Send back transaction hash and explorer link

**You Will Receive:**
```
✅ Batch #[XXX] Recorded On-Chain

TX Hash: 0xabcd1234...
Explorer: https://explorer.hiro.so/txid/0xabcd1234...
Batch ID: u[XXX]
Confirmed: 2026-02-[DD] HH:MM
```

**Update Proof Document:**
Add TX info to bottom of `proof-document.md`:
```markdown
---

**Batch Recorded On-Chain:** 2026-02-[DD]
**Transaction Hash:** 0xabcd1234...
**Explorer Link:** https://explorer.hiro.so/txid/0xabcd1234...
**Batch ID:** u[XXX]
```

---

### Saturday: Payment & Announcement

#### 9. Process Payment to Partner

**Request Invoice from Partner (Friday evening):**

```
Hola [Nombre],

Los árboles ya están registrados on-chain! 🎉

¿Pueden enviar una factura/recibo por los [Y] árboles?
Total: $[Y × price] USD

Les transferimos esta semana.

Gracias por su trabajo! 🌳
```

**Expected Invoice Format:**
```
RECIBO / INVOICE

De (From): [Partner Name]
Para (To): DenGrow
Fecha (Date): 2026-02-[DD]

Concepto: Siembra de [Y] árboles nativos
(Concept: Planting of [Y] native trees)

Especies: [List]
Ubicación: [Location]

Costo por árbol: $[price] USD
Cantidad: [Y] árboles
Total: $[Y × price] USD

Método de pago: [Bank transfer / Cash]
[Bank details or payment instructions]

Firma (Signature): _______________
```

**Make Payment (Saturday):**
- Bank transfer: 1-2 business days
- Cash: Hand-delivered if local
- Crypto: Instant (if partner accepts STX/BTC)

**Confirm Payment:**
```
✅ Pago enviado!

Transferencia: $[amount] USD
Referencia: [Transaction ID if applicable]

Gracias por su excelente trabajo.
Siguiente lote en 2 semanas! 🌱
```

---

#### 10. Social Media Announcement (Optional but Recommended)

**Twitter/X Post Template:**

```
🌳 DenGrow Batch #[XXX] Complete!

✅ [Y] native trees planted in Quindío, Colombia
✅ Species: [List with emojis]
✅ Partner: [Partner Name]
✅ Proof verified on-chain

Thanks to our community for growing real impact! 🌱

📸 Proof: [Short link to proof]
🔗 Explorer: [Short link to TX]

#DenGrow #Reforestation #Web3ForGood #Stacks
```

**Discord/Community Post Template:**

```
🎉 Batch #[XXX] Redeemed!

Hey everyone! We just converted [Y] more virtual trees into REAL trees
in Colombia.

📍 Location: [Region]
🌲 Species: [List]
👨‍🌾 Partner: [Name]
🔗 On-Chain Proof: [Explorer link]

If your plant graduated recently, it might be in this batch! Check the
Impact Dashboard to see updated stats.

Next redemption in 2 weeks. Keep growing! 💚
```

---

## Communication Templates

### Weekly Reminder (Monday 9 AM)

**To Yourself:**
```
📅 DenGrow Monday Checklist
- [ ] Check pool size (pnpm tsx scripts/check-pool.ts)
- [ ] Contact partner if pool ≥ 5
- [ ] Create batch request doc
- [ ] Set calendar reminder for proof collection
```

---

### Proof Request Follow-Up (If no response in 48h)

**WhatsApp Message:**

```
Hola [Nombre],

Espero que todo esté bien. Solo quiero confirmar:
¿Pudieron plantar los [Y] árboles esta semana?

No hay prisa, solo quiero saber el estado.

Gracias! 🌳
```

---

### Thank You Message (After Each Batch)

**WhatsApp Message:**

```
Gracias [Nombre]! 🎉

Batch #[XXX] ya está completo:
✅ [Y] árboles plantados
✅ Fotos recibidas
✅ Registrado on-chain
✅ Pago enviado

Excelente trabajo. Nos hablamos en 2 semanas para el próximo lote.

Saludos! 🌱
```

---

## Payment & Invoicing

### Payment Methods

**Bank Transfer (Recommended):**
- Pros: Formal record, invoiceable, trackable
- Cons: 1-2 day delay, may have fees
- Best for: Regular monthly payments

**Cash (Pilot Phase):**
- Pros: Instant, no fees, simple
- Cons: No automatic record, requires in-person
- Best for: Local partners, small amounts (<$50)

**Cryptocurrency (Future):**
- Pros: Instant, low fees, on-chain
- Cons: Partner needs crypto wallet, volatility
- Best for: Tech-savvy partners

---

### Invoice Template (If Partner Doesn't Have One)

**Share this with partner:**

```
RECIBO SIMPLE
Simple Receipt

De / From: [Partner Name]
Para / To: DenGrow
Fecha / Date: [DD/MM/YYYY]

DETALLE / DETAILS:
- Servicio: Plantación de árboles nativos
  (Service: Planting of native trees)
- Cantidad: [Y] árboles
  (Quantity: [Y] trees)
- Costo unitario: $[price] USD por árbol
  (Unit cost: $[price] USD per tree)
- Total: $[Y × price] USD

PAGO / PAYMENT:
Método: [Transferencia bancaria / Efectivo]
Cuenta: [Bank details if transfer]

Firma / Signature: __________________
[Partner Name]
[Date]
```

---

### Payment Tracking Spreadsheet

**Create:** `docs/finances/payment-log.csv`

```csv
Date,Batch,Partner,Quantity,Cost_Per_Tree,Total_USD,Payment_Method,Status,Notes
2026-02-07,001,Jardín Botánico,5,2.00,10.00,Bank Transfer,Paid,Initial pilot
2026-02-21,002,Jardín Botánico,10,2.00,20.00,Bank Transfer,Paid,
2026-03-07,003,Jardín Botánico,10,2.00,20.00,Bank Transfer,Pending,
```

---

## Proof Collection & Verification

### Minimum Proof Requirements

**Essential (Required for Every Batch):**
- [ ] 3+ photos showing planting process
- [ ] Photos taken within 7 days of planting
- [ ] Clear view of location and trees
- [ ] Species identifiable (or partner confirms)
- [ ] Date/timestamp metadata (check photo properties)

**Optional (Nice-to-Have):**
- [ ] GPS coordinates
- [ ] Short video (10-30 seconds)
- [ ] Partner/farmer in photo
- [ ] Multiple angles of site
- [ ] Close-up of seedlings

---

### Red Flags (Reject or Request More Proof)

**⚠️ Warning Signs:**
- Stock photos or generic tree images
- Photos from different seasons/locations
- No consistent location across photos
- Refusal to provide additional photos
- Photos dated weeks before/after claimed date
- Species don't match region

**Action if Red Flags Detected:**
```
Hola [Nombre],

Gracias por las fotos. Para verificación, necesitamos algunas fotos
adicionales:
- [Specify what's needed]

Esto es importante para transparencia con nuestra comunidad.

¿Pueden enviar esas fotos?
```

**If Partner Refuses:**
- Do NOT pay until proof is satisfactory
- Escalate to team discussion
- Consider finding alternate partner

---

### Proof Quality Standards

**Good Quality Example:**
- Resolution: ≥1080p (phone cameras are fine)
- Lighting: Natural daylight, not blurry
- Framing: Clear view of subject
- Context: Location recognizable

**Bad Quality Example:**
- Resolution: <480p, pixelated
- Lighting: Too dark, overexposed
- Framing: Subject not visible
- Context: Can't tell where it was taken

---

## Emergency Procedures

### Scenario 1: Partner Doesn't Respond (48+ Hours)

**Step 1:** Send follow-up via WhatsApp (see template above)
**Step 2:** Call directly if no response in 24h
**Step 3:** If still no response in 5 days:
  - Skip redemption this week
  - Contact alternate partner
  - Review partnership agreement

---

### Scenario 2: Partner Can't Fulfill Request

**Partner Message:**
```
Lo siento, esta semana no podemos plantar [Y] árboles por [razón].
```

**Your Response:**
```
No hay problema! ¿Cuántos árboles sí pueden plantar?

Opciones:
- Plantar menos esta semana ([X] árboles)
- Posponer para la próxima semana
- Plantar en 2 lotes (parte esta semana, parte la siguiente)

¿Qué prefieren?
```

**Decision Logic:**
- Can plant ≥5 trees → Accept reduced quantity
- Can plant <5 trees → Postpone to next week
- Recurring issues → Consider backup partner

---

### Scenario 3: Proof Looks Suspicious

**Action Plan:**
1. **Request Additional Photos:**
   ```
   Gracias por las fotos. Para verificación interna, ¿pueden enviar
   algunas fotos adicionales?:
   - Foto desde otro ángulo
   - Video corto del sitio (10 segundos)
   - Foto con una referencia (ej: periódico del día)
   ```

2. **Schedule Site Visit (If Local):**
   ```
   Me gustaría visitar el sitio para ver los árboles en persona.
   ¿Cuándo sería un buen momento para visitarlos?
   ```

3. **Hold Payment Until Verified:**
   - Do NOT pay if proof is inadequate
   - Document concerns internally
   - Discuss with team before proceeding

4. **Terminate Partnership if Fraud Confirmed:**
   - Send formal termination notice
   - Find alternate partner immediately
   - Update community with transparency

---

### Scenario 4: Payment Delayed (Your Side)

**If You Can't Pay on Time:**
```
Hola [Nombre],

El pago estará un poco retrasado por [razón]. Estimamos pagar
el [Date].

Disculpas por el inconveniente. ¿Les funciona?
```

**Partner May Request:**
- Advance payment for next batch
- Alternative payment method
- Payment schedule adjustment

**Golden Rule:** Be transparent and communicate early.

---

## Partner Performance Review

### Monthly Review Checklist

**Every Month, Review:**
- [ ] Number of batches completed
- [ ] Average response time
- [ ] Proof quality consistency
- [ ] Cost per tree (any changes?)
- [ ] Issues or concerns
- [ ] Overall satisfaction (yours and partner's)

---

### Quarterly Partner Evaluation

**Scorecard Template:**

```
PARTNER: [Name]
QUARTER: Q[X] 2026
EVALUATION DATE: [Date]

METRICS:
- Batches Completed: [N] / [Target]
- Trees Planted: [N] total
- Average Response Time: [X] hours
- Proof Quality: [Excellent / Good / Fair / Poor]
- Cost Stability: [Stable / Increasing / Decreasing]
- Communication: [Excellent / Good / Fair / Poor]

STRENGTHS:
- [What went well]
- [Positive highlights]

AREAS FOR IMPROVEMENT:
- [What could be better]
- [Constructive feedback]

RECOMMENDATION:
[ ] Continue partnership - no changes
[ ] Continue - negotiate new terms
[ ] Put on probation - address issues
[ ] Terminate - find replacement

NOTES:
[Additional comments]
```

---

### When to Consider Changing Partners

**Warning Signs:**
- Consistent delays (>3 times in 3 months)
- Declining proof quality
- Unresponsiveness (<48h response time)
- Price increases without justification
- Unwillingness to verify claims
- Community feedback indicates distrust

**Transition Plan:**
1. Identify 2-3 backup partners
2. Initiate contact with top candidate
3. Run pilot batch with new partner
4. Notify current partner with 30 days notice
5. Complete transition within 60 days

---

## Appendix: Quick Reference

### Partner Contact Template (Save in Phone)

```
📱 PARTNER CONTACT

Name: [Full Name]
Organization: [Organization]
Role: [Role]
Phone: +57 [Number]
WhatsApp: +57 [Number]
Email: [Email]
Region: [Region]

Agreement Date: [Date]
Cost per Tree: $[X] USD
Preferred Contact: [WhatsApp / Phone / Email]

Notes:
- [Any important context]
- [Special considerations]
```

---

### Weekly Schedule At-a-Glance

| Day | Time | Task |
|-----|------|------|
| **Monday** | 9:00 AM | Check pool size |
| **Monday** | 10:00 AM | Contact partner (if pool ≥ 5) |
| **Monday** | 11:00 AM | Create batch request doc |
| **Tuesday-Thursday** | Flexible | Partner plants trees |
| **Thursday-Friday** | As received | Receive proof via WhatsApp |
| **Friday** | Afternoon | Verify proof, upload, request on-chain |
| **Friday** | Evening | Request invoice from partner |
| **Saturday** | Morning | Process payment |
| **Saturday** | Afternoon | Social media announcement |

---

### Emergency Contacts

**DenGrow Tech Team:**
- Name: [Name]
- WhatsApp: [Number]
- Email: [Email]
- Available: [Hours]

**DenGrow Operations Lead:**
- Name: [Your Name]
- WhatsApp: [Your Number]
- Email: [Your Email]

**Backup Partner (if current unavailable):**
- Name: [Name]
- Phone: [Number]
- Cost: $[X] per tree

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-07 | Initial operations manual created |

---

**Questions or Issues?**

This manual is a living document. If you encounter scenarios not covered here:
1. Document what happened
2. How you resolved it
3. Update this manual with the new procedure

---

**End of Manual**
