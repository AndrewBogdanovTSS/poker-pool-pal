<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
    <div class="max-w-2xl mx-auto pt-8">
      <!-- Back Button -->
      <NuxtLink to="/" class="inline-flex items-center text-primary-700 mb-6 hover:text-primary-800 transition-colors">
        <span class="text-xl mr-2">←</span>
        <span class="font-medium">Back to Home</span>
      </NuxtLink>

      <!-- QR Scanner Card -->
      <div v-if="!scannedOffer" class="card">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Scan QR Code</h2>

        <div class="scanner-container relative mb-6">
          <video
            ref="videoElement"
            class="w-full rounded-lg bg-gray-900"
            autoplay
            playsinline
          ></video>

          <!-- Scanner Overlay -->
          <div v-if="scanning" class="scanner-overlay">
            <div class="scanner-line"></div>
            <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Scanning...
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="absolute bottom-4 left-4 right-4 p-3 bg-red-500 text-white rounded-lg text-sm shadow-lg">
            {{ error }}
          </div>
        </div>

        <!-- Camera Controls -->
        <div class="flex gap-3">
          <button
            v-if="!scanning"
            @click="startScanning"
            class="btn-primary flex-1"
          >
            <span class="text-lg mr-2">📷</span>
            Start Camera
          </button>

          <button
            v-else
            @click="stopScanning"
            class="btn-secondary flex-1"
          >
            <span class="text-lg mr-2">⏸️</span>
            Stop Camera
          </button>
        </div>

        <!-- Instructions -->
        <div class="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h3 class="font-semibold text-primary-900 mb-2">How to Join:</h3>
          <ol class="text-sm text-primary-800 space-y-1 list-decimal list-inside">
            <li>Click "Start Camera" to activate QR scanner</li>
            <li>Point your camera at the host's QR code</li>
            <li>Wait for automatic detection</li>
            <li>Enter your player details to join</li>
          </ol>
        </div>
      </div>

      <!-- Room Found - Player Details Form -->
      <div v-else class="space-y-6">
        <!-- Room Info Card -->
        <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span class="text-2xl">✓</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-green-900">Room Found!</h3>
              <p class="text-sm text-green-700">Ready to join</p>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Room Name</p>
                <p class="font-semibold text-gray-800">{{ scannedOffer.roomName }}</p>
              </div>
              <div>
                <p class="text-gray-600">Host</p>
                <p class="font-semibold text-gray-800">{{ scannedOffer.hostName }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Join Form Card -->
        <div class="card">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Join as Player</h2>

          <form @submit.prevent="handleJoinRoom" class="space-y-6">
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

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                type="button"
                @click="scannedOffer = null"
                class="btn-secondary flex-1"
              >
                ← Scan Again
              </button>
              <button
                type="submit"
                class="btn-primary flex-1"
                :disabled="joining || !playerName.trim()"
              >
                <span v-if="joining">Joining...</span>
                <span v-else>Join Room →</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrowserQRCodeReader } from '@zxing/library'

useHead({
  title: 'Join Room - Poker Pool Pal'
})

const { createPlayer, setCurrentPlayer } = usePlayer()
const { joinAsGuest } = useWebRTC()

const videoElement = ref<HTMLVideoElement>()
const scanning = ref(false)
const error = ref('')
const scannedOffer = ref<RoomOffer | null>(null)
const playerName = ref('')
const playerAvatar = ref('⚡')
const joining = ref(false)

const playerAvatars = ['⚡', '🔥', '⭐', '💎', '🎮', '🎯', '🎪', '🎨']

let codeReader: BrowserQRCodeReader | null = null

const startScanning = async () => {
  error.value = ''

  try {
    codeReader = new BrowserQRCodeReader()

    const videoInputDevices = await codeReader.listVideoInputDevices()

    if (videoInputDevices.length === 0) {
      error.value = 'No camera found on this device'
      return
    }

    // Prefer back camera on mobile
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

            // Validate the offer has required fields
            if (offer.roomId && offer.roomName && offer.signalData) {
              scannedOffer.value = offer
              stopScanning()
            } else {
              error.value = 'Invalid QR code format'
            }
          } catch (e) {
            error.value = 'Invalid QR code - not a Poker Pool room'
          }
        }

        // Ignore NotFoundException (no QR code in frame yet)
        if (err && err.name !== 'NotFoundException') {
          console.error('Scanning error:', err)
        }
      }
    )
  } catch (err) {
    console.error('Camera access error:', err)
    error.value = 'Failed to access camera. Please grant camera permissions in your browser settings.'
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
    // Create player
    const player = createPlayer(playerName.value.trim(), playerAvatar.value, false)
    setCurrentPlayer(player)

    // Join via WebRTC
    const guestSignalData = await joinAsGuest(scannedOffer.value.hostPeerId)

    // Navigate to room with signal data
    const signalParam = encodeURIComponent(JSON.stringify(guestSignalData))
    await navigateTo(`/room/${scannedOffer.value.roomId}?signal=${signalParam}`)
  } catch (error) {
    console.error('Failed to join room:', error)
    alert('Failed to join room. Please try again or ask the host to create a new room.')
    joining.value = false
  }
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
