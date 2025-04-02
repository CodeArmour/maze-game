"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hammer } from "lucide-react"
import type { PlayerData } from "@/components/game-container"
import { loadMap } from "@/lib/maps"
import { type MapData, type Cell, CellType, type Position } from "@/types/game-types"
import { saveScore } from "@/lib/scores"
import { useMobile } from "@/hooks/use-mobile"

interface GamePlayProps {
  playerData: PlayerData
  onComplete: (result: Partial<PlayerData>) => void
  onLeave: () => void
  onUpdateHammerUses: (uses: number) => void
}

export default function GamePlay({ playerData, onComplete, onLeave, onUpdateHammerUses }: GamePlayProps) {
  const [map, setMap] = useState<MapData | null>(null)
  const [grid, setGrid] = useState<Cell[][]>([])
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 })
  const [goldCollected, setGoldCollected] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameResult, setGameResult] = useState<"win" | "timeout" | null>(null)
  const [hammerUses, setHammerUses] = useState(playerData.hammerUses || 0)
  const [hammerActive, setHammerActive] = useState(false)
  const [cellToBreak, setCellToBreak] = useState<{ x: number; y: number } | null>(null)
  const isMobile = useMobile()
  const [attemptedBreak, setAttemptedBreak] = useState<{ x: number; y: number } | null>(null)

  // Load map data
  useEffect(() => {
    const initializeGame = async () => {
      const mapData = await loadMap(playerData.mapId)
      if (mapData) {
        // Count actual gold in the grid to ensure accuracy
        let actualGoldCount = 0
        for (let y = 0; y < mapData.grid.length; y++) {
          for (let x = 0; x < mapData.grid[y].length; x++) {
            if (mapData.grid[y][x].type === CellType.GOLD) {
              actualGoldCount++
            }
          }
        }

        // Update gold count if it doesn't match
        if (mapData.goldCount !== actualGoldCount) {
          mapData.goldCount = actualGoldCount
        }

        setMap(mapData)
        setGrid(mapData.grid)
        setPlayerPosition(mapData.startPosition)
        setGoldCollected(0)
        setTimeLeft(mapData.timeLimit)
      }
    }

    initializeGame()
  }, [playerData.mapId])

  // Timer countdown
  useEffect(() => {
    if (!map || isGameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleGameOver("timeout")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [map, isGameOver])

  const handleGameOver = async (result: "win" | "timeout") => {
    setIsGameOver(true)
    setGameResult(result)

    const timeCompleted = map ? map.timeLimit - timeLeft : 0
    const completedInTime = result === "win"

    // Save score
    if (map) {
      await saveScore({
        mapId: map.id,
        playerName: playerData.name,
        character: playerData.character,
        score: goldCollected,
        timeCompleted,
        completedInTime,
      })
    }

    // Pass result back to parent
    onComplete({
      score: goldCollected,
      timeCompleted,
      completedInTime,
    })
  }

  const toggleHammer = () => {
    if (hammerUses > 0) {
      setHammerActive(!hammerActive)
    }
  }

  useEffect(() => {
    if (
      attemptedBreak &&
      hammerActive &&
      hammerUses > 0 &&
      grid[attemptedBreak.y][attemptedBreak.x].type === CellType.WALL
    ) {
      const { y, x } = attemptedBreak
      // Don't allow breaking outer walls
      if (y === 0 || y === grid.length - 1 || x === 0 || x === grid[0].length - 1) {
        setAttemptedBreak(null)
        return
      }

      // Break the wall
      const newGrid = [...grid]
      newGrid[y][x] = { ...newGrid[y][x], type: CellType.EMPTY }
      setGrid(newGrid)

      // Reduce hammer uses
      const newHammerUses = hammerUses - 1
      setHammerUses(newHammerUses)
      onUpdateHammerUses(newHammerUses)

      // Deactivate hammer if no uses left
      if (newHammerUses === 0) {
        setHammerActive(false)
      }
      setAttemptedBreak(null)
    }
  }, [attemptedBreak, hammerActive, hammerUses, grid, onUpdateHammerUses])

  const useHammer = (y: number, x: number) => {
    setAttemptedBreak({ x, y })
  }

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (isGameOver || !map) return

      const newX = playerPosition.x + dx
      const newY = playerPosition.y + dy

      // Check if the new position is within bounds
      if (newX < 0 || newX >= grid[0]?.length || newY < 0 || newY >= grid.length) {
        return
      }

      // Check if the new position is a wall
      if (grid[newY][newX].type === CellType.WALL) {
        return
      }

      // Move player
      setPlayerPosition({ x: newX, y: newY })

      // Check if player collected gold
      if (grid[newY][newX].type === CellType.GOLD) {
        const newGrid = [...grid]
        newGrid[newY][newX] = { ...newGrid[newY][newX], type: CellType.EMPTY }
        setGrid(newGrid)
        setGoldCollected((prev) => prev + 1)
      }

      // Check if player reached the exit
      if (grid[newY][newX].type === CellType.EXIT) {
        // Check if all gold is collected
        if (goldCollected === map.goldCount) {
          handleGameOver("win")
        }
      }
    },
    [grid, playerPosition, isGameOver, map, goldCollected],
  )

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          movePlayer(0, -1)
          break
        case "ArrowDown":
          movePlayer(0, 1)
          break
        case "ArrowLeft":
          movePlayer(-1, 0)
          break
        case "ArrowRight":
          movePlayer(1, 0)
          break
        case "h":
          if (hammerUses > 0) {
            toggleHammer()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [movePlayer, hammerUses])

  const handleCellClick = (y: number, x: number) => {
    if (hammerActive) {
      useHammer(y, x)
    }
  }

  // Calculate cell size based on screen size
  const getCellSize = () => {
    if (!grid.length) return 10

    const maxGridDimension = Math.max(grid.length, grid[0]?.length || 0)

    if (isMobile) {
      // For mobile, make cells smaller
      return maxGridDimension > 12 ? 8 : maxGridDimension > 10 ? 9 : 10
    }

    // For desktop
    return maxGridDimension > 12 ? 9 : 10
  }

  const cellSize = getCellSize()

  if (!map) {
    return <div className="text-center">Loading map...</div>
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full max-w-md">
        <div className="text-lg">
          Gold: {goldCollected}/{map.goldCount}
        </div>
        <div className={`text-lg ${timeLeft < 10 ? "text-red-500" : ""}`}>Time: {timeLeft}s</div>
      </div>

      <Card className="p-2 sm:p-4 mb-4 overflow-auto max-w-full">
        <div className="grid grid-cols-1 gap-0">
          {grid.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-${cellSize} h-${cellSize} flex items-center justify-center border ${
                    playerPosition.x === x && playerPosition.y === y
                      ? "bg-primary text-primary-foreground"
                      : cell.type === CellType.WALL
                        ? hammerActive && !(y === 0 || y === grid.length - 1 || x === 0 || x === grid[0].length - 1)
                          ? "bg-muted-foreground/70 cursor-pointer hover:bg-muted-foreground/50"
                          : "bg-muted-foreground"
                        : cell.type === CellType.GOLD
                          ? "bg-yellow-500/20"
                          : cell.type === CellType.EXIT
                            ? "bg-green-500/20"
                            : "bg-background"
                  }`}
                  style={{ width: `${cellSize * 4}px`, height: `${cellSize * 4}px` }}
                  onClick={() => handleCellClick(y, x)}
                >
                  {playerPosition.x === x &&
                    playerPosition.y === y &&
                    (playerData.character === "explorer" ? "🧭" : playerData.character === "ninja" ? "🥷" : "🤖")}
                  {playerPosition.x !== x || playerPosition.y !== y
                    ? cell.type === CellType.GOLD
                      ? "💰"
                      : cell.type === CellType.EXIT
                        ? "🚪"
                        : ""
                    : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between w-full max-w-md mb-4 gap-4">
        <div className="grid grid-cols-3 gap-2 w-32 mx-auto sm:mx-0">
          <div></div>
          <Button variant="outline" className="p-2 h-12 w-12" onClick={() => movePlayer(0, -1)}>
            ↑
          </Button>
          <div></div>

          <Button variant="outline" className="p-2 h-12 w-12" onClick={() => movePlayer(-1, 0)}>
            ←
          </Button>
          <div></div>
          <Button variant="outline" className="p-2 h-12 w-12" onClick={() => movePlayer(1, 0)}>
            →
          </Button>

          <div></div>
          <Button variant="outline" className="p-2 h-12 w-12" onClick={() => movePlayer(0, 1)}>
            ↓
          </Button>
          <div></div>
        </div>

        {hammerUses > 0 && (
          <div className="flex flex-col items-center justify-center">
            <Button
              variant={hammerActive ? "default" : "outline"}
              className={`mb-1 ${hammerActive ? "bg-amber-500 hover:bg-amber-600" : "border-amber-500 text-amber-500"}`}
              onClick={toggleHammer}
              disabled={hammerUses === 0}
            >
              <Hammer className="mr-1 h-4 w-4" />
              Hammer {hammerActive ? "(Active)" : ""}
            </Button>
            <Badge variant="outline" className="border-amber-500 text-amber-500">
              {hammerUses} uses left
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-2">
        <Button variant="outline" onClick={onLeave} className="text-red-500 border-red-500 hover:bg-red-500/10">
          Leave Game
        </Button>
      </div>
    </div>
  )
}

