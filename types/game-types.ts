export enum CellType {
  EMPTY = "empty",
  WALL = "wall",
  GOLD = "gold",
  EXIT = "exit",
}

export interface Cell {
  type: CellType
}

export interface Position {
  x: number
  y: number
}

export interface MapData {
  id: string
  name: string
  difficulty: "easy" | "medium" | "hard"
  timeLimit: number
  goldCount: number
  grid: Cell[][]
  startPosition: Position
  exitPosition: Position
}

export interface ScoreData {
  id: string
  mapId: string
  playerName: string
  character: string
  score: number
  timeCompleted: number
  completedInTime: boolean
  date: string
}

