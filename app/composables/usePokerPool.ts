export const usePokerPool = () => {
  // Create a full 52-card deck
  const createFullDeck = (): Card[] => {
    const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
    const ranks: CardRank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
    const deck: Card[] = []

    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({
          rank,
          suit,
          id: `${rank}-${suit}-${crypto.randomUUID()}`
        })
      })
    })

    return shuffleDeck(deck)
  }

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))

      // TypeScript-safe swap using non-null assertions
      const temp = shuffled[i]!  // ✅ Tell TS this is NOT undefined
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }
    return shuffled
  }

  // Create a new rack: 12 open + 3 hidden cards from deck
  const createRack = (deck: Card[], deckPosition: number): { balls: Ball[], newDeckPosition: number } => {
    const balls: Ball[] = []
    let currentPosition = deckPosition

    // Take 15 cards from the deck
    for (let i = 1; i <= 15; i++) {
      if (currentPosition >= deck.length) {
        throw new Error('Deck exhausted')
      }

      const card = deck[currentPosition]
      currentPosition++

      // First 12 balls are open, last 3 are hidden
      const isOpen = i <= 12

      balls.push({
        number: i,
        card,
        isOpen,
        isPocketed: false,
        pocketedBy: null
      })
    }

    // Shuffle ball positions (not card assignments)
    return {
      balls: shuffleBallPositions(balls),
      newDeckPosition: currentPosition
    }
  }

  const shuffleBallPositions = (balls: Ball[]): Ball[] => {
    const shuffled = [...balls]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))

      // TypeScript-safe swap
      const temp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }
    // Reassign ball numbers
    return shuffled.map((ball, index) => ({
      ...ball,
      number: index + 1
    }))
  }

  // Pocket a ball and collect its card
  const pocketBall = (
    ballNumber: number,
    playerId: string,
    balls: Ball[],
    players: Player[]
  ): { updatedBalls: Ball[], updatedPlayers: Player[] } => {
    const ball = balls.find(b => b.number === ballNumber)
    if (!ball || ball.isPocketed) {
      return { updatedBalls: balls, updatedPlayers: players }
    }

    // Mark ball as pocketed and reveal if hidden
    const updatedBalls = balls.map(b =>
      b.number === ballNumber
        ? { ...b, isPocketed: true, pocketedBy: playerId, isOpen: true }
        : b
    )

    // Add card to player's hand
    const updatedPlayers = players.map(p =>
      p.id === playerId
        ? { ...p, hand: [...p.hand, ball.card] }
        : p
    )

    return { updatedBalls, updatedPlayers }
  }

  // Evaluate all possible 5-card hands from player's cards
  const evaluateBestHand = (cards: Card[]): PokerHandResult | null => {
    if (cards.length < 5) return null

    const allHands: PokerHandResult[] = []

    // Generate all 5-card combinations
    const combinations = getCombinations(cards, 5)

    for (const fiveCards of combinations) {
      const hand = evaluateFiveCardHand(fiveCards)
      allHands.push(hand)
    }

    if (allHands.length === 0) return null

    // Return best hand
    return allHands.reduce((best, current) =>
      compareHands(current, best) > 0 ? current : best
    )
  }

  const getCombinations = <T>(array: T[], size: number): T[][] => {
    const result: T[][] = []

    const combine = (start: number, combo: T[]) => {
      if (combo.length === size) {
        result.push([...combo])
        return
      }

      for (let i = start; i < array.length; i++) {
        combo.push(array[i])
        combine(i + 1, combo)
        combo.pop()
      }
    }

    combine(0, [])
    return result
  }

  const evaluateFiveCardHand = (cards: Card[]): PokerHandResult => {
    const sortedCards = [...cards].sort((a, b) =>
      CARD_VALUES[b.rank] - CARD_VALUES[a.rank]
    )

    const ranks = sortedCards.map(c => c.rank)
    const suits = sortedCards.map(c => c.suit)
    const values = ranks.map(r => CARD_VALUES[r])

    const isFlush = suits.every(s => s === suits[0])
    const isStraight = checkStraight(values)
    const rankCounts = countRanks(ranks)

    // Royal Flush
    if (isFlush && isStraight && values[0] === 14 && values[4] === 10) {
      return {
        name: 'Royal Flush',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Royal Flush'],
        highCard: 'A'
      }
    }

    // Straight Flush
    if (isFlush && isStraight) {
      return {
        name: 'Straight Flush',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Straight Flush'],
        highCard: ranks[0]
      }
    }

    // Four of a Kind
    if (Object.values(rankCounts).includes(4)) {
      const fourRank = Object.keys(rankCounts).find(k => rankCounts[k] === 4) as CardRank
      return {
        name: 'Four of a Kind',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Four of a Kind'],
        highCard: fourRank
      }
    }

    // Full House
    const hasThree = Object.values(rankCounts).includes(3)
    const hasTwo = Object.values(rankCounts).includes(2)
    if (hasThree && hasTwo) {
      const threeRank = Object.keys(rankCounts).find(k => rankCounts[k] === 3) as CardRank
      return {
        name: 'Full House',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Full House'],
        highCard: threeRank
      }
    }

    // Flush
    if (isFlush) {
      return {
        name: 'Flush',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Flush'],
        highCard: ranks[0]
      }
    }

    // Straight
    if (isStraight) {
      return {
        name: 'Straight',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Straight'],
        highCard: ranks[0]
      }
    }

    // Three of a Kind
    if (hasThree) {
      const threeRank = Object.keys(rankCounts).find(k => rankCounts[k] === 3) as CardRank
      return {
        name: 'Three of a Kind',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Three of a Kind'],
        highCard: threeRank
      }
    }

    // Two Pair
    const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2)
    if (pairs.length === 2) {
      const highPairRank = pairs.reduce((a, b) =>
        CARD_VALUES[a[0] as CardRank] > CARD_VALUES[b[0] as CardRank] ? a : b
      )[0] as CardRank
      return {
        name: 'Two Pair',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Two Pair'],
        highCard: highPairRank
      }
    }

    // Pair
    if (pairs.length === 1) {
      return {
        name: 'Pair',
        cards: sortedCards,
        score: POKER_HAND_SCORES['Pair'],
        highCard: pairs[0][0] as CardRank
      }
    }

    // High Card
    return {
      name: 'High Card',
      cards: sortedCards,
      score: POKER_HAND_SCORES['High Card'],
      highCard: ranks[0]
    }
  }

  const checkStraight = (values: number[]): boolean => {
    const sorted = [...values].sort((a, b) => b - a)

    // Check regular straight
    let isConsecutive = true
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] - sorted[i + 1] !== 1) {
        isConsecutive = false
        break
      }
    }

    if (isConsecutive) return true

    // Check for A-2-3-4-5 (wheel)
    if (sorted[0] === 14 && sorted[1] === 5 && sorted[2] === 4 &&
        sorted[3] === 3 && sorted[4] === 2) {
      return true
    }

    return false
  }

  const countRanks = (ranks: CardRank[]): Record<string, number> => {
    const counts: Record<string, number> = {}
    ranks.forEach(rank => {
      counts[rank] = (counts[rank] || 0) + 1
    })
    return counts
  }

  const compareHands = (hand1: PokerHandResult, hand2: PokerHandResult): number => {
    // Compare scores first
    if (hand1.score !== hand2.score) {
      return hand1.score - hand2.score
    }

    // Same hand type, compare high cards
    const value1 = CARD_VALUES[hand1.highCard]
    const value2 = CARD_VALUES[hand2.highCard]
    return value1 - value2
  }

  const allBallsPocketed = (balls: Ball[]): boolean => {
    return balls.every(b => b.isPocketed)
  }

  return {
    createFullDeck,
    shuffleDeck,
    createRack,
    pocketBall,
    evaluateBestHand,
    evaluateFiveCardHand,
    compareHands,
    allBallsPocketed
  }
}
