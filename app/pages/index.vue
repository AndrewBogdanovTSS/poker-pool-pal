<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="card max-w-2xl w-full">
      <div class="mb-8 text-center">
        <div class="text-6xl mb-4">🎱</div>
        <h1 class="text-4xl font-bold c-gray-800 mb-2">Poker Pool Pal</h1>
        <p class="text-lg c-gray-600 mb-2">3D Ultra Cool Pool Edition</p>
        <p class="text-sm text-primary-700 font-medium">Local Multiplayer • PWA</p>
      </div>

      <div class="space-y-3 mb-8">
        <NuxtLink to="/create-room" class="block">
          <button class="btn-primary w-full text-lg py-4">
            <span class="text-2xl mr-2">🎮</span>
            Start New Game
          </button>
        </NuxtLink>

        <NuxtLink to="/join-scan" class="block">
          <button class="btn-secondary w-full text-lg py-4">
            <span class="text-2xl mr-2">📷</span>
            Join Game
          </button>
        </NuxtLink>
      </div>

      <!-- Game Rules Summary -->
      <div class="mt-8 pt-6 b-t b-gray-200">
        <h3 class="font-bold c-gray-800 mb-3 text-center">🎯 How to Play</h3>

        <div class="space-y-2 text-sm c-gray-700">
          <div class="flex items-start gap-2">
            <span class="text-primary-600">•</span>
            <span><strong>15 balls</strong> each assigned a random card (A-2 in 4 suits)</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary-600">•</span>
            <span><strong>12 open cards</strong> visible + <strong>3 hidden</strong> cards</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary-600">•</span>
            <span>Pocket balls to <strong>collect their cards</strong></span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary-600">•</span>
            <span>Build the best <strong>5-card poker hand</strong></span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary-600">•</span>
            <span><strong>Claim your hand</strong> to win the round!</span>
          </div>
        </div>
      </div>

      <!-- Poker Hands Reference -->
      <div class="mt-6 pt-6 b-t b-gray-200">
        <p class="text-xs font-semibold c-gray-700 mb-3 text-center">
          Poker Hand Rankings (Best to Worst)
        </p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="flex items-center gap-1.5 p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded">
            <span class="text-base">👑</span>
            <span class="font-medium">Royal Flush</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-primary-50 rounded">
            <span class="text-base">🔥</span>
            <span class="font-medium">Straight Flush</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-primary-50 rounded">
            <span class="text-base">💎</span>
            <span>Four of a Kind</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-primary-50 rounded">
            <span class="text-base">🏠</span>
            <span>Full House</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
            <span class="text-base">💧</span>
            <span>Flush</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
            <span class="text-base">➡️</span>
            <span>Straight</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
            <span class="text-base">🎯</span>
            <span>Three of a Kind</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
            <span class="text-base">👥</span>
            <span>Two Pair</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
            <span class="text-base">🤝</span>
            <span>Pair</span>
          </div>
          <div class="flex items-center gap-1.5 p-2 bg-gray-50 rounded">
            <span class="text-base">🎴</span>
            <span>High Card</span>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-6 b-t b-gray-200 text-center">
        <p class="text-xs c-gray-500">
          Based on 3D Ultra Cool Pool rules • Powered by WebRTC
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Poker Pool Pal - 3D Ultra Cool Pool Edition',
  meta: [
    { name: 'description', content: 'Local multiplayer poker pool game based on 3D Ultra Cool Pool' }
  ]
})
</script>
