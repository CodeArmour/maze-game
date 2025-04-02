"use client"

import { useState } from "react"
import StartScreen from "@/components/start-screen"
import NameInput from "@/components/name-input"
import CharacterSelect from "@/components/character-select"
import MapSelect from "@/components/map-select"
import GamePlay from "@/components/game-play"
import ResultScreen from "@/components/result-screen"
import { ThemeToggle } from "@/components/theme-toggle"

export type GameState = "start" | "name" | "character" | "map" | "play" | "result"
export type CharacterTheme = "explorer" | "ninja" | "robot"

export interface PlayerData {
  name: string
  character: CharacterTheme
  mapId: string
  score: number
  timeCompleted: number
  completedInTime: boolean
  hammerUses?: number
}

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "",
    character: "explorer",
    mapId: "",
    score: 0,
    timeCompleted: 0,
    completedInTime: false,
    hammerUses: 0,
  })

  const updatePlayerData = (data: Partial<PlayerData>) => {
    setPlayerData((prev) => ({ ...prev, ...data }))
  }

  const handleBack = (currentState: GameState) => {
    switch (currentState) {
      case "name":
        setGameState("start")
        break
      case "character":
        setGameState("name")
        break
      case "map":
        setGameState("character")
        break
      case "play":
        if (confirm("Are you sure you want to leave the game? Your progress will be lost.")) {
          setGameState("map")
        }
        break
      default:
        setGameState("start")
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maze Runner</h1>
        <ThemeToggle />
      </div>

      {gameState === "start" && <StartScreen onStart={() => setGameState("name")} />}

      {gameState === "name" && (
        <NameInput
          onSubmit={(name) => {
            if (name === "") {
              handleBack("name")
            } else {
              updatePlayerData({ name })
              setGameState("character")
            }
          }}
        />
      )}

      {gameState === "character" && (
        <CharacterSelect
          onSelect={(character) => {
            if (character === "") {
              handleBack("character")
            } else {
              updatePlayerData({ character })
              setGameState("map")
            }
          }}
        />
      )}

      {gameState === "map" && (
        <MapSelect
          onSelect={(mapId, difficulty) => {
            if (mapId === "") {
              handleBack("map")
            } else {
              // Set hammer uses based on difficulty
              const hammerUses = difficulty === "hard" ? 3 : 0
              updatePlayerData({ mapId, hammerUses })
              setGameState("play")
            }
          }}
        />
      )}

      {gameState === "play" && (
        <GamePlay
          playerData={playerData}
          onComplete={(result) => {
            updatePlayerData(result)
            setGameState("result")
          }}
          onLeave={() => handleBack("play")}
          onUpdateHammerUses={(uses) => updatePlayerData({ hammerUses: uses })}
        />
      )}

      {gameState === "result" && (
        <ResultScreen
          playerData={playerData}
          onPlayAgain={() => setGameState("map")}
          onMainMenu={() => setGameState("start")}
        />
      )}
    </div>
  )
}

