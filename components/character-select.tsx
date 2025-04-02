"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { CharacterTheme } from "@/components/game-container"
import { useMobile } from "@/hooks/use-mobile"

interface CharacterSelectProps {
  onSelect: (character: CharacterTheme) => void
}

export default function CharacterSelect({ onSelect }: CharacterSelectProps) {
  const isMobile = useMobile()

  const characters: { id: CharacterTheme; name: string; description: string }[] = [
    {
      id: "explorer",
      name: "Explorer",
      description: "A brave adventurer seeking treasures",
    },
    {
      id: "ninja",
      name: "Ninja",
      description: "Fast and stealthy maze runner",
    },
    {
      id: "robot",
      name: "Robot",
      description: "Mechanical maze navigator with precision",
    },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Choose Your Character</CardTitle>
        <CardDescription>Select a character to navigate the maze</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-3 gap-4"}`}>
          {characters.map((character) => (
            <div
              key={character.id}
              className={`flex ${isMobile ? "flex-row items-center" : "flex-col items-center"} p-2 border rounded-md cursor-pointer hover:bg-accent`}
              onClick={() => onSelect(character.id)}
            >
              <div
                className={`${isMobile ? "w-12 h-12 mr-3" : "w-16 h-16"} bg-muted rounded-full flex items-center justify-center mb-2`}
              >
                {character.id === "explorer" && "🧭"}
                {character.id === "ninja" && "🥷"}
                {character.id === "robot" && "🤖"}
              </div>
              <div>
                <h3 className="font-medium text-sm">{character.name}</h3>
                {isMobile && <p className="text-xs text-muted-foreground">{character.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={() => onSelect("" as any)}>
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}

