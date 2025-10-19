# 🎱 Poker Pool Pal - Complete Implementation Specification for bolt.new

## 📋 Project Overview

**Project Name:** Poker Pool Pal  
**Type:** Progressive Web App (PWA)  
**Game:** 3D Ultra Cool Pool - Poker Pool Mode  
**Architecture:** Local P2P Multiplayer (WebRTC)  
**Framework:** Nuxt 4.1.3 + Vue 3.5 + TypeScript

---

## 🎯 Core Concept

A local multiplayer billiards companion app where players build poker hands by pocketing balls. Based on 3D Ultra Cool Pool (PC, 2000) rules:

- **15 balls** are assigned random cards from a 52-card deck
- **12 cards are "open"** (visible to all players)
- **3 cards are "hidden"** (revealed when pocketed)
- Players pocket balls to **collect cards** and build poker hands
- First player to form a **valid 5-card poker hand** can claim victory
- When all 15 balls are pocketed, a **new rack** is dealt from the remaining deck

---

## 🛠️ Tech Stack Requirements

### **Mandatory Dependencies:**

```json
{
  "dependencies": {
    "@vueuse/core": "^11.1.0",
    "@vueuse/nuxt": "^11.1.0",
    "@zxing/library": "^0.21.3",
    "nuxt": "^4.1.3",
    "peerjs": "^1.5.5",
    "qrcode": "^1.5.4",
    "vue": "^3.5.12"
  },
  "devDependencies": {
    "@nuxt/devtools": "^2.6.5",
    "@types/qrcode": "^1.5.5",
    "@unocss/nuxt": "^0.66.5",
    "@vite-pwa/nuxt": "^1.0.7",
    "typescript": "^5.9.3"
  }
}
```

### **Critical: Use PeerJS, NOT simple-peer**
- ❌ **DO NOT USE** `simple-peer` (requires Node.js polyfills)
- ✅ **USE** `peerjs` (browser-native, no polyfills)

---

## 📁 Project Structure

```
poker-pool-pal/
├── nuxt.config.ts
├── uno.config.ts
├── package.json
├── app/
│   ├── types/
│   │   └── index.ts
│   ├── composables/
│   │   ├── usePlayer.ts
│   │   ├── useRoom.ts
│   │   ├── useWebRTC.ts
│   │   └── usePokerPool.ts
│   ├── components/
│   │   ├── PoolTable.vue
│   │   ├── PlayerHand.vue
│   │   └── GameStatus.vue
│   └── pages/
│       ├── index.vue
│       ├── create-room.vue
│       ├── join.vue
│       └── room/
│           └── [id].vue
└── public/
    └── icons/
        ├── icon-192.png
        └── icon-512.png
```

---

## 🎮 Game Rules (3D Ultra Cool Pool)

### **Setup:**
1. Shuffle a standard 52-card deck (A-K in 4 suits)
2. Take 15 cards sequentially from the shuffled deck
3. Assign these 15 cards to 15 balls randomly
4. Rack balls in visual grid (5x3 layout)

### **Card Visibility:**
- **First 12 balls:** Open cards (visible to all)
- **Last 3 balls:** Hidden cards (revealed only when pocketed)

### **Gameplay:**
1. Players take turns
2. Select and pocket a ball
3. Collect that ball's card into your hand
4. Continue until you have 5+ cards
5. Claim a valid poker hand to win

### **Rack Cycling:**
- When all 15 balls are pocketed without a winner:
  - Take next 15 cards from deck (position 16-30)
  - Create new rack with 12 open + 3 hidden
  - Continue until deck exhausted or someone wins

### **Poker Hands (Ranked):**
1. Royal Flush (A-K-Q-J-10 same suit)
2. Straight Flush (5 consecutive, same suit)
3. Four of a Kind
4. Full House (3 of kind + pair)
5. Flush (5 same suit)
6. Straight (5 consecutive)
7. Three of a Kind
8. Two Pair
9. Pair
10. High Card

---

## 🏗️ Core Implementation Details

### **1. nuxt.config.ts**

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  
  imports: {
    dirs: ['types']  // Auto-import types
  },
  
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  css: ['@unocss/reset/tailwind.css'],

  devtools: { enabled: true },

  typescript: {
    strict: true,
    typeCheck: false
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Poker Pool Pal',
      short_name: 'PokerPoolPal',
      description: '3D Ultra Cool Pool - Local multiplayer poker pool companion',
      theme_color: '#0f766e',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: false
    }
  },

  app: {
    head: {
      title: 'Poker Pool Pal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '3D Ultra Cool Pool - Local multiplayer poker pool game' },
        { name: 'theme-color', content: '#0f766e' }
      ]
    }
  }
})
```

### **2. uno.config.ts**

```typescript
import { defineConfig, presetUno, presetAttributify, presetIcons, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'Fira Code'
      }
    })
  ],
  
  theme: {
    colors: {
      primary: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
        950: '#042f2e'
      }
    }
  },

  shortcuts: {
    'btn': 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl',
    'btn-secondary': 'btn bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    'card': 'bg-white rounded-xl shadow-lg p-6 border border-gray-100',
    'input-field': 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all',
    'badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    'badge-primary': 'badge bg-primary-100 text-primary-800'
  }
})
```

---

## 📝 TypeScript Types (app/types/index.ts)

```typescript
export type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export interface Card {
  rank: CardRank
  suit: CardSuit
  id: string
}

export interface Ball {
  number: number // 1-15
  card: Card
  isOpen: boolean // true = revealed to all, false = hidden until pocketed
  isPocketed: boolean
  pocketedBy: string | null
}

export interface Player {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  hand: Card[] // Cards collected from pocketed balls
  turnOrder: number
  isWinner: boolean
  claimedHand?: PokerHandResult
}

export interface Room {
  id: string
  name: string
  avatar?: string
  hostId: string
  players: Player[]
  gameState: GameState
  createdAt: number
}

export interface GameState {
  phase: 'waiting' | 'playing' | 'round-ended' | 'game-finished'
  currentPlayerId: string | null
  deck: Card[] // Full 52-card deck (shuffled at start)
  balls: Ball[] // Current rack of 15 balls
  rackNumber: number
  deckPosition: number // Number of cards dealt from deck
  lastWinnerId: string | null
}

export interface PokerHandResult {
  name: PokerHandName
  cards: Card[] // The 5 cards that make up this hand
  score: number
  highCard: CardRank
}

export type PokerHandName = 
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'Pair'
  | 'High Card'

export interface WebRTCMessage {
  type: 'player-joined' | 'player-left' | 'game-started' | 
        'ball-pocketed' | 'hand-claimed' | 'round-ended' | 
        'new-rack' | 'game-state-update' | 'turn-ended'
  payload: any
  timestamp: number
  senderId: string
}

export interface RoomOffer {
  roomId: string
  roomName: string
  hostName: string
  hostPeerId: string  // IMPORTANT: PeerJS peer ID, not signal data
  timestamp: number
}

// Poker hand scoring (higher = better)
export const POKER_HAND_SCORES: Record<PokerHandName, number> = {
  'Royal Flush': 10,
  'Straight Flush': 9,
  'Four of a Kind': 8,
  'Full House': 7,
  'Flush': 6,
  'Straight': 5,
  'Three of a Kind': 4,
  'Two Pair': 3,
  'Pair': 2,
  'High Card': 1
}

// Card rank values for comparison
export const CARD_VALUES: Record<CardRank, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5,
  '4': 4, '3': 3, '2': 2
}
```

---

## 🔌 Composables Implementation

### **usePlayer.ts**

```typescript
import { useStorage } from '@vueuse/core'

export const usePlayer = () => {
  const currentPlayer = useStorage<Player | null>('poker-pool-current-player', null)

  const createPlayer = (name: string, avatar?: string, isHost = false): Player => ({
    id: crypto.randomUUID(),
    name,
    avatar,
    isHost,
    hand: [],
    turnOrder: 0,
    isWinner: false
  })

  const setCurrentPlayer = (player: Player) => {
    currentPlayer.value = player
  }

  const clearCurrentPlayer = () => {
    currentPlayer.value = null
  }

  return {
    currentPlayer,
    createPlayer,
    setCurrentPlayer,
    clearCurrentPlayer
  }
}
```

### **useRoom.ts**

```typescript
import { useStorage } from '@vueuse/core'

export const useRoom = () => {
  const currentRoom = useStorage<Room | null>('poker-pool-current-room', null)

  const createRoom = (name: string, hostPlayer: Player, avatar?: string): Room => {
    const initialGameState: GameState = {
      phase: 'waiting',
      currentPlayerId: null,
      deck: [],
      balls: [],
      rackNumber: 0,
      deckPosition: 0,
      lastWinnerId: null
    }

    return {
      id: crypto.randomUUID(),
      name,
      avatar,
      hostId: hostPlayer.id,
      players: [hostPlayer],
      gameState: initialGameState,
      createdAt: Date.now()
    }
  }

  const addPlayerToRoom = (player: Player) => {
    if (currentRoom.value && !currentRoom.value.players.find(p => p.id === player.id)) {
      currentRoom.value.players.push(player)
    }
  }

  const removePlayerFromRoom = (playerId: string) => {
    if (currentRoom.value) {
      currentRoom.value.players = currentRoom.value.players.filter(p => p.id !== playerId)
    }
  }

  const isHost = computed(() => {
    if (!currentRoom.value) return false
    const { currentPlayer } = usePlayer()
    return currentRoom.value.hostId === currentPlayer.value?.id
  })

  const clearRoom = () => {
    currentRoom.value = null
  }

  return {
    currentRoom,
    createRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    isHost,
    clearRoom
  }
}
```

### **useWebRTC.ts (PeerJS Implementation)**

```typescript
import Peer from 'peerjs'

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
] as const

const isBrowser = typeof window !== 'undefined'

export const useWebRTC = () => {
  const peer = ref<Peer | null>(null)
  const connections = ref<Map<string, any>>(new Map())
  const isConnected = ref(false)
  const myPeerId = ref('')

  const createHost = (): Promise<string> => {
    if (!isBrowser) {
      return Promise.reject(new Error('WebRTC only available in browser'))
    }

    return new Promise((resolve, reject) => {
      try {
        peer.value = new Peer({
          config: {
            iceServers: STUN_SERVERS
          }
        })

        peer.value.on('open', (id: string) => {
          myPeerId.value = id
          console.log('Host peer ID:', id)
          resolve(id) // Return peer ID
        })

        peer.value.on('connection', (conn) => {
          setupConnection(conn)
        })

        peer.value.on('error', (err: Error) => {
          console.error('Peer error:', err)
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  const joinAsGuest = (hostPeerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        peer.value = new Peer({
          config: {
            iceServers: STUN_SERVERS
          }
        })

        peer.value.on('open', (id: string) => {
          myPeerId.value = id
          console.log('Guest peer ID:', id)
          
          const conn = peer.value!.connect(hostPeerId)
          setupConnection(conn)
          resolve()
        })

        peer.value.on('error', (err: Error) => {
          console.error('Guest peer error:', err)
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  const setupConnection = (conn: any) => {
    conn.on('open', () => {
      console.log('Connection established')
      connections.value.set(conn.peer, conn)
      isConnected.value = true
    })

    conn.on('data', (data: any) => {
      handleIncomingMessage(data)
    })

    conn.on('close', () => {
      console.log('Connection closed')
      connections.value.delete(conn.peer)
      isConnected.value = connections.value.size > 0
    })
  }

  const handleIncomingMessage = (message: any) => {
    console.log('Received message:', message.type, message.payload)
    const { addPlayerToRoom, removePlayerFromRoom } = useRoom()
    
    switch (message.type) {
      case 'player-joined':
        addPlayerToRoom(message.payload)
        break
      case 'player-left':
        removePlayerFromRoom(message.payload.playerId)
        break
    }
  }

  const sendMessage = (message: any) => {
    connections.value.forEach((conn) => {
      if (conn.open) {
        conn.send(message)
      }
    })
  }

  const broadcastPlayerJoined = (player: any) => {
    sendMessage({
      type: 'player-joined',
      payload: player,
      timestamp: Date.now(),
      senderId: player.id
    })
  }

  const broadcastGameState = (gameState: any) => {
    sendMessage({
      type: 'game-state-update',
      payload: gameState,
      timestamp: Date.now(),
      senderId: usePlayer().currentPlayer.value?.id || ''
    })
  }

  const leaveRoom = () => {
    const { currentPlayer } = usePlayer()
    
    if (currentPlayer.value) {
      sendMessage({
        type: 'player-left',
        payload: { playerId: currentPlayer.value.id },
        timestamp: Date.now(),
        senderId: currentPlayer.value.id
      })
    }

    connections.value.forEach(conn => conn.close())
    peer.value?.destroy()
    
    peer.value = null
    connections.value.clear()
    isConnected.value = false
  }

  return {
    isConnected,
    myPeerId,
    createHost,
    joinAsGuest,
    sendMessage,
    broadcastPlayerJoined,
    broadcastGameState,
    leaveRoom
  }
}
```

### **usePokerPool.ts (Game Logic)**

**CRITICAL IMPLEMENTATION NOTES:**

1. **Fisher-Yates Shuffle with TypeScript Safety:**
```typescript
const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Use temp variable to avoid TS error
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}
```

2. **createFullDeck:**
```typescript
const createFullDeck = (): Card[] => {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: CardRank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
  const deck: Card[] = []

  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({
        rank,
        suit,
        id: `${rank}-${suit}-${crypto.randomUUID()}`
      })
    })
  })

  return shuffleDeck(deck)
}
```

3. **createRack (12 open + 3 hidden):**
```typescript
const createRack = (deck: Card[], deckPosition: number): { balls: Ball[], newDeckPosition: number } => {
  const balls: Ball[] = []
  let currentPosition = deckPosition

  for (let i = 1; i <= 15; i++) {
    if (currentPosition >= deck.length) {
      throw new Error('Deck exhausted')
    }

    const card = deck[currentPosition]
    currentPosition++

    balls.push({
      number: i,
      card,
      isOpen: i <= 12, // First 12 are open, last 3 are hidden
      isPocketed: false,
      pocketedBy: null
    })
  }

  return {
    balls: shuffleBallPositions(balls),
    newDeckPosition: currentPosition
  }
}
```

4. **evaluateBestHand (Check all 5-card combinations):**
```typescript
const evaluateBestHand = (cards: Card[]): PokerHandResult | null => {
  if (cards.length < 5) return null

  const allHands: PokerHandResult[] = []
  const combinations = getCombinations(cards, 5)
  
  for (const fiveCards of combinations) {
    const hand = evaluateFiveCardHand(fiveCards)
    allHands.push(hand)
  }

  if (allHands.length === 0) return null
  
  return allHands.reduce((best, current) => 
    compareHands(current, best) > 0 ? current : best
  )
}
```

---

## 🎨 Components Specification

### **PoolTable.vue**
- **Props:** `balls`, `players`, `currentPlayerId`, `myPlayerId`, `rackNumber`
- **Emits:** `ball-pocketed`, `turn-ended`
- **Layout:** 5x3 grid (15 balls)
- **Features:**
  - Visual ball display with numbers
  - Open cards show rank + suit symbol (♥♦♣♠)
  - Hidden cards show 🎴 icon
  - Pocketed balls grayed out with player name
  - Ball selection (highlight selected)
  - Turn indicator (only current player can select)
  - Confirm pocket button
  - End turn button

### **PlayerHand.vue**
- **Props:** `player`, `bestHand`, `isPlayerTurn`
- **Emits:** `claim-hand`
- **Layout:** 4-column grid of cards
- **Features:**
  - Show collected cards with suits (red for ♥♦, black for ♣♠)
  - Empty slots for remaining cards (up to 5)
  - Best hand display with gradient (yellow for Royal/Straight Flush)
  - Show 5 cards that make the best hand
  - Claim hand button (only if 5+ cards and is player's turn)
  - Need more cards message if < 5 cards

### **GameStatus.vue**
- **Props:** `players`, `gameState`, `isHost`
- **Emits:** `start-game`
- **Features:**
  - Game phase indicator
  - Rack number and deck remaining
  - Player list with turn order
  - Current player highlight (green background)
  - Card counts per player
  - Host badge
  - Winner indicator (🏆)
  - Start game button (host only, waiting phase)

---

## 📄 Pages Specification

### **index.vue (Home)**
- **Features:**
  - App title and icon (🎱)
  - Game rules summary
  - Poker hand rankings reference
  - "Start New Game" button → `/create-room`
  - "Join Game" button → `/join`

### **create-room.vue**
- **Features:**
  - Player setup (name, avatar selection)
  - Room setup (name, icon selection)
  - Create room button
  - After creation:
    - QR code display (using `qrcode` library)
    - **Shareable link** with copy button
    - Player list (real-time updates)
    - "Go to Game Room" button (if 2+ players)

**CRITICAL: Shareable Link Implementation:**
```typescript
const shareableLink = computed(() => {
  if (!roomOffer.value) return ''
  const baseUrl = window.location.origin
  const offerData = encodeURIComponent(JSON.stringify(roomOffer.value))
  return `${baseUrl}/join?offer=${offerData}`
})

const copyLink = async () => {
  await navigator.clipboard.writeText(shareableLink.value)
  linkCopied.value = true
  setTimeout(() => linkCopied.value = false, 2000)
}
```

### **join.vue**
- **Features:**
  - **Two joining methods (tabs):**
    1. **Paste Link:** Input field to paste shareable URL
    2. **Scan QR:** Camera-based QR scanning
  - Tab selection (toggle between methods)
  - Parse link from URL query parameter `?offer=`
  - QR scanner with `@zxing/library`
  - Room info preview (name, host)
  - Player setup (name, avatar)
  - Join button

### **room/[id].vue (Main Gameplay)**
- **Layout:** 3-column grid (lg: sidebar, main, status)
- **Features:**
  - Room header with name, ID, leave button
  - GameStatus component (left column)
  - PoolTable component (center)
  - PlayerHand component (center, below table)
  - Activity log (bottom)
  - Winner modal (overlay)
  - Game logic:
    - Start game (host only)
    - Ball pocketing
    - Turn management
    - Hand claiming
    - Winner detection
    - New rack generation
    - WebRTC state sync

---

## 🎯 Critical Implementation Steps

### **Step 1: Initialize Project**
```bash
npx nuxi@latest init poker-pool-pal
cd poker-pool-pal
npm install @vueuse/core @vueuse/nuxt @zxing/library peerjs qrcode
npm install -D @unocss/nuxt @vite-pwa/nuxt @types/qrcode
```

### **Step 2: Configure nuxt.config.ts & uno.config.ts**
- Add modules: `@unocss/nuxt`, `@vueuse/nuxt`, `@vite-pwa/nuxt`
- Configure PWA manifest
- Set `imports: { dirs: ['types'] }`
- Add UnoCSS shortcuts

### **Step 3: Create Types**
- `app/types/index.ts` with all interfaces
- Export constants (`POKER_HAND_SCORES`, `CARD_VALUES`)

### **Step 4: Implement Composables**
1. `usePlayer.ts` - Player state management
2. `useRoom.ts` - Room state management
3. `useWebRTC.ts` - **Use PeerJS** for P2P
4. `usePokerPool.ts` - Game logic & hand evaluation

### **Step 5: Create Components**
1. `PoolTable.vue` - 15-ball grid
2. `PlayerHand.vue` - Card display & claiming
3. `GameStatus.vue` - Players & game state

### **Step 6: Build Pages**
1. `index.vue` - Home with rules
2. `create-room.vue` - Room creation with QR + link
3. `join.vue` - Join via link OR QR scan
4. `room/[id].vue` - Full gameplay

### **Step 7: Test Flow**
1. Create room → QR code appears
2. Copy shareable link
3. Open in incognito → Paste link → Join
4. Start game → Deck dealt (12 open + 3 hidden)
5. Pocket balls → Collect cards
6. Claim hand → Winner modal
7. New game → Reset state

---

## 🚨 Common Pitfalls & Solutions

### **Pitfall 1: Using simple-peer**
**Problem:** Requires Node.js polyfills (`process`, `buffer`, `stream`)  
**Solution:** Use `peerjs` instead (browser-native)

### **Pitfall 2: TypeScript array swap error**
**Problem:** `[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]` → TS error  
**Solution:** Use temp variable with `!` assertion

### **Pitfall 3: Signal data vs Peer ID**
**Problem:** Trying to use SimplePeer's signal data structure  
**Solution:** PeerJS uses peer IDs (strings), store `hostPeerId` in `RoomOffer`

### **Pitfall 4: Not revealing hidden cards**
**Problem:** Hidden cards stay hidden after pocketing  
**Solution:** Set `isOpen: true` when `isPocketed: true`

### **Pitfall 5: Deck position tracking**
**Problem:** Re-using same 15 cards for new racks  
**Solution:** Track `deckPosition` and increment by 15 each rack

---

## ✅ Testing Checklist

- [ ] Create room → QR code + link generated
- [ ] Copy link → Clipboard works
- [ ] Paste link in join page → Room found
- [ ] Scan QR code → Room found
- [ ] Join room → Player added
- [ ] Start game → Deck shuffled, first rack dealt
- [ ] 12 open + 3 hidden cards correct
- [ ] Pocket ball → Card added to hand
- [ ] Hidden card revealed when pocketed
- [ ] Turn changes after end turn
- [ ] Get 5+ cards → Claim button appears
- [ ] Claim hand → Winner modal
- [ ] All 15 balls pocketed → New rack dealt
- [ ] New rack uses cards 16-30 from deck
- [ ] Game state syncs across players (WebRTC)
- [ ] Leave room → Navigate to home
- [ ] PWA installable

---

## 📦 Deliverables

1. ✅ Fully functional Nuxt 4 app
2. ✅ TypeScript strict mode
3. ✅ PWA with offline support
4. ✅ WebRTC P2P multiplayer (PeerJS)
5. ✅ QR code joining
6. ✅ Link-based joining
7. ✅ Complete 3D Ultra Cool Pool rules
8. ✅ Responsive design (mobile + desktop)
9. ✅ UnoCSS styling
10. ✅ Production-ready code

---

## 🎨 Design Guidelines

- **Color Scheme:** Teal primary (`#0f766e`)
- **Typography:** Inter for sans-serif
- **Icons:** Emojis (🎱🃏🏆⚡🔥)
- **Spacing:** Consistent padding (p-4, p-6)
- **Shadows:** Subtle elevation (shadow-lg)
- **Gradients:** Primary-50 to Primary-100 backgrounds
- **Animations:** Smooth transitions (transition-all)
- **Cards:** White backgrounds with borders
- **Buttons:** Primary (teal), Secondary (gray)

---

## 🚀 Final Notes for bolt.new

- **DO NOT** use `simple-peer` - it will cause `process.nextTick` errors
- **DO** use `peerjs` for WebRTC
- **DO** implement Fisher-Yates shuffle with temp variables
- **DO** track deck position for multi-rack games
- **DO** implement 12 open + 3 hidden card system
- **DO** provide both QR and link joining methods
- **DO** use VueUse for state persistence
- **DO** follow TypeScript strict mode
- **DO** test with 2 browser windows (host + guest)

This specification provides everything needed to build a complete, working Poker Pool Pal application with all features implemented correctly!