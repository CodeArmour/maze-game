"use client"

import type React from "react"
import { useState, useEffect } from "react"

// Define types
enum CellType {
  EMPTY = "EMPTY",
  WALL = "WALL",
  GOLD = "GOLD",
  START = "START",
  EXIT = "EXIT",
}

interface Cell {
  x: number
  y: number
  type: CellType
}

interface Position {
  x: number
  y: number
}

interface MapData {
  id: string
  name: string
  difficulty: string
  timeLimit: number
  goldCount: number
  grid: Cell[][]
  startPosition: Position
  exitPosition: Position
}

// Placeholder for addMap function (replace with your actual implementation)
const addMap = async (mapData: MapData) => {
  console.log("Map saved:", mapData)
  // Simulate API call
  return new Promise((resolve) => setTimeout(resolve, 500))
}

const MapEditorPage: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gridSize, setGridSize] = useState<number>(10)
  const [selectedCellType, setSelectedCellType] = useState<CellType>(CellType.WALL)
  const [mapName, setMapName] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("easy")
  const [timeLimit, setTimeLimit] = useState<number>(60)
  const [startPosition, setStartPosition] = useState<Position | null>(null)
  const [exitPosition, setExitPosition] = useState<Position | null>(null)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    initializeGrid()
  }, [gridSize])

  const initializeGrid = () => {
    const newGrid: Cell[][] = []
    for (let y = 0; y < gridSize; y++) {
      newGrid[y] = []
      for (let x = 0; x < gridSize; x++) {
        newGrid[y][x] = { x, y, type: CellType.EMPTY }
      }
    }
    setGrid(newGrid)
    setStartPosition(null)
    setExitPosition(null)
  }

  const countGoldInGrid = () => {
    let count = 0
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x].type === CellType.GOLD) {
          count++
        }
      }
    }
    return count
  }

  const handleCellClick = (x: number, y: number) => {
    const newGrid = grid.map((row) =>
      row.map((cell) => {
        if (cell.x === x && cell.y === y) {
          if (selectedCellType === CellType.START) {
            if (startPosition) {
              // Reset previous start position
              grid[startPosition.y][startPosition.x] = {
                ...grid[startPosition.y][startPosition.x],
                type: CellType.EMPTY,
              }
            }
            setStartPosition({ x, y })
          } else if (selectedCellType === CellType.EXIT) {
            if (exitPosition) {
              // Reset previous exit position
              grid[exitPosition.y][exitPosition.x] = { ...grid[exitPosition.y][exitPosition.x], type: CellType.EMPTY }
            }
            setExitPosition({ x, y })
          }
          return { ...cell, type: selectedCellType }
        }
        return cell
      }),
    )
    setGrid(newGrid)
  }

  const handleSaveMap = async () => {
    if (!mapName) {
      setMessage("Please enter a map name")
      return
    }

    if (!startPosition) {
      setMessage("Please set a start position")
      return
    }

    if (!exitPosition) {
      setMessage("Please set an exit position")
      return
    }

    // Count actual gold in the grid
    const actualGoldCount = countGoldInGrid()

    if (actualGoldCount === 0) {
      setMessage("Please add at least one gold piece")
      return
    }

    const newMap: MapData = {
      id: `map_${Date.now()}`,
      name: mapName,
      difficulty,
      timeLimit,
      goldCount: actualGoldCount, // Use the actual count
      grid,
      startPosition: { x: startPosition.x, y: startPosition.y },
      exitPosition: { x: exitPosition.x, y: exitPosition.y },
    }

    await addMap(newMap)
    setMessage("Map saved successfully!")

    // Reset form
    setMapName("")
    initializeGrid()
  }

  return (
    <div>
      <h1>Map Editor</h1>
      <div>
        <label>Grid Size:</label>
        <input type="number" value={gridSize} onChange={(e) => setGridSize(Number.parseInt(e.target.value))} />
      </div>
      <div>
        <label>Map Name:</label>
        <input type="text" value={mapName} onChange={(e) => setMapName(e.target.value)} />
      </div>
      <div>
        <label>Difficulty:</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div>
        <label>Time Limit:</label>
        <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number.parseInt(e.target.value))} />
      </div>
      <div>
        <label>Select Cell Type:</label>
        <select value={selectedCellType} onChange={(e) => setSelectedCellType(e.target.value as CellType)}>
          <option value={CellType.WALL}>Wall</option>
          <option value={CellType.EMPTY}>Empty</option>
          <option value={CellType.GOLD}>Gold</option>
          <option value={CellType.START}>Start</option>
          <option value={CellType.EXIT}>Exit</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 30px)` }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: "30px",
                height: "30px",
                border: "1px solid black",
                backgroundColor:
                  cell.type === CellType.WALL
                    ? "black"
                    : cell.type === CellType.GOLD
                      ? "yellow"
                      : cell.type === CellType.START
                        ? "green"
                        : cell.type === CellType.EXIT
                          ? "red"
                          : "white",
                cursor: "pointer",
              }}
              onClick={() => handleCellClick(x, y)}
            />
          )),
        )}
      </div>
      <button onClick={handleSaveMap}>Save Map</button>
      {message && <div>{message}</div>}
    </div>
  )
}

export default MapEditorPage

