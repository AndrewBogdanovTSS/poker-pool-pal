import {useStorage} from '@vueuse/core'

export const usePlayer = () => {
  const currentPlayer = useStorage<Player>('poker-pool-current-player', null)

  const createPlayer = (name: string, avatar?: string, isHost = false): Player => {
    return {
      id: crypto.randomUUID(),
      name,
      avatar,
      isHost,
      hand: [],
      turnOrder: 0,
      isWinner: false
    }
  }

  const setCurrentPlayer = (player: Player) => {
    currentPlayer.value = player
  }

  const clearCurrentPlayer = () => {
    currentPlayer.value = null
  }

  return {
    currentPlayer,
    createPlayer,
    setCurrentPlayer,
    clearCurrentPlayer
  }
}
