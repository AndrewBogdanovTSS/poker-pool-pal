<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold">Your Hand</h3>
      <div class="text-sm text-gray-600">
        {{ player.hand.length }} cards
      </div>
    </div>

    <!-- Collected Cards Grid -->
    <div class="grid grid-cols-4 gap-2 mb-4">
      <div
        v-for="card in player.hand"
        :key="card.id"
        class="p-3 bg-white rounded-lg border-2 text-center transition-all hover:scale-105"
        :class="getCardBorderColor(card.suit)"
      >
        <div class="text-xl font-bold" :class="getCardColor(card.suit)">
          {{ card.rank }}
        </div>
        <div class="text-2xl" :class="getCardColor(card.suit)">
          {{ getSuitSymbol(card.suit) }}
        </div>
      </div>

      <!-- Empty slots -->
      <div 
        v-for="i in Math.max(0, 5 - player.hand.length)" 
        :key="`empty-${i}`"
        class="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
      >
        <span class="text-2xl text-gray-300">🎴</span>
      </div>
    </div>

    <!-- Best Hand Display -->
    <div v-if="bestHand && player.hand.length >= 5" 
         class="mb-4 p-4 rounded-lg"
         :class="getHandGradient(bestHand.name)">
      <div class="flex items-center justify-between mb-2">
        <div>
          <div class="text-sm font-medium text-gray-700">Best Hand:</div>
          <div class="text-xl font-bold" :class="getHandTextColor(bestHand.name)">
            {{ bestHand.name }}
          </div>
        </div>
        <div class="text-3xl">
          {{ getHandEmoji(bestHand.name) }}
        </div>
      </div>

      <!-- Best 5 Cards -->
      <div class="flex gap-1 flex-wrap mt-2">
        <div
          v-for="card in bestHand.cards"
          :key="card.id"
          class="px-2 py-1 bg-white rounded text-xs font-medium"
          :class="getCardColor(card.suit)"
        >
          {{ card.rank }}{{ getSuitSymbol(card.suit) }}
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="player.hand.length >= 5 && isPlayerTurn" class="space-y-2">
      <button 
        @click="$emit('claim-hand')"
        class="btn-primary w-full text-lg font-bold"
      >
        🏆 Claim {{ bestHand?.name }}!
      </button>
      <p class="text-xs text-center text-gray-600">
        Win the round with this hand
      </p>
    </div>

    <!-- Need More Cards -->
    <div v-else-if="player.hand.length < 5" class="text-center py-4 text-sm text-gray-600">
      <p class="font-medium">Need {{ 5 - player.hand.length }} more card(s)</p>
      <p class="text-xs text-gray-500 mt-1">Minimum 5 cards to form a hand</p>
    </div>

    <!-- Waiting -->
    <div v-else class="text-center py-3 text-sm text-gray-600">
      <p>Waiting for your turn...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  player: Player
  bestHand: PokerHandResult | null
  isPlayerTurn: boolean
}>()

defineEmits<{
  (e: 'claim-hand'): void
}>()

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

const getCardBorderColor = (suit: CardSuit): string => {
  return suit === 'hearts' || suit === 'diamonds'
    ? 'border-red-300'
    : 'border-gray-300'
}

const getHandEmoji = (handName: PokerHandName): string => {
  const emojis: Record<PokerHandName, string> = {
    'Royal Flush': '👑',
    'Straight Flush': '🔥',
    'Four of a Kind': '💎',
    'Full House': '🏠',
    'Flush': '💧',
    'Straight': '➡️',
    'Three of a Kind': '🎯',
    'Two Pair': '👥',
    'Pair': '🤝',
    'High Card': '🎴'
  }
  return emojis[handName] || '🎴'
}

const getHandGradient = (handName: PokerHandName): string => {
  const score = POKER_HAND_SCORES[handName]
  if (score >= 9) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
  if (score >= 7) return 'bg-gradient-to-r from-primary-100 to-primary-200 border-2 border-primary-400'
  if (score >= 5) return 'bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300'
  return 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
}

const getHandTextColor = (handName: PokerHandName): string => {
  const score = POKER_HAND_SCORES[handName]
  if (score >= 9) return 'text-yellow-800'
  if (score >= 7) return 'text-primary-800'
  if (score >= 5) return 'text-primary-700'
  return 'text-gray-800'
}
</script>