# 🎮 Poker Pool Pal - Gameplay Implementation Guide

## 📦 Files Created

### **Components** (Add to `app/components/`)

1. **[206] PoolTable.vue** - Interactive 15-ball table
   - Shows open/hidden cards
   - Ball selection
   - Turn management
   - Pocketed ball tracking

2. **[195] PlayerHand.vue** - Player's collected cards
   - Card display with suits
   - Best hand evaluation
   - Claim hand button
   - Hand strength visualization

3. **[196] GameStatus.vue** - Game state display
   - Player list with turn order
   - Rack & deck information
   - Host controls
   - Connection status

### **Pages** (Add to `app/pages/`)

4. **[229] room/[id].vue** - Main gameplay page
   - Full game logic
   - WebRTC synchronization
   - Turn management
   - Winner detection
   - Activity log

5. **[230] join.vue** - Improved join page
   - **Link joining** (paste URL)
   - **QR scanning** (camera)
   - Tab selection
   - Player setup

### **Updates Needed**

6. **Update `create-room.vue`** - Add shareable link
   - Add the section from [228]
   - Include link copying functionality
   - Generate shareable URLs

---

## 🔧 Implementation Steps

### **Step 1: Add Components**

```bash
# Create components directory if it doesn't exist
mkdir -p app/components

# Add the three component files:
# - PoolTable.vue
# - PlayerHand.vue  
# - GameStatus.vue
```

### **Step 2: Add Room Page**

## 🎯 Features Implemented

### **✅ Room Page** (`/room/[id]`)
- ✅ Full game loop
- ✅ Ball pocketing with card collection
- ✅ Turn-based gameplay
- ✅ Poker hand evaluation
- ✅ Winner detection
- ✅ New rack generation
- ✅ Activity log
- ✅ WebRTC sync
- ✅ Winner modal
- ✅ New game functionality

### **✅ Pool Table Component**
- ✅ 15-ball grid display
- ✅ Open (12) vs Hidden (3) cards
- ✅ Ball selection UI
- ✅ Turn indicator
- ✅ Pocketed ball tracking
- ✅ Player name on balls

### **✅ Player Hand Component**
- ✅ Collected cards display
- ✅ Empty card slots visualization
- ✅ Best hand calculation
- ✅ Hand strength gradient
- ✅ Claim hand button
- ✅ Visual card styling (red/black)

### **✅ Game Status Component**
- ✅ Player list with turn order
- ✅ Current player highlight
- ✅ Card counts
- ✅ Rack number
- ✅ Deck remaining
- ✅ Host controls
- ✅ New rack notifications

### **✅ Join Methods**
- ✅ **Link joining** - Paste shareable URL
- ✅ **QR scanning** - Camera-based joining
- ✅ Tab selection between methods
- ✅ Auto-parse link from clipboard
- ✅ Room info preview

---

## 🎲 Game Flow

```
1. Host creates room
   ↓
2. Host shares link OR QR code
   ↓
3. Players join (paste link or scan QR)
   ↓
4. Host starts game
   ↓
5. Deck shuffled → First rack dealt (12 open + 3 hidden)
   ↓
6. Players take turns → Pocket balls → Collect cards
   ↓
7. Build 5-card poker hand
   ↓
8. Claim hand → Winner!
   ↓
9. New game or leave room
```

---

## 📝 URL Structure

### **Room Link Format:**
```
https://your-domain.com/join?offer=<encoded_room_offer>
```

Where `<encoded_room_offer>` contains:
```json
{
  "roomId": "uuid",
  "roomName": "Room Name",
  "hostName": "Host Name",
  "hostPeerId": "peer-id",
  "timestamp": 1234567890
}
```

---

## 🧪 Testing Checklist

- [ ] Create room → QR code appears
- [ ] Create room → Shareable link appears
- [ ] Copy link → Works
- [ ] Join via pasted link → Success
- [ ] Join via QR scan → Success
- [ ] Start game → Deck dealt
- [ ] Pocket ball → Card added to hand
- [ ] All 15 balls pocketed → New rack
- [ ] Get 5+ cards → Claim button appears
- [ ] Claim hand → Winner modal
- [ ] New game → Reset state
- [ ] Leave room → Navigate to home

---

## 🐛 Common Issues & Solutions

### **Issue: Link not working**
**Solution:** Make sure `roomOffer` includes `hostPeerId` (not `signalData`)

### **Issue: Cards not appearing**
**Solution:** Check `usePokerPool` composable is imported correctly

### **Issue: Turn not changing**
**Solution:** Verify `handleTurnEnded` broadcasts game state

### **Issue: QR scan not working**
**Solution:** Ensure HTTPS and camera permissions

---

## 🚀 Next Steps

After implementing these files:

1. **Test locally:**
   ```bash
   npm run dev
   # Open two browser windows
   # Create room in one, join from other
   ```

2. **Test features:**
   - Create room
   - Copy link
   - Join via link in incognito window
   - Start game
   - Pocket balls
   - Claim hand
   - New game

3. **Deploy:**
   ```bash
   npm run generate
   # Deploy to Netlify/Vercel
   ```

---

## 📊 File Locations Summary

```
poker-pool-pal/
├── app/
│   ├── components/
│   │   ├── PoolTable.vue         
│   │   ├── PlayerHand.vue        
│   │   └── GameStatus.vue        
│   ├── pages/
│   │   ├── index.vue
│   │   ├── create-room.vue       
│   │   ├── join.vue               
│   │   └── room/
│   │       └── [id].vue          
│   ├── composables/
│   │   ├── usePlayer.ts
│   │   ├── useRoom.ts
│   │   ├── useWebRTC.ts
│   │   └── usePokerPool.ts
│   └── types/
│       └── index.ts
```

---

## ✨ Features Summary

- ✅ Complete gameplay loop
- ✅ Poker hand evaluation
- ✅ WebRTC state synchronization
- ✅ Both QR and link joining
- ✅ Turn-based multiplayer
- ✅ Winner detection
- ✅ Multi-rack support
- ✅ Activity logging
- ✅ Responsive design

**All files are ready to copy and use!** 🎱🃏
