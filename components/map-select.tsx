"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaps } from "@/lib/maps"
import type { MapData } from "@/types/game-types"
import { useMobile } from "@/hooks/use-mobile"

interface MapSelectProps {
  onSelect: (mapId: string, difficulty: string) => void
}

export default function MapSelect({ onSelect }: MapSelectProps) {
  const [maps, setMaps] = useState<MapData[]>([])
  const [selectedMap, setSelectedMap] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("easy")
  const isMobile = useMobile()

  useEffect(() => {
    const loadMaps = async () => {
      const availableMaps = await getMaps()
      setMaps(availableMaps)
      if (availableMaps.length > 0) {
        setSelectedMap(availableMaps[0].id)
        setSelectedDifficulty(availableMaps[0].difficulty)
      }
    }

    loadMaps()
  }, [])

  const handleSelect = () => {
    if (selectedMap) {
      const map = maps.find((m) => m.id === selectedMap)
      onSelect(selectedMap, map?.difficulty || "easy")
    }
  }

  const handleMapSelect = (mapId: string) => {
    setSelectedMap(mapId)
    const map = maps.find((m) => m.id === mapId)
    if (map) {
      setSelectedDifficulty(map.difficulty)
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Select a Map</CardTitle>
        <CardDescription>Choose a maze to conquer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
          {maps.map((map) => (
            <div
              key={map.id}
              className={`p-4 border rounded-md cursor-pointer ${
                selectedMap === map.id ? "border-primary bg-accent" : "hover:bg-accent/50"
              }`}
              onClick={() => handleMapSelect(map.id)}
            >
              <h3 className="font-medium">{map.name}</h3>
              <p className="text-sm text-muted-foreground">Time Limit: {map.timeLimit}s</p>
              <p className="text-sm text-muted-foreground">Gold: {map.goldCount}</p>
              <p className="text-sm text-muted-foreground">
                Difficulty: {map.difficulty}
                {map.difficulty === "hard" && <span className="ml-2 text-amber-500">🔨 Hammer Available</span>}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onSelect("", "")}>
          Back
        </Button>
        <Button onClick={handleSelect} disabled={!selectedMap}>
          Start Game
        </Button>
      </CardFooter>
    </Card>
  )
}

