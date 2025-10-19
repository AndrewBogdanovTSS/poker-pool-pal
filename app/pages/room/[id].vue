<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
    <div class="max-w-6xl mx-auto pt-8">
      <!-- Header -->
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-4xl">{{ currentRoom?.avatar }}</div>
            <div>
              <h2 class="text-2xl font-bold">{{ currentRoom?.name }}</h2>
              <p class="text-sm text-gray-500">Room ID: {{ currentRoom?.id.slice(0, 8) }}</p>
            </div>
          </div>

          <button @click="handleLeaveRoom" class="btn-secondary">
            Leave Room
          </button>
        </div>
      </div>

      <!-- Game Area -->
      <div v-if="currentRoom" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Game Status & Players -->
        <div class="space-y-6">
          <GameStatus
            :players="currentRoom.players"
            :game-state="currentRoom.gameState"
            :is-host="isHost"
            @start-game="startGame"
          />
        </div>

        <!-- Center Column - Pool Table -->
        <div class="lg:col-span-2 space-y-6">
          <PoolTable
            v-if="currentRoom.gameState.phase === 'playing'"
            :balls="currentRoom.gameState.balls"
            :players="currentRoom.players"
            :current-player-id="currentRoom.gameState.currentPlayerId"
            :my-player-id="currentPlayer?.id || ''"
            :rack-number="currentRoom.gameState.rackNumber"
            @ball-pocketed="handleBallPocketed"
            @turn-ended="handleTurnEnded"
          />

          <PlayerHand
            v-if="currentPlayer && currentRoom.gameState.phase === 'playing'"
            :player="currentPlayer"
            :best-hand="bestHand"
            :is-player-turn="isMyTurn"
            @claim-hand="handleClaimHand"
          />
        </div>
      </div>

      <!-- Winner Modal -->
      <div v-if="winner" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="card max-w-md w-full mx-4">
          <div class="text-center">
            <div class="text-6xl mb-4">🏆</div>
            <h3 class="text-3xl font-bold mb-2">{{ winner.name }} Wins!</h3>
            <div v-if="winner.claimedHand" class="text-xl text-primary-700 font-semibold mb-4">
              {{ winner.claimedHand.name }}
            </div>
            <div class="space-y-2 text-sm text-gray-600 mb-6">
              <p>Final Scores:</p>
              <div v-for="player in currentRoom?.players" :key="player.id" class="flex justify-between">
                <span>{{ player.name }}</span>
                <span>{{ player.hand.length }} cards</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="startNewGame" class="btn-primary flex-1">
                New Game
              </button>
              <button @click="handleLeaveRoom" class="btn-secondary flex-1">
                Leave Room
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div v-if="activityLog.length > 0" class="card mt-6">
        <h3 class="text-lg font-bold mb-3">Activity Log</h3>
        <div class="space-y-1 max-h-40 overflow-y-auto text-sm">
          <div
            v-for="(entry, index) in activityLog.slice(-10)"
            :key="index"
            class="flex items-start gap-2 p-2 bg-gray-50 rounded"
          >
            <span class="text-xs text-gray-500">{{ entry.time }}</span>
            <span class="flex-1">{{ entry.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Game Room - Poker Pool Pal'
})

const route = useRoute()
// const { saveGameSession, updateRoom } = useSupabase()
const { currentRoom } = useRoom()
const { currentPlayer } = usePlayer()
const { broadcastGameState } = useWebRTC()
const {
  createFullDeck,
  createRack,
  pocketBall,
  evaluateBestHand,
  allBallsPocketed
} = usePokerPool()

const activityLog = ref<Array<{time: string, message: string}>>([])

const isHost = computed(() =>
  currentRoom.value?.hostId === currentPlayer.value?.id
)

const isMyTurn = computed(() =>
  currentRoom.value?.gameState.currentPlayerId === currentPlayer.value?.id
)

const winner = computed(() =>
  currentRoom.value?.players.find(p => p.isWinner)
)

const bestHand = computed(() => {
  if (!currentPlayer.value || currentPlayer.value.hand.length < 5) return null
  return evaluateBestHand(currentPlayer.value.hand)
})

onMounted(() => {
  if (!currentRoom.value || !currentPlayer.value) {
    navigateTo('/')
    return
  }

  addLog('Entered game room')
})

const addLog = (message: string) => {
  activityLog.value.push({
    time: new Date().toLocaleTimeString(),
    message
  })
}

const startGame = () => {
  if (!currentRoom.value || !isHost.value) return

  try {
    // Create and shuffle deck
    const deck = createFullDeck()

    // Create first rack
    const { balls, newDeckPosition } = createRack(deck, 0)

    // Update game state
    currentRoom.value.gameState = {
      ...currentRoom.value.gameState,
      phase: 'playing',
      deck,
      balls,
      rackNumber: 1,
      deckPosition: newDeckPosition,
      currentPlayerId: currentRoom.value.players[0].id
    }

    // Set turn order
    currentRoom.value.players = currentRoom.value.players.map((p, index) => ({
      ...p,
      turnOrder: index,
      hand: [],
      isWinner: false
    }))

    addLog('Game started! Rack #1 dealt.')
    broadcastGameState(currentRoom.value.gameState)
  } catch (error) {
    console.error('Failed to start game:', error)
    alert('Failed to start game')
  }
}

const handleBallPocketed = (ballNumber: number) => {
  if (!currentRoom.value || !currentPlayer.value) return

  const result = pocketBall(
    ballNumber,
    currentPlayer.value.id,
    currentRoom.value.gameState.balls,
    currentRoom.value.players
  )

  currentRoom.value.gameState.balls = result.updatedBalls
  currentRoom.value.players = result.updatedPlayers

  const ball = result.updatedBalls.find(b => b.number === ballNumber)
  if (ball) {
    addLog(`${currentPlayer.value.name} pocketed ball ${ballNumber} (${ball.card.rank}${getSuitSymbol(ball.card.suit)})`)
  }

  // Check if all balls are pocketed
  if (allBallsPocketed(result.updatedBalls)) {
    handleNewRack()
  }

  broadcastGameState(currentRoom.value.gameState)
}

const handleTurnEnded = () => {
  if (!currentRoom.value) return

  // Move to next player
  const currentIndex = currentRoom.value.players.findIndex(
    p => p.id === currentRoom.value!.gameState.currentPlayerId
  )
  const nextIndex = (currentIndex + 1) % currentRoom.value.players.length
  const nextPlayer = currentRoom.value.players[nextIndex]

  currentRoom.value.gameState.currentPlayerId = nextPlayer.id

  addLog(`${nextPlayer.name}'s turn`)
  broadcastGameState(currentRoom.value.gameState)
}

const handleClaimHand = () => {
  if (!currentRoom.value || !currentPlayer.value || !bestHand.value) return

  // Mark player as winner
  currentRoom.value.players = currentRoom.value.players.map(p => ({
    ...p,
    isWinner: p.id === currentPlayer.value!.id,
    claimedHand: p.id === currentPlayer.value!.id ? bestHand.value! : undefined
  }))

  currentRoom.value.gameState.phase = 'round-ended'
  currentRoom.value.gameState.lastWinnerId = currentPlayer.value.id

  addLog(`${currentPlayer.value.name} wins with ${bestHand.value.name}!`)

  // Supabase persistence (temporarily disabled)
  // if (currentRoom.value) {
  //   saveGameSession({
  //     room_id: currentRoom.value.id,
  //     winner_id: currentPlayer.value.id,
  //     winner_hand: bestHand.value,
  //     players: currentRoom.value.players,
  //     final_state: currentRoom.value.gameState
  //   })
  // }

  broadcastGameState(currentRoom.value.gameState)
}

const handleNewRack = () => {
  if (!currentRoom.value) return

  try {
    const { balls, newDeckPosition } = createRack(
      currentRoom.value.gameState.deck,
      currentRoom.value.gameState.deckPosition
    )

    currentRoom.value.gameState = {
      ...currentRoom.value.gameState,
      balls,
      rackNumber: currentRoom.value.gameState.rackNumber + 1,
      deckPosition: newDeckPosition
    }

    addLog(`New rack #${currentRoom.value.gameState.rackNumber} dealt`)
    broadcastGameState(currentRoom.value.gameState)
  } catch (error) {
    console.error('Deck exhausted:', error)
    addLog('Deck exhausted - game over')
  }
}

const startNewGame = () => {
  if (!currentRoom.value) return

  // Reset game state
  currentRoom.value.gameState = {
    phase: 'waiting',
    currentPlayerId: null,
    deck: [],
    balls: [],
    rackNumber: 0,
    deckPosition: 0,
    lastWinnerId: currentRoom.value.gameState.lastWinnerId
  }

  // Reset players
  currentRoom.value.players = currentRoom.value.players.map(p => ({
    ...p,
    hand: [],
    isWinner: false,
    claimedHand: undefined
  }))

  activityLog.value = []
  addLog('New game started')
  broadcastGameState(currentRoom.value.gameState)
}

const handleLeaveRoom = () => {
  if (confirm('Are you sure you want to leave?')) {
    const { leaveRoom } = useWebRTC()
    const { clearCurrentPlayer } = usePlayer()
    const { clearRoom } = useRoom()

    leaveRoom()
    clearRoom()
    clearCurrentPlayer()

    navigateTo('/')
  }
}

const getSuitSymbol = (suit: CardSuit): string => {
  const symbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
  return symbols[suit]
}
</script>
