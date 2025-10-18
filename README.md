# 🎱 Poker Pool Pal - 3D Ultra Cool Pool Edition

A local multiplayer Progressive Web App (PWA) for Poker Pool based on **3D Ultra Cool Pool** (PC, 2000) rules.

## 🚀 Tech Stack

- **Framework**: Nuxt 4.1.3
- **UI**: Vue 3.5+ with Composition API & `<script setup lang="ts">`
- **Styling**: UnoCSS 0.66.5 (Tailwind-style utilities)
- **State Management**: VueUse 11.1+ composables
- **TypeScript**: Strict mode enabled
- **PWA**: @vite-pwa/nuxt 0.10.5
- **WebRTC**: simple-peer 9.11.1 for P2P connections
- **QR Codes**: qrcode + @zxing/library

## 📋 Prerequisites

- Node.js 18+ or 20+
- npm or pnpm

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd poker-pool-pal

# Install dependencies
npm install

# Start development server (with HTTPS for WebRTC)
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview

# Type check
npm run typecheck
```

## 🎮 3D Ultra Cool Pool Rules

### Game Overview

Poker Pool blends billiards with poker. Players pocket balls to collect cards and build poker hands.

### Setup

1. **Shuffle a 52-card deck** at game start
2. **Take 15 cards** from the deck
3. **Assign cards to 15 balls** randomly
4. **Rack balls** in standard triangle formation

### Card Visibility

- **12 Open Cards**: Revealed to all players (visible from start)
- **3 Hidden Cards**: Concealed until pocketed (revealed when sunk)

### Gameplay

**Turn Structure:**
1. Players take turns attempting to pocket balls
2. **When pocketed**: Player collects that ball's card
3. Cards accumulate in player's hand
4. Build toward valid 5-card poker combinations

**Winning:**
- **Claim victory** when you have a valid poker hand (5+ cards required)
- Must announce/claim to win (no automatic victory)
- Hand must match standard poker rankings

**Rack Cycling:**
- If all 15 balls pocketed without winner:
  - **New rack**: Next 15 cards from deck assigned to balls
  - **12 open + 3 hidden** again
  - Continue until deck exhausted or someone wins

### Valid Poker Hands

1. 👑 **Royal Flush** - A, K, Q, J, 10 of same suit
2. 🔥 **Straight Flush** - 5 consecutive cards, same suit
3. 💎 **Four of a Kind** - 4 cards of same rank
4. 🏠 **Full House** - 3 of a kind + Pair
5. 💧 **Flush** - 5 cards of same suit
6. ➡️ **Straight** - 5 consecutive cards
7. 🎯 **Three of a Kind** - 3 cards of same rank
8. 👥 **Two Pair** - 2 different pairs
9. 🤝 **Pair** - 2 cards of same rank
10. 🎴 **High Card** - Highest card when no combination

### Strategy

- **Open Cards**: Plan based on visible cards
- **Hidden Cards**: Risk/reward decisions on unknown cards
- **Blocking**: Pocket cards opponents might need
- **Timing**: Claim early vs. wait for better hand

## 🏗️ Project Structure

```
poker-pool-pal/
├── nuxt.config.ts          # Nuxt 4 configuration
├── uno.config.ts           # UnoCSS configuration
├── package.json            # Dependencies
├── types/
│   └── index.ts            # TypeScript type definitions
├── composables/
│   ├── usePlayer.ts        # Player state (VueUse storage)
│   ├── useRoom.ts          # Room state management
│   ├── useWebRTC.ts        # WebRTC peer connections
│   └── usePokerPool.ts     # Game logic & hand evaluation
├── components/
│   ├── AvatarUpload.vue    # Avatar selection
│   ├── QRCodeDisplay.vue   # QR generation for joining
│   ├── QRScanner.vue       # Camera QR scanning
│   ├── PlayerCard.vue      # Player display
│   ├── PoolTable.vue       # 15-ball table display
│   ├── PlayerHand.vue      # Player's cards & hand
│   └── GameStatus.vue      # Game state display
└── pages/
    ├── index.vue           # Home page
    ├── create-room.vue     # Room creation
    ├── join-scan.vue       # QR scan to join
    └── room/
        └── [id].vue        # Active game room
```

## 🎯 Key Features

### PWA Capabilities
- ✅ **Installable** on mobile & desktop
- ✅ **Offline-ready** with service worker
- ✅ **App-like experience** with standalone mode

### WebRTC P2P
- ✅ **Local network** connections (no internet after setup)
- ✅ **Low latency** direct peer communication
- ✅ **Real-time sync** of game state

### Game Features
- ✅ **Full 52-card deck** with proper shuffling
- ✅ **12 open + 3 hidden** card system
- ✅ **Automatic hand evaluation** (all 5-card combinations)
- ✅ **Rack cycling** through deck
- ✅ **Turn management** & player order
- ✅ **Live card visibility** updates

### VueUse Integration
- `useStorage` for persistent player/room data
- Reactive state management
- Type-safe composables

## 🔧 Development

### TypeScript

All code uses strict TypeScript with `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Player, Card } from '~/types'

const player = ref<Player | null>(null)
const cards = computed(() => player.value?.hand ?? [])
</script>
```

### UnoCSS

Utility-first styling with shortcuts:

```vue
<template>
  <button class="btn-primary">
    Click Me
  </button>
  <div class="card">
    Content
  </div>
</template>
```

### VueUse

Reactive utilities & composables:

```ts
import { useStorage, useIntervalFn } from '@vueuse/core'

const player = useStorage('player', null)
const { pause, resume } = useIntervalFn(() => {
  // Timer logic
}, 1000)
```

## 🌐 Deployment

### Requirements
- **HTTPS required** for WebRTC
- **Service worker** support
- **Camera access** for QR scanning

### Recommended Hosts
- Netlify
- Vercel
- Cloudflare Pages

### Build Commands

```bash
# Static site generation
npm run generate

# Output in .output/public/
# Deploy the .output/public directory
```

## 🎲 Game Flow

1. **Host Creates Room** → Generates QR code
2. **Players Join** → Scan QR code → Enter room
3. **Game Starts** → Deck shuffled → 15 cards to balls → 12 open, 3 hidden
4. **Players Take Turns** → Pocket balls → Collect cards
5. **Build Hands** → Accumulate 5+ cards
6. **Claim Victory** → Announce valid poker hand → Win!
7. **New Rack** (if needed) → Next 15 cards → Continue

## 📱 Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari Desktop & iOS (full support)
- ✅ Chrome Android (full support)

## 🤝 Multiplayer

- **2-6 players** supported
- **WebRTC mesh** network (full P2P)
- **Local WiFi** recommended for best performance
- **QR code** or manual room ID sharing

## 🔐 Privacy

- **No server** required for gameplay
- **P2P connections** only
- **Local data** storage (VueUse storage)
- **No tracking** or analytics

## 📚 Game Strategy Tips

### Early Game
- Identify high-value open cards
- Track suit distributions
- Note potential straights/flushes

### Mid Game
- Block opponent combinations
- Evaluate hidden card risks
- Build toward specific hands

### Late Game
- Claim timing (speed vs. strength)
- Multiple hand possibilities
- Deck awareness (cards remaining)

## 🐛 Troubleshooting

### WebRTC Not Connecting
- Ensure HTTPS (or localhost)
- Check firewall settings
- Verify same network (for local play)
- Try different STUN servers

### Camera Not Working
- Grant camera permissions
- Check HTTPS requirement
- Test on different browser

### PWA Not Installing
- Verify HTTPS
- Check manifest configuration
- Ensure service worker registered

## 📄 License

MIT License

## 🙏 Credits

Based on **Poker Pool** from:
- 3D Ultra Cool Pool (PC, 2000)
- Sierra Entertainment / Dynamix

---

**Ready to Play?** 🎱

```bash
npm install && npm run dev
```

Open `https://localhost:3000` and start your first game!

