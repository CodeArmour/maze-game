"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMaps } from "@/lib/maps"
import { getScoresByMap } from "@/lib/scores"
import type { MapData, ScoreData } from "@/types/game-types"
import Link from "next/link"

export default function AchievementsPage() {
  const [maps, setMaps] = useState<MapData[]>([])
  const [selectedMapId, setSelectedMapId] = useState<string>("")
  const [scores, setScores] = useState<ScoreData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMaps = async () => {
      const availableMaps = await getMaps()
      setMaps(availableMaps)

      if (availableMaps.length > 0) {
        setSelectedMapId(availableMaps[0].id)
      }

      setLoading(false)
    }

    loadMaps()
  }, [])

  useEffect(() => {
    const loadScores = async () => {
      if (selectedMapId) {
        const mapScores = await getScoresByMap(selectedMapId)
        setScores(mapScores)
      }
    }

    loadScores()
  }, [selectedMapId])

  if (loading) {
    return <div className="text-center p-8">Loading achievements...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <Link href="/">
          <Button variant="outline">Back to Game</Button>
        </Link>
      </div>

      <Tabs defaultValue={maps[0]?.id} onValueChange={setSelectedMapId}>
        <TabsList className="mb-4">
          {maps.map((map) => (
            <TabsTrigger key={map.id} value={map.id}>
              {map.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {maps.map((map) => (
          <TabsContent key={map.id} value={map.id}>
            <Card>
              <CardHeader>
                <CardTitle>{map.name}</CardTitle>
                <CardDescription>
                  Difficulty: {map.difficulty} | Time Limit: {map.timeLimit}s | Gold: {map.goldCount}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scores.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No scores recorded for this map yet. Be the first to complete it!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Player</th>
                          <th className="text-left py-2">Character</th>
                          <th className="text-left py-2">Gold</th>
                          <th className="text-left py-2">Time</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map((score) => (
                          <tr key={score.id} className="border-b">
                            <td className="py-2">{score.playerName}</td>
                            <td className="py-2">
                              {score.character === "explorer"
                                ? "🧭 Explorer"
                                : score.character === "ninja"
                                  ? "🥷 Ninja"
                                  : "🤖 Robot"}
                            </td>
                            <td className="py-2">
                              {score.score}/{map.goldCount}
                            </td>
                            <td className={`py-2 ${score.completedInTime ? "text-green-500" : "text-red-500"}`}>
                              {score.timeCompleted}s
                            </td>
                            <td className="py-2 text-sm text-muted-foreground">
                              {new Date(score.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

