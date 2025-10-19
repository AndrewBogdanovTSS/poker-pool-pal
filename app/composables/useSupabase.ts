import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()

  if (!supabaseClient) {
    const supabaseUrl = config.public.supabaseUrl as string
    const supabaseKey = config.public.supabaseAnonKey as string

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured')
      return {
        client: null,
        saveRoom: async () => null,
        loadRoom: async () => null,
        updateRoom: async () => null,
        saveGameSession: async () => null,
        listActiveSessions: async () => []
      }
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  const saveRoom = async (room: Room) => {
    if (!supabaseClient) return null

    const { data, error } = await supabaseClient
      .from('rooms')
      .upsert({
        id: room.id,
        name: room.name,
        avatar: room.avatar,
        host_id: room.hostId,
        players: room.players,
        game_state: room.gameState,
        created_at: new Date(room.createdAt).toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error saving room:', error)
      return null
    }

    return data
  }

  const loadRoom = async (roomId: string) => {
    if (!supabaseClient) return null

    const { data, error } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle()

    if (error) {
      console.error('Error loading room:', error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      hostId: data.host_id,
      players: data.players,
      gameState: data.game_state,
      createdAt: new Date(data.created_at).getTime()
    } as Room
  }

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    if (!supabaseClient) return null

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (updates.name) updateData.name = updates.name
    if (updates.avatar) updateData.avatar = updates.avatar
    if (updates.players) updateData.players = updates.players
    if (updates.gameState) updateData.game_state = updates.gameState

    const { data, error } = await supabaseClient
      .from('rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating room:', error)
      return null
    }

    return data
  }

  const saveGameSession = async (session: {
    room_id: string
    winner_id?: string
    winner_hand?: PokerHandResult
    players: Player[]
    final_state: GameState
  }) => {
    if (!supabaseClient) return null

    const { data, error } = await supabaseClient
      .from('game_sessions')
      .insert({
        ...session,
        created_at: new Date().toISOString()
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error saving game session:', error)
      return null
    }

    return data
  }

  const listActiveSessions = async (limit = 10) => {
    if (!supabaseClient) return []

    const { data, error } = await supabaseClient
      .from('rooms')
      .select('id, name, avatar, players, created_at')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error listing sessions:', error)
      return []
    }

    return data || []
  }

  return {
    client: supabaseClient,
    saveRoom,
    loadRoom,
    updateRoom,
    saveGameSession,
    listActiveSessions
  }
}
