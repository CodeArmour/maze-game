"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlayerData } from "@/components/game-container"
import { getMapById } from "@/lib/maps"
import { useEffect, useState } from "react"
import type { MapData } from "@/types/game-types"

interface ResultScreenProps {
  playerData: PlayerData
  onPlayAgain: () => void
  onMainMenu: () => void
}

export default function ResultScreen({ playerData, onPlayAgain, onMainMenu }: ResultScreenProps) {
  const [map, setMap] = useState<MapData | null>(null)

  useEffect(() => {
    const loadMapData = async () => {
      const mapData = await getMapById(playerData.mapId)
      setMap(mapData)
    }

    loadMapData()
  }, [playerData.mapId])

  if (!map) {
    return <div className="text-center">Loading results...</div>
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{playerData.completedInTime ? "Maze Completed!" : "Time's Up!"}</CardTitle>
        <CardDescription className="text-center">
          {playerData.completedInTime
            ? "Congratulations! You've completed the maze."
            : "You ran out of time. Better luck next time!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Your Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Player:</div>
              <div>{playerData.name}</div>

              <div>Map:</div>
              <div>{map.name}</div>

              <div>Gold Collected:</div>
              <div>
                {playerData.score}/{map.goldCount}
              </div>

              <div>Time:</div>
              <div className={playerData.completedInTime ? "text-green-500" : "text-red-500"}>
                {playerData.timeCompleted}s / {map.timeLimit}s
              </div>

              {map.difficulty === "hard" && (
                <>
                  <div>Hammer Uses:</div>
                  <div>{playerData.hammerUses !== undefined ? 3 - playerData.hammerUses : 3} used</div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onMainMenu}>
          Main Menu
        </Button>
        <Button onClick={onPlayAgain}>Play Again</Button>
      </CardFooter>
    </Card>
  )
}

