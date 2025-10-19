<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold">Game Status</h3>
      <div class="flex items-center gap-2">
        <div 
          :class="[
            'w-2 h-2 rounded-full',
            gameState.phase === 'playing' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          ]"
        ></div>
        <span class="text-sm font-medium capitalize">{{ gameState.phase }}</span>
      </div>
    </div>

    <!-- Deck & Rack Info -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="p-3 bg-primary-50 rounded-lg">
        <div class="text-xs text-gray-600">Rack Number</div>
        <div class="text-xl font-bold text-primary-700">#{{ gameState.rackNumber }}</div>
      </div>
      <div class="p-3 bg-blue-50 rounded-lg">
        <div class="text-xs text-gray-600">Deck Cards</div>
        <div class="text-xl font-bold text-blue-700">{{ deckRemaining }}/52</div>
      </div>
    </div>

    <!-- Players List -->
    <div class="space-y-2">
      <h4 class="text-sm font-semibold text-gray-700">Players</h4>
      <div
        v-for="player in sortedPlayers"
        :key="player.id"
        :class="[
          'flex items-center justify-between p-3 rounded-lg transition-all',
          player.id === gameState.currentPlayerId 
            ? 'bg-primary-100 border-2 border-primary-500' 
            : 'bg-gray-50',
          player.isWinner ? 'ring-2 ring-yellow-500' : ''
        ]"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">{{ player.avatar || '👤' }}</div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ player.name }}</span>
              <span v-if="player.isHost" class="badge-primary text-xs">Host</span>
              <span v-if="player.isWinner" class="text-yellow-500">🏆</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ player.hand.length }} cards
            </div>
          </div>
        </div>

        <!-- Turn Indicator -->
        <div v-if="player.id === gameState.currentPlayerId" 
             class="px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded">
          ▶ TURN
        </div>
      </div>
    </div>

    <!-- Game Controls (Host Only) -->
    <div v-if="isHost && gameState.phase === 'waiting'" class="mt-4 pt-4 border-t">
      <button 
        @click="$emit('start-game')"
        :disabled="players.length < 2"
        class="btn-primary w-full"
      >
        {{ players.length >= 2 ? 'Start Game' : `Need ${2 - players.length} more player(s)` }}
      </button>
    </div>

    <!-- New Rack Notice -->
    <div v-if="needsNewRack" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-yellow-600">🔄</span>
        <span class="font-medium text-yellow-900">All balls pocketed!</span>
      </div>
      <p class="text-xs text-yellow-700 mt-1">New rack will be set up automatically</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  players: Player[]
  gameState: GameState
  isHost: boolean
}>()

defineEmits<{
  (e: 'start-game'): void
}>()

const sortedPlayers = computed(() => 
  [...props.players].sort((a, b) => a.turnOrder - b.turnOrder)
)

const deckRemaining = computed(() => 
  52 - props.gameState.deckPosition
)

const needsNewRack = computed(() => 
  props.gameState.balls.every(b => b.isPocketed) && 
  props.gameState.phase === 'playing'
)
</script>