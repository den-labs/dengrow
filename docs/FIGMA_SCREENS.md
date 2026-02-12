# DenGrow — Screen Map for Figma

> Documento de referencia para diseño UI/UX. Describe todas las pantallas, estados y componentes de la app web DenGrow.

**Producto:** DenGrow — juego NFT on-chain de plantas en Stacks (Bitcoin L2)
**Stack visual:** shadcn/ui + Tailwind CSS + Next.js 14
**Paleta principal:** Green (crecimiento), Purple (logros), Teal (sponsors), Orange (graduacion)

---

## Tabla de contenidos

1. [Navegacion global](#1-navegacion-global)
2. [Home `/`](#2-home)
3. [My Plants `/my-plants`](#3-my-plants)
4. [Plant Detail `/my-plants/[tokenId]`](#4-plant-detail)
5. [Leaderboard `/leaderboard`](#5-leaderboard)
6. [Achievements `/achievements`](#6-achievements)
7. [Impact Dashboard `/impact`](#7-impact-dashboard)
8. [Batch Detail `/impact/batch/[id]`](#8-batch-detail)
9. [Sponsor `/impact/sponsor`](#9-sponsor)
10. [Estados compartidos](#10-estados-compartidos)
11. [Sistema de color](#11-sistema-de-color)
12. [Componentes reutilizables](#12-componentes-reutilizables)

---

## 1. Navegacion global

### Navbar (persistente en todas las pantallas)

**Desktop:**
| Elemento | Descripcion |
|----------|-------------|
| Logo | "DenGrow" con icono de planta, link a `/` |
| Nav links | My Plants · Leaderboard · Badges · Impact |
| Network Selector | Dropdown: Testnet / Devnet / Mainnet |
| Connect Wallet | Boton primario verde |

**Desktop — wallet conectada:**
| Elemento | Descripcion |
|----------|-------------|
| Direccion | Pill gris con address truncada `ST23S...3NJZ` |
| Boton copiar | Icono copy con tooltip "Copy address" |
| Boton desconectar | Icono power con tooltip "Disconnect" |

**Mobile:**
| Elemento | Descripcion |
|----------|-------------|
| Logo | "DenGrow" |
| Hamburger icon | Abre Sheet (drawer lateral derecho) |
| Sheet content | Links de navegacion apilados verticalmente + Network Selector + Connect Wallet |

---

## 2. Home

**Ruta:** `/`

### Estado unico (siempre visible, contenido estatico)

```
┌─────────────────────────────────────┐
│           [Navbar]                   │
├─────────────────────────────────────┤
│                                     │
│         🌱 DenGrow                  │
│   "Mint a plant NFT, water it       │
│    daily, and graduate it into       │
│    the Impact Pool..."              │
│                                     │
│   [On-chain growth] [Weekly impact] │
│                                     │
│   [View My Plants]  [Mint a Plant]  │
│     (green solid)    (green outline)│
│                                     │
├─────────────────────────────────────┤
│  Mint Tiers (3 columnas)            │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │Basic│  │Prem.│  │Impact│         │
│  │1 STX│  │2 STX│  │3 STX │         │
│  │desc. │  │desc. │  │desc.  │        │
│  └─────┘  └─────┘  └─────┘         │
│                                     │
├─────────────────────────────────────┤
│  Daily Care Loop                    │
│  "Water daily → 7 days = Tree       │
│   → Impact Pool"                    │
└─────────────────────────────────────┘
```

**Elementos interactivos:**
- 2 CTA buttons (View My Plants → `/my-plants`, Mint a Plant → `/my-plants`)
- 3 Tier cards (click → `/my-plants`)

---

## 3. My Plants

**Ruta:** `/my-plants`

### Estado A: Wallet no conectada
- Mensaje centrado: "Please connect your wallet to view your plants"

### Estado B: Cargando
- Spinner centrado (Loader2 animado)

### Estado C: Conectado (pantalla principal)

```
┌─────────────────────────────────────────┐
│  My Plants                    [h1]       │
├─────────────────────────────────────────┤
│  ┌─ Mint a Plant NFT ──────────────┐   │
│  │  "Choose your tier and start     │   │
│  │   growing"                       │   │
│  │                                  │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐     │   │
│  │  │Basic │ │Prem. │ │Impact│     │   │
│  │  │1 STX │ │2 STX │ │3 STX │     │   │
│  │  │ ● ←──│ │      │ │      │     │   │
│  │  └──────┘ └──────┘ └──────┘     │   │
│  │  (seleccionado = borde color)    │   │
│  │                                  │   │
│  │  [Mint Basic Plant — 1 STX]      │   │
│  │        (boton verde full-width)  │   │
│  │                                  │   │
│  │  Balance: 12.50 STX             │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │PlantCard│ │PlantCard│ │PlantCard│     │
│  └────────┘ └────────┘ └────────┘      │
│  (grid 3 cols desktop, 1 col mobile)   │
└─────────────────────────────────────────┘
```

**Tier card — estados:**
| Estado | Visual |
|--------|--------|
| No seleccionado | Borde gris, fondo blanco |
| Seleccionado | Borde 2px color del tier, fondo tenue |
| Hover | Sombra leve |

**Mint button — estados:**
| Estado | Texto | Color |
|--------|-------|-------|
| Listo | "Mint {Tier} Plant — {X} STX" | Color del tier |
| Balance insuficiente | "Insufficient balance (need X STX)" | Gris, disabled |
| Mintando | "Minting..." + spinner | Color del tier, disabled |

**Balance — estados:**
| Estado | Visual |
|--------|--------|
| Suficiente | Texto gris pequeno: "Balance: X.XX STX" |
| Insuficiente | Texto rojo: "Balance: X.XX STX — need ~Y more STX" |

**Post-mint:**
- Link azul: "View your latest transaction" con icono external-link

---

## 4. Plant Detail

**Ruta:** `/my-plants/[tokenId]`

### Estado A: Wallet no conectada
- Mensaje centrado: "Please connect your wallet to view this plant"

### Estado B: Cargando
- Spinner + "Loading plant data..."

### Estado C: Planta no encontrada
- "Plant #X not found" + boton "Back to My Plants"

### Estado D: Planta cargada (layout 2 columnas)

```
┌───────────────────────────────────────────────┐
│  [← Back]                                      │
├──────────────────┬────────────────────────────┤
│                  │                             │
│  ┌────────────┐  │  Plant #42                  │
│  │            │  │  [Premium Tier] badge        │
│  │   Imagen   │  │  "🌿 Seedling — Growing     │
│  │  1:1 ratio │  │   steadily..."              │
│  │            │  │                             │
│  │[Tier badge]│  │  ┌──────────┬──────────┐   │
│  │  [Stage]   │  │  │ Stage    │ Growth   │   │
│  └────────────┘  │  │ 🌿 Seed- │ 4/7      │   │
│                  │  │  ling    │ 3 more   │   │
│  ┌────────────┐  │  └──────────┴──────────┘   │
│  │[Water 💧]  │  │                             │
│  │[Water+Tip] │  │  Growth Progress            │
│  └────────────┘  │  [████████░░░] 57%          │
│                  │                             │
│  View tx ↗      │  Growth Journey              │
│                  │  ●───●───●───○───○          │
│                  │  Seed Spr  Sdlg Veg  Tree   │
│                  │                             │
│                  │  On-Chain Data               │
│                  │  Token ID: #42              │
│                  │  Mint Tier: Premium (2 STX) │
│                  │  Owner: ST23S...3NJZ        │
│                  │  Last Watered: Block #1234  │
│                  │  Cooldown: None (Testnet)   │
│                  │                             │
│                  │  Traits                      │
│                  │  ┌─────┐ ┌─────┐            │
│                  │  │ Pot │ │ BG  │            │
│                  │  │🔴Red│ │🔵Blu│            │
│                  │  │Rare │ │Com. │            │
│                  │  └─────┘ └─────┘            │
│                  │  ┌─────┐ ┌─────┐            │
│                  │  │Flwr │ │Comp │            │
│                  │  │🟡Ylw│ │🟢Grn│            │
│                  │  │Leg. │ │Unc. │            │
│                  │  └─────┘ └─────┘            │
├──────────────────┴────────────────────────────┤
│  (Seccion Impact Pool — solo si es Tree)       │
└───────────────────────────────────────────────┘
```

**Water buttons — estados:**
| Estado | Botones | Color |
|--------|---------|-------|
| Puede regar | "Water 💧" + "Water + Tip (X STX)" | Azul |
| Cooldown activo | "Cooldown Active ⏳" (1 boton disabled) | Gris |
| Graduado (Tree) | "Graduated to Impact Pool 🌳" (disabled) | Naranja |
| Transaccion pendiente | "Confirming..." + spinner | Naranja |

**Growth Journey (timeline):**
- 5 circulos conectados por linea
- Alcanzados: circulo con color + emoji, texto oscuro
- No alcanzados: circulo gris, texto gris
- Milestones: Seed (0), Sprout (2), Seedling (4), Vegetative (5), Tree (7)

**Trait rarity badges:**
| Rareza | Color |
|--------|-------|
| Common | Gris |
| Uncommon | Verde |
| Rare | Azul |
| Legendary | Naranja/dorado |

### Estado E: Planta graduada (seccion adicional)

Aparece debajo del layout principal:

```
┌─────────────────────────────────────┐
│  🎉 Your Tree is in the Impact Pool │  (o 🌍 "Real Impact Made!" si redimido)
│  [In Pool] badge naranja             │  (o [Redeemed] badge verde)
│  Graduated at block #5678           │
│  "Your tree represents real-world   │
│   environmental impact..."          │
├─────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │In Pool│ │Redeem│ │Batch │       │
│  │  12   │ │  8   │ │  3   │       │
│  │trees  │ │trees │ │done  │       │
│  └──────┘ └──────┘ └──────┘       │
│  [████████████░░] 40% redeemed     │
├─────────────────────────────────────┤
│  [Mint Another Plant] [View Impact] │
└─────────────────────────────────────┘
```

---

## 5. Leaderboard

**Ruta:** `/leaderboard`

### Estado A: Sin red/wallet
- "Please connect your wallet to view the leaderboard"

### Estado B: Cargando
- Spinner verde + "Loading leaderboard..."

### Estado C: Error
- "Unable to load leaderboard" + subtexto sobre contratos

### Estado D: Cargado

```
┌──────────────────────────────────────────┐
│          🏆 Leaderboard                   │
│  "See who's growing the most impact..."  │
├──────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Minted│ │Gradu.│ │Active│ │Unique│   │
│  │  42  │ │  12  │ │  28  │ │  15  │   │
│  │plants│ │trees │ │in prg│ │addrs │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│  (verde)  (naranja) (azul)  (morado)   │
├──────────────────────────────────────────┤
│  [Top Plants] [Top Growers] [Recent]     │
│  ─────────────────────────────────────   │
│                                          │
│  Tab: Top Plants (tabla)                 │
│  ┌────┬────────┬────────┬─────┬────┬──┐ │
│  │Rank│Plant   │Owner   │Stage│Grow│▓▓│ │
│  ├────┼────────┼────────┼─────┼────┼──┤ │
│  │🥇1 │Plant #1│ST23..NJ│🌳Tree│7/7 │██│ │
│  │🥈2 │Plant #5│ST1Q..AB│🌿Veg │5/7 │▓░│ │
│  │🥉3 │Plant #3│ST23..NJ│🌱Sprt│3/7 │▓░│ │
│  │ 4  │Plant #8│ST8F..CD│🌱Seed│1/7 │░░│ │
│  └────┴────────┴────────┴─────┴────┴──┘ │
│                                          │
│  Tab: Top Growers (tabla)                │
│  Rank | Grower | Plants | Trees | Points │
│                                          │
│  Tab: Recent Activity (tabla)            │
│  Plant | Owner | Stage | Last Watered    │
└──────────────────────────────────────────┘
```

**Rank display:**
| Posicion | Color | Formato |
|----------|-------|---------|
| 1st | Dorado (yellow-400) | Bold |
| 2nd | Plata (gray-400) | Bold |
| 3rd | Bronce (orange-400) | Bold |
| 4th+ | Gris claro (gray-200) | Normal |

**Tabs:** 3 pestanas con contenido de tabla independiente. Cada tab muestra empty state con emoji 🌱 si no hay datos.

---

## 6. Achievements

**Ruta:** `/achievements`

### Estado A: Wallet no conectada
- "🏅 Connect your wallet to view achievements"

### Estado B: Cargando
- Spinner morado + "Loading achievements..."

### Estado C: Cargado

```
┌──────────────────────────────────────┐
│         🏅 Achievements               │
│  "Earn badges by growing your        │
│   plants and contributing..."        │
├──────────────────────────────────────┤
│  Badge Progress          [2/4]       │
│  [██████████░░░░░] 50%              │
├──────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐  │
│  │ 🌱 First Seed │ │ 🌳 First Tree│  │
│  │ [Earned] ✓    │ │ [Claim Badge]│  │
│  │ block #1234   │ │              │  │
│  └──────────────┘ └──────────────┘  │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ 👍 Green Thumb│ │ ⭐ Early Adpt│  │
│  │ [Claim Badge] │ │ [Claim Badge]│  │
│  │              │ │              │  │
│  └──────────────┘ └──────────────┘  │
├──────────────────────────────────────┤
│  💡 How Badges Work                  │
│  "Badges are soulbound achievements  │
│   recorded on-chain..."             │
└──────────────────────────────────────┘
```

**Badge card — estados:**

| Estado | Borde | Icono | Boton | Opacidad |
|--------|-------|-------|-------|----------|
| No ganado | Fino gris | Grayscale, fondo gray-100 | "Claim Badge" (outline morado) | 70% |
| Reclamando | Fino gris | Grayscale | "Claiming..." + spinner (disabled) | 70% |
| Ganado | 2px morado-300 | Color, fondo purple-100 | Ninguno, muestra "Earned" badge | 100% |

**Badges disponibles:**
| ID | Icono | Nombre | Condicion |
|----|-------|--------|-----------|
| 1 | 🌱 | First Seed | Tener ≥1 planta |
| 2 | 🌳 | First Tree | Tener ≥1 arbol (stage ≥ 4) |
| 3 | 👍 | Green Thumb | Tener ≥3 arboles |
| 4 | ⭐ | Early Adopter | Planta con ID ≤ 200 |

---

## 7. Impact Dashboard

**Ruta:** `/impact`

### Estado A: Sin red
- "Please connect your wallet to view impact data"

### Estado B: Cargando
- Spinner verde + "Loading impact data..."

### Estado C: Error
- "Unable to load impact data" + subtexto

### Estado D: Sin graduados (empty state)
- Card verde: "🌱 No trees graduated yet — Be the first..."

### Estado E: Dashboard completo

```
┌──────────────────────────────────────────────┐
│            🌍 Impact Dashboard                │
│  "Track the real-world impact of graduated    │
│   DenGrow plants"                            │
├──────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │🌳 Grad│ │🌲 Pool│ │🌍 Redm│ │📦 Btch│      │
│  │  20   │ │  12  │ │  8   │ │  3   │       │
│  │plants │ │await │ │impact│ │oper. │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
├──────────────────────────────────────────────┤
│  Redemption Progress          [40%]          │
│  [████████░░░░░░░░░░]                       │
│  8 redeemed | 12 in pool | 20 total         │
├──────────────────────────────────────────────┤
│  ┌─ Admin Panel (solo deployer) ──────────┐ │
│  │  Treasury Status                        │ │
│  │  Balance: 15.5 STX | Partner: ST... |   │ │
│  │  Price/Tree: 1.5 STX                   │ │
│  │                                         │ │
│  │  Quantity: [NumberInput min=1 max=12]    │ │
│  │  STX Preview: "5 trees × 1.5 = 7.5 STX"│ │
│  │  Proof URL: [________________]          │ │
│  │  [Redeem & Pay (5 trees = 7.5 STX)]    │ │
│  │                                         │ │
│  │  ▼ Show Treasury Config                 │ │
│  │  (collapsed: Set Partner, Set Price,    │ │
│  │   Deposit, Stats)                       │ │
│  └─────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  How It Works (3 columnas)                   │
│  💧 Grow → 🌳 Graduate → 🌍 Real Impact     │
├──────────────────────────────────────────────┤
│  Mint Tiers & Impact (3 columnas)            │
│  Basic 1 STX | Premium 2 STX | Impact 3 STX │
├──────────────────────────────────────────────┤
│  Recent Redemptions                          │
│  [#1] 5 trees redeemed → View batch ↗      │
│  [#2] 3 trees redeemed → View batch ↗      │
├──────────────────────────────────────────────┤
│  ┌─ 🤝 Sponsor a batch ─────────────┐      │
│  │  Fund real-world tree planting     │      │
│  │  with on-chain attribution  →     │      │
│  └───────────────────────────────────┘      │
└──────────────────────────────────────────────┘
```

**Admin panel — warnings (condicionales):**
| Condicion | Visual |
|-----------|--------|
| Sin partner wallet configurado | Alert rojo: "No partner wallet set..." |
| Fondos insuficientes en treasury | Alert rojo: "Insufficient treasury funds..." |

**Admin treasury config (expandible):**
- Set Partner Wallet: input + boton
- Set Price per Tree: NumberInput + boton
- Deposit to Treasury: NumberInput + boton
- Stats: total deposited / paid out / withdrawn / redemption count

---

## 8. Batch Detail

**Ruta:** `/impact/batch/[id]`

### Estado A: Sin red
- "Please connect your wallet to view batch data"

### Estado B: ID invalido
- "Invalid batch ID" + boton back

### Estado C: Cargando
- Spinner naranja + "Loading batch #X..."

### Estado D: No encontrado
- "Batch #X not found" + subtexto + boton back

### Estado E: Cargado

```
┌──────────────────────────────────────┐
│  Impact Dashboard / Batch #3         │
├──────────────────────────────────────┤
│  📦 Batch #3                         │
│  [Verified] [Sponsored]              │
│  "Redemption proof recorded on-chain"│
├──────────────────────────────────────┤
│  Batch Details                       │
│  Trees Redeemed:    5 trees          │
│  ─────────────────────────           │
│  Block Height:      `123456`         │
│  ─────────────────────────           │
│  Recorded By:       ST23S...3NJZ     │
├──────────────────────────────────────┤
│  Proof of Impact                     │
│  Proof URL:    https://proof... ↗   │
│  ─────────────────────────           │
│  SHA-256 Hash: `a3f8c2...`          │
├──────────────────────────────────────┤
│  🤝 Sponsored By (card teal)         │
│  Sponsor:    "DenLabs Foundation"    │
│  Amount:     5.0 STX                │
│  Address:    ST8F...CD              │
│  Block:      `123460`               │
├──────────────────────────────────────┤
│  [← Batch #2]  [All Batches]  [#4 →]│
└──────────────────────────────────────┘
```

**Variante: Sin sponsor**
- En lugar de "Sponsored By", muestra CTA con borde dashed teal: "Sponsor this batch — Min 1 STX" → link a `/impact/sponsor`

---

## 9. Sponsor

**Ruta:** `/impact/sponsor`

### Estado A: Wallet no conectada
- "🤝 Connect your wallet to sponsor a batch"

### Estado B: Cargado

```
┌──────────────────────────────────────┐
│  Impact Dashboard / Sponsor a Batch  │
├──────────────────────────────────────┤
│        Sponsor a Batch               │
│  "Fund real-world tree planting      │
│   with on-chain attribution"         │
├──────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Total │ │Avail.│ │Minim.│        │
│  │25 STX│ │  3   │ │1 STX │        │
│  │from 4│ │batch │ │per sp│        │
│  └──────┘ └──────┘ └──────┘        │
├──────────────────────────────────────┤
│  Sponsorship Details                 │
│                                      │
│  Batch ID *                          │
│  [NumberInput: 1 - 3]               │
│  "Select a batch (1 to 3). Batches ↗│
│                                      │
│  Sponsor Name *                      │
│  [Your name or organization    ]     │
│  "Displayed on the batch proof page" │
│                                      │
│  Amount (STX) *                      │
│  [NumberInput: min 1, step 1]       │
│  "Minimum 1 STX. Funds go directly  │
│   to the Impact Pool treasury."      │
│                                      │
│  [Sponsor Batch #2 for 3 STX]       │
│      (boton teal full-width)         │
├──────────────────────────────────────┤
│  How Sponsorship Works (card teal)   │
│  "Your STX is transferred to the     │
│   Impact Pool treasury and your      │
│   name is permanently recorded..."   │
└──────────────────────────────────────┘
```

---

## 10. Estados compartidos

Estos estados aparecen en multiples pantallas. Disenar como componentes reutilizables:

### Wallet no conectada
```
┌─────────────────────────┐
│                         │
│    [emoji contextual]   │
│    "Connect your wallet │
│     to view [seccion]"  │
│                         │
└─────────────────────────┘
```

### Cargando
```
┌─────────────────────────┐
│                         │
│    [spinner animado]    │
│    "Loading [seccion]..." │
│                         │
└─────────────────────────┘
```

### Error
```
┌─────────────────────────┐
│                         │
│    "Unable to load       │
│     [seccion]"  (rojo)  │
│    "Subtexto gris"      │
│                         │
└─────────────────────────┘
```

### Empty state
```
┌─────────────────────────┐
│                         │
│       [emoji]           │
│    "No [items] yet"     │
│    [CTA opcional]       │
│                         │
└─────────────────────────┘
```

### Toast notifications (esquina inferior)
| Tipo | Color | Ejemplo |
|------|-------|---------|
| Success | Verde | "Plant minted successfully!" |
| Error | Rojo | "Transaction failed" |
| Info | Azul | "Confirming on-chain..." |
| Warning | Amarillo | "Insufficient balance" |

---

## 11. Sistema de color

### Colores semanticos por contexto

| Contexto | Color primario | Uso |
|----------|---------------|-----|
| Crecimiento/plantas | `green-500/600` | CTA principal, links, progreso |
| Graduacion/arboles | `orange-500` | Stage Tree, badges, Impact Pool |
| Logros/badges | `purple-500/600` | Achievements, progreso badges |
| Sponsors/teal | `teal-600` | Sponsor page, CTAs, cards info |
| Agua/accion | `blue-500` | Water buttons, links externos |
| Deshabilitado | `gray-400` | Cooldown, sin balance |
| Error | `red-500` | Alertas, balances insuficientes |

### Colores por tier de mint

| Tier | Color | Badge | Boton |
|------|-------|-------|-------|
| Basic (1 STX) | Green | `bg-green-100 text-green-800` | `bg-green-600 hover:bg-green-700` |
| Premium (2 STX) | Purple | `bg-purple-100 text-purple-800` | `bg-purple-600 hover:bg-purple-700` |
| Impact (3 STX) | Teal | `bg-teal-100 text-teal-800` | `bg-teal-600 hover:bg-teal-700` |

### Colores por stage de planta

| Stage | Emoji | Color |
|-------|-------|-------|
| Seed | 🌱 | Green |
| Sprout | 🌿 | Teal |
| Seedling | 🪴 | Blue |
| Vegetative | 🌾 | Purple |
| Tree | 🌳 | Orange |

---

## 12. Componentes reutilizables

### Badge
Pill con fondo tenue y texto del color correspondiente. Variantes: default, outline, secondary.

### Button
Variantes: primary (solid color), outline, ghost. Tamanos: sm, default, lg. Estado loading con spinner.

### Card
Contenedor con borde, padding, sombra leve. Sub-partes: CardHeader, CardTitle, CardContent.

### Stat
Componente de KPI: label pequeno gris + numero grande bold + help text pequeno.

### Progress bar
Barra horizontal con porcentaje. Color segun contexto (verde, naranja, morado).

### NumberInput
Input numerico con botones +/- laterales. Props: min, max, step.

### Table
Tabla con header sticky, filas alternadas, alineacion derecha para numeros.

### Tabs
Pestanas horizontales con contenido debajo. Active tab con borde inferior.

### Tooltip
Popup al hover con texto explicativo. Usado en Navbar (copy/disconnect).

### Sheet (mobile drawer)
Drawer lateral derecho para navegacion mobile. Fondo overlay oscuro.

### Dropdown Menu
Menu desplegable para Network Selector y Devnet Wallet Selector.

### Skeleton
Placeholder animado mientras carga contenido. Rectangulos grises pulsantes.

---

## Responsive Breakpoints

| Breakpoint | Nombre | Comportamiento |
|-----------|--------|----------------|
| < 768px | Mobile | 1 columna, hamburger nav, stacked cards |
| 768-1024px | Tablet | 2 columnas, nav completo |
| > 1024px | Desktop | 3+ columnas, layout completo |

**Max width del contenido:** `max-w-screen-xl` (1280px) centrado con padding lateral.

---

*Documento generado desde el codigo fuente de DenGrow. Ultima actualizacion: 2026-02-11.*
