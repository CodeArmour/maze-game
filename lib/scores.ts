import type { ScoreData } from "@/types/game-types"

// In-memory storage for scores (in a real app, this would be a database)
let scores: ScoreData[] = []

interface SaveScoreParams {
  mapId: string
  playerName: string
  character: string
  score: number
  timeCompleted: number
  completedInTime: boolean
}

// Function to save a score
export async function saveScore(params: SaveScoreParams): Promise<ScoreData> {
  const newScore: ScoreData = {
    id: Date.now().toString(),
    mapId: params.mapId,
    playerName: params.playerName,
    character: params.character,
    score: params.score,
    timeCompleted: params.timeCompleted,
    completedInTime: params.completedInTime,
    date: new Date().toISOString(),
  }

  scores.push(newScore)
  return newScore
}

// Function to get scores for a specific map
export async function getScoresByMap(mapId: string): Promise<ScoreData[]> {
  return scores
    .filter((score) => score.mapId === mapId)
    .sort((a, b) => {
      // Sort by completion status first
      if (a.completedInTime !== b.completedInTime) {
        return a.completedInTime ? -1 : 1
      }

      // Then by score (higher is better)
      if (a.score !== b.score) {
        return b.score - a.score
      }

      // Then by time (lower is better)
      return a.timeCompleted - b.timeCompleted
    })
}

// Function to get top scores across all maps
export async function getTopScores(limit = 10): Promise<ScoreData[]> {
  return scores
    .filter((score) => score.completedInTime)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Function to get all scores
export async function getAllScores(): Promise<ScoreData[]> {
  return [...scores]
}

// Add some sample scores for demonstration
const sampleScores = [
  {
    id: "1",
    mapId: "map1",
    playerName: "Alice",
    character: "explorer",
    score: 5,
    timeCompleted: 45,
    completedInTime: true,
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: "2",
    mapId: "map2",
    playerName: "Bob",
    character: "ninja",
    score: 6,
    timeCompleted: 85,
    completedInTime: true,
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    mapId: "map3",
    playerName: "Charlie",
    character: "robot",
    score: 8,
    timeCompleted: 110,
    completedInTime: true,
    date: new Date().toISOString(), // today
  },
  {
    id: "4",
    mapId: "map1",
    playerName: "David",
    character: "explorer",
    score: 3,
    timeCompleted: 60,
    completedInTime: false,
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
  },
  {
    id: "5",
    mapId: "map4",
    playerName: "Emma",
    character: "ninja",
    score: 12,
    timeCompleted: 140,
    completedInTime: true,
    date: new Date(Date.now() - 86400000 * 1.5).toISOString(), // 1.5 days ago
  },
]

// Add sample scores to the scores array
scores = [...sampleScores]

