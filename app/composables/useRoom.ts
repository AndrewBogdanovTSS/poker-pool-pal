import {useStorage} from '@vueuse/core'

export const useRoom = () => {
  const currentRoom = useStorage<Room | null>('poker-pool-current-room', null)

  const createRoom = (name: string, hostPlayer: Player, avatar?: string): Room => {
    const initialGameState: GameState = {
      phase: 'waiting',
      currentPlayerId: null,
      deck: [],
      balls: [],
      rackNumber: 0,
      deckPosition: 0,
      lastWinnerId: null
    }

    return {
      id: crypto.randomUUID(),
      name,
      avatar,
      hostId: hostPlayer.id,
      players: [hostPlayer],
      gameState: initialGameState,
      createdAt: Date.now()
    }
  }

  const addPlayerToRoom = (player: Player) => {
    if (currentRoom.value && !currentRoom.value.players.find(p => p.id === player.id)) {
      currentRoom.value.players.push(player)
    }
  }

  const removePlayerFromRoom = (playerId: string) => {
    if (currentRoom.value) {
      currentRoom.value.players = currentRoom.value.players.filter(p => p.id !== playerId)
    }
  }

  const isHost = computed(() => {
    if (!currentRoom.value) return false
    const { currentPlayer } = usePlayer()
    return currentRoom.value.hostId === currentPlayer.value?.id
  })

  const clearRoom = () => {
    currentRoom.value = null
  }

  return {
    currentRoom,
    createRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    isHost,
    clearRoom
  }
}
