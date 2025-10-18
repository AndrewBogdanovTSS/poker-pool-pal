import SimplePeer from 'simple-peer'

// Check if we're in browser
const isBrowser = typeof window !== 'undefined'

export const useWebRTC = () => {
  const peers = ref<Map<string, SimplePeer.Instance>>(new Map())
  const isConnected = ref(false)
  const hostPeer = ref<SimplePeer.Instance | null>(null)

  const createHost = (): Promise<any> => {
    if (!isBrowser) {
      return Promise.reject(new Error('WebRTC only available in browser'))
    }

    return new Promise((resolve, reject) => {
      try {
        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        })

        // Add timeout
        const timeout = setTimeout(() => {
          reject(new Error('WebRTC connection timeout'))
        }, 10000)

        peer.on('signal', (signalData) => {
          clearTimeout(timeout)
          resolve(signalData)
        })

        peer.on('error', (err) => {
          clearTimeout(timeout)
          console.error('Host peer error:', err)
          reject(err)
        })

        hostPeer.value = peer
        setupPeerListeners(peer, 'host')
      } catch (error) {
        reject(error)
      }
    })
  }

  const joinAsGuest = (hostSignalData: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      })

      peer.on('signal', (signalData) => {
        resolve(signalData)
      })

      peer.on('error', (err) => {
        console.error('Guest peer error:', err)
        reject(err)
      })

      peer.signal(hostSignalData)
      hostPeer.value = peer
      setupPeerListeners(peer, 'guest')
    })
  }

  const completeHostConnection = (guestSignalData: any, guestId: string) => {
    if (hostPeer.value) {
      hostPeer.value.signal(guestSignalData)
      peers.value.set(guestId, hostPeer.value)
    }
  }

  const setupPeerListeners = (peer: SimplePeer.Instance, role: string) => {
    peer.on('connect', () => {
      console.log(`${role} connected`)
      isConnected.value = true
    })

    peer.on('data', (data) => {
      try {
        const message: WebRTCMessage = JSON.parse(data.toString())
        handleIncomingMessage(message)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    })

    peer.on('close', () => {
      console.log(`${role} connection closed`)
      isConnected.value = false
    })
  }

  const handleIncomingMessage = (message: WebRTCMessage) => {
    console.log('Received message:', message.type, message.payload)

    const { addPlayerToRoom, removePlayerFromRoom } = useRoom()

    switch (message.type) {
      case 'player-joined':
        addPlayerToRoom(message.payload as Player)
        break
      case 'player-left':
        removePlayerFromRoom(message.payload.playerId)
        break
      case 'game-state-update':
        // Handle game state synchronization
        break
    }
  }

  const sendMessage = (message: WebRTCMessage) => {
    const data = JSON.stringify(message)

    if (hostPeer.value && hostPeer.value.connected) {
      hostPeer.value.send(data)
    }

    peers.value.forEach((peer) => {
      if (peer.connected) {
        peer.send(data)
      }
    })
  }

  const broadcastPlayerJoined = (player: Player) => {
    sendMessage({
      type: 'player-joined',
      payload: player,
      timestamp: Date.now(),
      senderId: player.id
    })
  }

  const broadcastGameState = (gameState: any) => {
    sendMessage({
      type: 'game-state-update',
      payload: gameState,
      timestamp: Date.now(),
      senderId: usePlayer().currentPlayer.value?.id || ''
    })
  }

  const leaveRoom = () => {
    const { currentPlayer } = usePlayer()

    if (currentPlayer.value) {
      sendMessage({
        type: 'player-left',
        payload: { playerId: currentPlayer.value.id },
        timestamp: Date.now(),
        senderId: currentPlayer.value.id
      })
    }

    // Close all peer connections
    hostPeer.value?.destroy()
    peers.value.forEach(peer => peer.destroy())

    hostPeer.value = null
    peers.value.clear()
    isConnected.value = false
  }

  return {
    peers,
    isConnected,
    createHost,
    joinAsGuest,
    completeHostConnection,
    sendMessage,
    broadcastPlayerJoined,
    broadcastGameState,
    leaveRoom
  }
}
