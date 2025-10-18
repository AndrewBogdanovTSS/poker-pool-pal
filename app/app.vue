<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'

// Initialize app-level state
const playerData = useStorage('poker-pool-player', null)
const roomData = useStorage('poker-pool-room', null)
</script>
