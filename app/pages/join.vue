<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
    <div class="max-w-2xl mx-auto pt-8">
      <NuxtLink to="/" class="inline-flex items-center text-primary-700 mb-6 hover:text-primary-800 transition-colors">
        <span class="text-xl mr-2">←</span>
        <span class="font-medium">Back to Home</span>
      </NuxtLink>

      <div class="card">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Join Game</h2>

        <div class="space-y-6">
          <!-- Tab Selection -->
          <div class="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              @click="joinMethod = 'link'"
              :class="[
                'flex-1 px-4 py-2 rounded-md font-medium transition-all',
                joinMethod === 'link'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              🔗 Paste Link
            </button>
            <button
              @click="joinMethod = 'qr'"
              :class="[
                'flex-1 px-4 py-2 rounded-md font-medium transition-all',
                joinMethod === 'qr'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              📷 Scan QR
            </button>
          </div>

          <!-- Link Join Method -->
          <div v-if="joinMethod === 'link'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Paste Room Link
              </label>
              <input
                v-model="roomLink"
                type="text"
                placeholder="https://..."
                class="input-field"
                @paste="handlePaste"
              />
              <p class="text-xs text-gray-500 mt-1">
                Paste the link shared by the host
              </p>
            </div>

            <button
              @click="parseAndJoin"
              :disabled="!roomLink.trim()"
              class="btn-primary w-full"
            >
              Parse Link & Join
            </button>
          </div>

          <!-- QR Scan Method -->
          <div v-else class="space-y-4">
            <div class="scanner-container relative">
              <video
                ref="videoElement"
                class="w-full rounded-lg bg-gray-900"
                autoplay
                playsinline
              ></video>

              <div v-if="scanning" class="scanner-overlay">
                <div class="scanner-line"></div>
                <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Scanning...
                </div>
              </div>

              <div v-if="error"
                   class="absolute bottom-4 left-4 right-4 p-3 bg-red-500 text-white rounded-lg text-sm shadow-lg">
                {{ error }}
              </div>
            </div>

            <div class="flex gap-3">
              <button v-if="!scanning" class="btn-primary flex-1" @click="startScanning">
                Start Camera
              </button>
              <button v-else class="btn-secondary flex-1" @click="stopScanning">
                Stop Camera
              </button>
            </div>
          </div>

          <!-- Room Found - Player Details -->
          <div v-if="scannedOffer" class="space-y-4 pt-4 border-t">
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">✓</span>
                <span class="font-bold text-green-900">Room Found!</span>
              </div>
              <div class="text-sm text-green-700">
                <p><strong>Room:</strong> {{ scannedOffer.roomName }}</p>
                <p><strong>Host:</strong> {{ scannedOffer.hostName }}</p>
              </div>
            </div>

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

            <div class="flex gap-3">
              <button @click="resetJoin" class="btn-secondary flex-1">
                Cancel
              </button>
              <button
                @click="handleJoinRoom"
                :disabled="joining || !playerName.trim()"
                class="btn-primary flex-1"
              >
                {{ joining ? 'Joining...' : 'Join Room' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrowserQRCodeReader } from '@zxing/library'

useHead({
  title: 'Join Game - Poker Pool Pal'
})

const { createPlayer, setCurrentPlayer } = usePlayer()
const { joinAsGuest } = useWebRTC()

const joinMethod = ref<'link' | 'qr'>('link')
const roomLink = ref('')
const videoElement = ref<HTMLVideoElement>()
const scanning = ref(false)
const error = ref('')
const scannedOffer = ref<RoomOffer | null>(null)
const playerName = ref('')
const playerAvatar = ref('⚡')
const joining = ref(false)

const playerAvatars = ['⚡', '🔥', '⭐', '💎', '🎮', '🎯', '🎪', '🎨']

let codeReader: BrowserQRCodeReader | null = null

const handlePaste = async (event: ClipboardEvent) => {
  const pastedText = event.clipboardData?.getData('text')
  if (pastedText) {
    roomLink.value = pastedText
  }
}

const parseAndJoin = () => {
  try {
    // Extract room data from URL
    const url = new URL(roomLink.value)
    const offerParam = url.searchParams.get('offer')

    if (!offerParam) {
      error.value = 'Invalid room link'
      return
    }

    const offer: RoomOffer = JSON.parse(decodeURIComponent(offerParam))

    if (offer.roomId && offer.roomName && offer.hostPeerId) {
      scannedOffer.value = offer
      error.value = ''
    } else {
      error.value = 'Invalid room data'
    }
  } catch (err) {
    console.error('Parse error:', err)
    error.value = 'Invalid room link format'
  }
}

const startScanning = async () => {
  error.value = ''

  try {
    codeReader = new BrowserQRCodeReader()
    const videoInputDevices = await codeReader.listVideoInputDevices()

    if (videoInputDevices.length === 0) {
      error.value = 'No camera found'
      return
    }

    const selectedDevice = videoInputDevices.find(device =>
      device.label.toLowerCase().includes('back')
    ) || videoInputDevices[0]

    scanning.value = true

    await codeReader.decodeFromVideoDevice(
      selectedDevice.deviceId,
      videoElement.value!,
      (result, err) => {
        if (result) {
          try {
            const offer: RoomOffer = JSON.parse(result.getText())

            if (offer.roomId && offer.roomName && offer.hostPeerId) {
              scannedOffer.value = offer
              stopScanning()
            }
          } catch (e) {
            error.value = 'Invalid QR code'
          }
        }
      }
    )
  } catch (err) {
    console.error('Camera error:', err)
    error.value = 'Failed to access camera'
    scanning.value = false
  }
}

const stopScanning = () => {
  codeReader?.reset()
  scanning.value = false

  if (videoElement.value?.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
  }
}

const handleJoinRoom = async () => {
  if (!scannedOffer.value || !playerName.value.trim()) return

  joining.value = true

  try {
    const player = createPlayer(playerName.value.trim(), playerAvatar.value, false)
    setCurrentPlayer(player)

    await joinAsGuest(scannedOffer.value.hostPeerId)

    await navigateTo(`/room/${scannedOffer.value.roomId}`)
  } catch (error) {
    console.error('Failed to join:', error)
    alert('Failed to join room')
    joining.value = false
  }
}

const resetJoin = () => {
  scannedOffer.value = null
  roomLink.value = ''
  playerName.value = ''
  error.value = ''
}

onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.scanner-container {
  position: relative;
  max-width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 0.5rem;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid #0f766e;
  border-radius: 0.5rem;
  pointer-events: none;
}

.scanner-line {
  position: absolute;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #0f766e, transparent);
  animation: scan 2s ease-in-out infinite;
  box-shadow: 0 0 10px #0f766e;
}

@keyframes scan {
  0%, 100% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
