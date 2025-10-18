import Peer from 'peerjs'

const isBrowser = typeof window !== 'undefined'

export const useWebRTC = () => {
  const peer = ref<Peer | null>(null)
  const connections = ref<Map<string, any>>(new Map())
  const isConnected = ref(false)
  const myPeerId = ref<string>('')

  const createHost = (): Promise<string> => {
    if (!isBrowser) {
      return Promise.reject(new Error('WebRTC only available in browser'))
    }

    return new Promise((resolve, reject) => {
      try {
        // Create peer with random ID
        peer.value = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        })

        peer.value.on('open', (id) => {
          myPeerId.value = id
          console.log('Host peer ID:', id)
          resolve(id) // Return peer ID instead of signal data
        })

        peer.value.on('connection', (conn) => {
          setupConnection(conn)
        })

        peer.value.on('error', (err) => {
          console.error('Peer error:', err)
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  const joinAsGuest = (hostPeerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        peer.value = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        })

        peer.value.on('open', (id) => {
          myPeerId.value = id
          console.log('Guest peer ID:', id)

          // Connect to host
          const conn = peer.value!.connect(hostPeerId)
          setupConnection(conn)
          resolve()
        })

        peer.value.on('error', (err) => {
          console.error('Guest peer error:', err)
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  const setupConnection = (conn: any) => {
    conn.on('open', () => {
      console.log('Connection established')
      connections.value.set(conn.peer, conn)
      isConnected.value = true
    })

    conn.on('data', (data: any) => {
      handleIncomingMessage(data)
    })

    conn.on('close', () => {
      console.log('Connection closed')
      connections.value.delete(conn.peer)
      isConnected.value = connections.value.size > 0
    })
  }

  const handleIncomingMessage = (message: any) => {
    console.log('Received message:', message.type, message.payload)
    const { addPlayerToRoom, removePlayerFromRoom } = useRoom()

    switch (message.type) {
      case 'player-joined':
        addPlayerToRoom(message.payload)
        break
      case 'player-left':
        removePlayerFromRoom(message.payload.playerId)
        break
    }
  }

  const sendMessage = (message: any) => {
    connections.value.forEach((conn) => {
      if (conn.open) {
        conn.send(message)
      }
    })
  }

  const broadcastPlayerJoined = (player: any) => {
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

    connections.value.forEach(conn => conn.close())
    peer.value?.destroy()

    peer.value = null
    connections.value.clear()
    isConnected.value = false
  }

  return {
    isConnected,
    myPeerId,
    createHost,
    joinAsGuest,
    sendMessage,
    broadcastPlayerJoined,
    broadcastGameState,
    leaveRoom
  }
}
