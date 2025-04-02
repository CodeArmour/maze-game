"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getAllScores } from "@/lib/scores"
import { getMaps } from "@/lib/maps"
import type { ScoreData, MapData } from "@/types/game-types"
import { ArrowUpDown, Clock } from "lucide-react"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [scores, setScores] = useState<ScoreData[]>([])
  const [maps, setMaps] = useState<MapData[]>([])
  const [filteredScores, setFilteredScores] = useState<ScoreData[]>([])
  const [selectedMap, setSelectedMap] = useState<string>("all")
  const [sortByTime, setSortByTime] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      const allScores = await getAllScores()
      const allMaps = await getMaps()

      setScores(allScores)
      setFilteredScores(allScores)
      setMaps(allMaps)
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = [...scores]

    // Filter by map
    if (selectedMap !== "all") {
      filtered = filtered.filter((score) => score.mapId === selectedMap)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((score) => score.playerName.toLowerCase().includes(query))
    }

    // Sort by time or date
    if (sortByTime) {
      filtered.sort((a, b) => {
        if (a.completedInTime !== b.completedInTime) {
          return a.completedInTime ? -1 : 1
        }
        return a.timeCompleted - b.timeCompleted
      })
    } else {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    setFilteredScores(filtered)
  }, [scores, selectedMap, sortByTime, searchQuery])

  const getMapName = (mapId: string): string => {
    const map = maps.find((m) => m.id === mapId)
    return map ? map.name : "Unknown Map"
  }

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Maze Runner</CardTitle>
          <CardDescription className="text-center">
            Navigate through mazes, collect gold, and beat the clock!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <img src="/maze.png?height=200&width=200" alt="Maze Game Logo" className="h-40 w-40 object-contain" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={onStart}>
            Start Game
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Players Leaderboard</CardTitle>
          <CardDescription>View past game results and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by player name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedMap} onValueChange={setSelectedMap}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Maps</SelectItem>
                  {maps.map((map) => (
                    <SelectItem key={map.id} value={map.id}>
                      {map.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortByTime(!sortByTime)}
                title={sortByTime ? "Sort by date" : "Sort by time"}
              >
                {sortByTime ? <Clock className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left font-medium">Player</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Map</th>
                    <th className="px-4 py-3 text-left font-medium">Gold</th>
                    <th className="px-4 py-3 text-left font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">
                        No results found
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((score) => (
                      <tr key={score.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{score.playerName}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {new Date(score.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">{new Date(score.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{getMapName(score.mapId)}</td>
                        <td className="px-4 py-3">{score.score}</td>
                        <td className="px-4 py-3">
                          <span className={score.completedInTime ? "text-green-500" : "text-red-500"}>
                            {score.timeCompleted}s
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

