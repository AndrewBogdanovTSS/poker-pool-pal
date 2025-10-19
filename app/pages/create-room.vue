<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
    <div class="max-w-2xl mx-auto pt-8">
      <!-- Back Button -->
      <NuxtLink to="/" class="inline-flex items-center text-primary-700 mb-6 hover:text-primary-800 transition-colors">
        <span class="text-xl mr-2">←</span>
        <span class="font-medium">Back to Home</span>
      </NuxtLink>

      <!-- Room Creation Form -->
      <div v-if="!roomCreated" class="card">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Create New Room</h2>

        <form @submit.prevent="handleCreateRoom" class="space-y-6">
          <!-- Player Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Your Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="playerName"
              type="text"
              required
              placeholder="Enter your name"
              class="input-field"
              maxlength="20"
            />
          </div>

          <!-- Avatar Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Your Avatar
            </label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="emoji in playerAvatars"
                :key="emoji"
                type="button"
                :class="[
                  'w-12 h-12 text-2xl rounded-lg transition-all',
                  playerAvatar === emoji
                    ? 'bg-primary-600 scale-110 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                ]"
                @click="playerAvatar = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Room Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Room Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="roomName"
              type="text"
              required
              placeholder="e.g., Friday Night Pool"
              class="input-field"
              maxlength="30"
            />
          </div>

          <!-- Room Avatar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Room Icon
            </label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="emoji in roomAvatars"
                :key="emoji"
                type="button"
                :class="[
                  'w-12 h-12 text-2xl rounded-lg transition-all',
                  roomAvatar === emoji
                    ? 'bg-primary-600 scale-110 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                ]"
                @click="roomAvatar = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="creating || !playerName.trim() || !roomName.trim()"
          >
            <span v-if="creating">Creating Room...</span>
            <span v-else>🎮 Create Room</span>
          </button>
        </form>
      </div>

      <!-- Room Created - Show QR Code -->
      <div v-else class="space-y-6">
        <!-- Room Info Card -->
        <div class="card">
          <div class="flex items-center gap-4 mb-6">
            <div class="text-5xl">{{ roomAvatar }}</div>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ roomName }}</h2>
              <p class="text-sm text-gray-600">Room created successfully!</p>
            </div>
          </div>

          <!-- QR Code Display -->
          <div v-if="roomOffer" class="bg-primary-50 rounded-xl p-6 text-center">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Scan to Join</h3>

            <div class="bg-white p-4 rounded-lg inline-block shadow-md mb-4">
              <canvas ref="qrCanvas" class="max-w-full"></canvas>
            </div>

            <p class="text-sm text-gray-600 mb-3">
              Share this QR code with other players
            </p>

            <div class="p-3 bg-white rounded-lg">
              <p class="text-xs text-gray-500 font-mono break-all">
                Room ID: {{ currentRoom?.id.slice(0, 12) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Players in Room -->
        <div class="card">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            Players in Room ({{ currentRoom?.players.length || 0 }})
          </h3>

          <div class="space-y-3">
            <div
              v-for="player in currentRoom?.players"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ player.avatar || '👤' }}</div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800">{{ player.name }}</span>
                    <span v-if="player.isHost" class="badge-primary">Host</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ player.id.slice(0, 8) }}</p>
                </div>
              </div>

              <button
                v-if="player.id === currentPlayer?.id"
                @click="handleLeaveRoom"
                class="btn-secondary text-sm px-4 py-2"
              >
                Leave
              </button>
            </div>
          </div>

          <div v-if="!currentRoom?.players.length" class="text-center py-8 text-gray-500">
            <p class="text-lg mb-2">Waiting for players...</p>
            <p class="text-sm">Share the QR code to let others join</p>
          </div>
        </div>

        <!-- Game Instructions -->
        <div class="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <h3 class="text-lg font-bold text-primary-900 mb-3">Ready to Start?</h3>
          <div class="space-y-2 text-sm text-primary-800">
            <p>✓ Wait for all players to join</p>
            <p>✓ You'll start the game from the room page</p>
            <p>✓ Minimum 2 players required</p>
          </div>

          <NuxtLink
            v-if="currentRoom && currentRoom.players.length >= 2"
            :to="`/room/${currentRoom.id}`"
            class="block mt-4"
          >
            <button class="btn-primary w-full">
              Go to Game Room →
            </button>
          </NuxtLink>
        </div>
      </div>
      <!-- Shareable Link -->
      <div class="mt-4 p-4 bg-white rounded-lg border border-primary-200">
        <h4 class="text-sm font-bold text-gray-800 mb-2">Share Link</h4>
        <div class="flex gap-2">
          <input
              :value="shareableLink"
              readonly
              class="input-field flex-1 text-sm font-mono"
              @click="($event.target as HTMLInputElement).select()"
          />
          <button
              @click="copyLink"
              class="btn-primary px-4 whitespace-nowrap"
          >
            {{ linkCopied ? '✓ Copied!' : 'Copy' }}
          </button>
        </div>
        <p class="text-xs text-gray-600 mt-2">
          Players can scan the QR code or paste this link to join
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

useHead({
  title: 'Create Room - Poker Pool Pal'
})

const { createPlayer, setCurrentPlayer, currentPlayer } = usePlayer()
const { createRoom, currentRoom } = useRoom()
const { createHost } = useWebRTC()

const playerName = ref('')
const playerAvatar = ref('🎯')
const roomName = ref('')
const roomAvatar = ref('🎱')
const creating = ref(false)
const roomCreated = ref(false)
const roomOffer = ref<RoomOffer | null>(null)
const qrCanvas = ref<HTMLCanvasElement>()

const playerAvatars = ['🎯', '⚡', '🔥', '⭐', '💎', '🎮', '🎪', '🎨']
const roomAvatars = ['🎱', '🎯', '🎮', '🎪', '🎨', '🎭', '🎸', '⚡']

const handleCreateRoom = async () => {
  const { saveRoom } = useSupabase()
  if (!playerName.value.trim() || !roomName.value.trim()) return

  creating.value = true

  try {
    // Create player
    const player = createPlayer(playerName.value.trim(), playerAvatar.value, true)
    setCurrentPlayer(player)

    // Create room
    const room = createRoom(roomName.value.trim(), player, roomAvatar.value)
    currentRoom.value = room

    // Initialize WebRTC as host
    const hostPeerId = await createHost()

    // Create room offer for QR code
    roomOffer.value = {
      roomId: room.id,
      roomName: room.name,
      hostName: player.name,
      hostPeerId,
      timestamp: Date.now()
    }

    roomCreated.value = true
    
    await saveRoom(room)

    // Generate QR code
    await nextTick()
    if (qrCanvas.value && roomOffer.value) {
      await QRCode.toCanvas(qrCanvas.value, JSON.stringify(roomOffer.value), {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f766e',
          light: '#ffffff'
        }
      })
    }
  } catch (error) {
    console.error('Failed to create room:', error)
    alert('Failed to create room. Please try again.')
    creating.value = false
  } finally {
    creating.value = false
  }
}

const handleLeaveRoom = () => {
  if (confirm('Are you sure you want to leave the room?')) {
    const { leaveRoom } = useWebRTC()
    const { clearCurrentPlayer } = usePlayer()
    const { clearRoom } = useRoom()

    leaveRoom()
    clearRoom()
    clearCurrentPlayer()

    navigateTo('/')
  }
}

const linkCopied = ref(false)

const shareableLink = computed(() => {
  if (!roomOffer.value) return ''

  const baseUrl = window.location.origin
  const offerData = encodeURIComponent(JSON.stringify(roomOffer.value))
  return `${baseUrl}/join?offer=${offerData}`
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareableLink.value)
    linkCopied.value = true
    setTimeout(() => linkCopied.value = false, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}
</script>
