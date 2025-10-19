<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold">Pool Table - Rack #{{ rackNumber }}</h3>
      <div class="text-sm text-gray-600">
        {{ ballsRemaining }}/15 balls
      </div>
    </div>

    <!-- Ball Grid -->
    <div class="grid grid-cols-5 gap-3 mb-4">
      <button
        v-for="ball in balls"
        :key="ball.number"
        @click="selectBall(ball.number)"
        :disabled="ball.isPocketed || !isPlayerTurn"
        :class="[
          'relative p-4 rounded-lg transition-all',
          ball.isPocketed 
            ? 'bg-gray-100 opacity-50 cursor-not-allowed'
            : selectedBall === ball.number
            ? 'bg-primary-600 text-white ring-4 ring-primary-300 cursor-pointer'
            : 'bg-white border-2 border-primary-600 hover:bg-primary-50 cursor-pointer',
          !isPlayerTurn && 'cursor-not-allowed opacity-60'
        ]"
      >
        <!-- Ball Number -->
        <div class="text-center">
          <div class="text-2xl font-bold mb-2">
            {{ ball.number }}
          </div>

          <!-- Card Display -->
          <div v-if="ball.isOpen || ball.isPocketed" class="space-y-1">
            <div 
              :class="[
                'text-sm font-bold',
                getCardColor(ball.card.suit)
              ]"
            >
              {{ ball.card.rank }}{{ getSuitSymbol(ball.card.suit) }}
            </div>
          </div>
          <div v-else class="text-xs text-gray-500">
            🎴 Hidden
          </div>

          <!-- Pocketed By -->
          <div v-if="ball.isPocketed" class="mt-2">
            <div class="text-xs text-gray-600">
              {{ getPlayerName(ball.pocketedBy) }}
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- Action Buttons -->
    <div v-if="isPlayerTurn" class="space-y-3">
      <button 
        @click="confirmPocketBall"
        :disabled="!selectedBall"
        class="btn-primary w-full"
      >
        {{ selectedBall ? `Pocket Ball ${selectedBall}` : 'Select a ball' }}
      </button>

      <button 
        @click="endTurn"
        class="btn-secondary w-full"
      >
        End Turn
      </button>
    </div>

    <!-- Waiting State -->
    <div v-else class="text-center py-3 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">
        {{ getCurrentPlayerName() }}'s turn
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  balls: Ball[]
  players: Player[]
  currentPlayerId: string | null
  myPlayerId: string
  rackNumber: number
}>()

const emit = defineEmits<{
  (e: 'ball-pocketed', ballNumber: number): void
  (e: 'turn-ended'): void
}>()

const selectedBall = ref<number | null>(null)

const isPlayerTurn = computed(() => 
  props.currentPlayerId === props.myPlayerId
)

const ballsRemaining = computed(() => 
  props.balls.filter(b => !b.isPocketed).length
)

const selectBall = (ballNumber: number) => {
  if (!isPlayerTurn.value) return
  
  const ball = props.balls.find(b => b.number === ballNumber)
  if (!ball || ball.isPocketed) return
  
  selectedBall.value = ballNumber
}

const confirmPocketBall = () => {
  if (!selectedBall.value) return
  emit('ball-pocketed', selectedBall.value)
  selectedBall.value = null
}

const endTurn = () => {
  selectedBall.value = null
  emit('turn-ended')
}

const getSuitSymbol = (suit: CardSuit): string => {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  }
  return symbols[suit]
}

const getCardColor = (suit: CardSuit): string => {
  return suit === 'hearts' || suit === 'diamonds' 
    ? 'text-red-600' 
    : 'text-gray-800'
}

const getPlayerName = (playerId: string | null): string => {
  if (!playerId) return 'Unknown'
  const player = props.players.find(p => p.id === playerId)
  return player?.name || 'Unknown'
}

const getCurrentPlayerName = (): string => {
  return getPlayerName(props.currentPlayerId)
}
</script>