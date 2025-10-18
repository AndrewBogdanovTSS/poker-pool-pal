export type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export interface Card {
  rank: CardRank
  suit: CardSuit
  id: string
}

export interface Ball {
  number: number // 1-15
  card: Card
  isOpen: boolean // true = revealed to all, false = hidden until pocketed
  isPocketed: boolean
  pocketedBy: string | null
}

export interface Player {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  hand: Card[] // Cards collected from pocketed balls
  turnOrder: number
  isWinner: boolean
  claimedHand?: PokerHandResult
}

export interface Room {
  id: string
  name: string
  avatar?: string
  hostId: string
  players: Player[]
  gameState: GameState
  createdAt: number
}

export interface GameState {
  phase: 'waiting' | 'playing' | 'round-ended' | 'game-finished'
  currentPlayerId: string | null
  deck: Card[] // Full 52-card deck (shuffled at start)
  balls: Ball[] // Current rack of 15 balls
  rackNumber: number
  deckPosition: number // Number of cards dealt from deck
  lastWinnerId: string | null
}

export interface PokerHandResult {
  name: PokerHandName
  cards: Card[] // The 5 cards that make up this hand
  score: number
  highCard: CardRank
}

export type PokerHandName = 
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'Pair'
  | 'High Card'

export interface WebRTCMessage {
  type: 'player-joined' | 'player-left' | 'game-started' | 
        'ball-pocketed' | 'hand-claimed' | 'round-ended' | 
        'new-rack' | 'game-state-update' | 'turn-ended'
  payload: any
  timestamp: number
  senderId: string
}

export interface RoomOffer {
  roomId: string
  roomName: string
  hostName: string
  signalData: any
  timestamp: number
}

// Poker hand scoring (higher = better)
export const POKER_HAND_SCORES: Record<PokerHandName, number> = {
  'Royal Flush': 10,
  'Straight Flush': 9,
  'Four of a Kind': 8,
  'Full House': 7,
  'Flush': 6,
  'Straight': 5,
  'Three of a Kind': 4,
  'Two Pair': 3,
  'Pair': 2,
  'High Card': 1
}

// Card rank values for comparison
export const CARD_VALUES: Record<CardRank, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
}