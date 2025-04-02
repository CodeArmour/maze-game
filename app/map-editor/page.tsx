"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CellType, type MapData, type Cell, type Position } from "@/types/game-types"
import { addMap } from "@/lib/maps"
import Link from "next/link"

export default function MapEditorPage() {
  const [mapName, setMapName] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [timeLimit, setTimeLimit] = useState(60)
  const [gridSize, setGridSize] = useState({ width: 10, height: 10 })
  const [grid, setGrid] = useState<Cell[][]>([])
  const [selectedTool, setSelectedTool] = useState<CellType>(CellType.WALL)
  const [startPosition, setStartPosition] = useState<Position | null>(null)
  const [exitPosition, setExitPosition] = useState<Position | null>(null)
  const [goldCount, setGoldCount] = useState(0)
  const [message, setMessage] = useState("")

  // Initialize grid
  useEffect(() => {
    initializeGrid()
  }, [gridSize])

  const initializeGrid = () => {
    // Create empty grid
    const newGrid: Cell[][] = Array(gridSize.height)
      .fill(null)
      .map(() =>
        Array(gridSize.width)
          .fill(null)
          .map(() => ({ type: CellType.EMPTY })),
      )

    // Add walls around the edges
    for (let i = 0; i < gridSize.width; i++) {
      newGrid[0][i] = { type: CellType.WALL }
      newGrid[gridSize.height - 1][i] = { type: CellType.WALL }
    }

    for (let i = 0; i < gridSize.height; i++) {
      newGrid[i][0] = { type: CellType.WALL }
      newGrid[i][gridSize.width - 1] = { type: CellType.WALL }
    }

    setGrid(newGrid)
    setStartPosition(null)
    setExitPosition(null)
    setGoldCount(0)
  }

  const handleCellClick = (y: number, x: number) => {
    // Don't allow editing the border walls
    if (y === 0 || x === 0 || y === gridSize.height - 1 || x === gridSize.width - 1) {
      return
    }

    const newGrid = [...grid]

    // Handle special cases for start and exit positions
    if (selectedTool === CellType.EMPTY && grid[y][x].type === CellType.GOLD) {
      setGoldCount((prev) => prev - 1)
    }

    // Update the cell
    newGrid[y][x] = { type: selectedTool }

    // Update gold count
    if (selectedTool === CellType.GOLD) {
      setGoldCount((prev) => prev + 1)
    }

    setGrid(newGrid)
  }

  const handleSetStartPosition = (y: number, x: number) => {
    // Don't allow setting start position on walls or the border
    if (
      grid[y][x].type === CellType.WALL ||
      y === 0 ||
      x === 0 ||
      y === gridSize.height - 1 ||
      x === gridSize.width - 1
    ) {
      return
    }

    setStartPosition({ y, x })
  }

  const handleSetExitPosition = (y: number, x: number) => {
    // Don't allow setting exit position on walls or the border
    if (
      grid[y][x].type === CellType.WALL ||
      y === 0 ||
      x === 0 ||
      y === gridSize.height - 1 ||
      x === gridSize.width - 1
    ) {
      return
    }

    // Update the grid
    const newGrid = [...grid]

    // If there was a previous exit, remove it
    if (exitPosition) {
      newGrid[exitPosition.y][exitPosition.x] = { type: CellType.EMPTY }
    }

    // Set the new exit
    newGrid[y][x] = { type: CellType.EXIT }
    setGrid(newGrid)

    setExitPosition({ y, x })
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

    if (goldCount === 0) {
      setMessage("Please add at least one gold piece")
      return
    }

    const newMap: MapData = {
      id: `map_${Date.now()}`,
      name: mapName,
      difficulty,
      timeLimit,
      goldCount,
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Map Editor</h1>
        <div className="space-x-2">
          <Link href="/achievements">
            <Button variant="outline">View Achievements</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Game</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Map Design</CardTitle>
              <CardDescription>Click on cells to place items. Set start position and exit.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Button
                  variant={selectedTool === CellType.WALL ? "default" : "outline"}
                  onClick={() => setSelectedTool(CellType.WALL)}
                >
                  Wall
                </Button>
                <Button
                  variant={selectedTool === CellType.EMPTY ? "default" : "outline"}
                  onClick={() => setSelectedTool(CellType.EMPTY)}
                >
                  Empty
                </Button>
                <Button
                  variant={selectedTool === CellType.GOLD ? "default" : "outline"}
                  onClick={() => setSelectedTool(CellType.GOLD)}
                >
                  Gold
                </Button>
                <Button variant="outline" onClick={() => setSelectedTool(CellType.EXIT)} disabled>
                  Set Start
                </Button>
                <Button variant="outline" onClick={() => setSelectedTool(CellType.EXIT)} disabled>
                  Set Exit
                </Button>
              </div>

              <div className="overflow-auto">
                <div className="grid grid-cols-1 gap-0 w-fit">
                  {grid.map((row, y) => (
                    <div key={y} className="flex">
                      {row.map((cell, x) => (
                        <div
                          key={`${x}-${y}`}
                          className={`w-8 h-8 flex items-center justify-center border ${
                            startPosition?.x === x && startPosition?.y === y
                              ? "bg-blue-500"
                              : cell.type === CellType.WALL
                                ? "bg-muted-foreground"
                                : cell.type === CellType.GOLD
                                  ? "bg-yellow-500/20"
                                  : cell.type === CellType.EXIT
                                    ? "bg-green-500/20"
                                    : "bg-background"
                          } cursor-pointer`}
                          onClick={() => handleCellClick(y, x)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            if (e.ctrlKey) {
                              handleSetStartPosition(y, x)
                            } else if (e.shiftKey) {
                              handleSetExitPosition(y, x)
                            }
                          }}
                        >
                          {startPosition?.x === x && startPosition?.y === y && "S"}
                          {cell.type === CellType.GOLD && "💰"}
                          {cell.type === CellType.EXIT && "🚪"}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>Ctrl+Click to set start position</p>
                <p>Shift+Click to set exit position</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Map Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapName">Map Name</Label>
                  <Input
                    id="mapName"
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    placeholder="Enter map name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 60)}
                    min={30}
                    max={300}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Map Stats</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p>
                      Size: {gridSize.width}x{gridSize.height}
                    </p>
                    <p>Gold Pieces: {goldCount}</p>
                    <p>Start Position: {startPosition ? `(${startPosition.x}, ${startPosition.y})` : "Not set"}</p>
                    <p>Exit Position: {exitPosition ? `(${exitPosition.x}, ${exitPosition.y})` : "Not set"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSaveMap}>
                Save Map
              </Button>
            </CardFooter>
            {message && <div className="px-6 pb-4 text-center text-sm">{message}</div>}
          </Card>
        </div>
      </div>
    </div>
  )
}

