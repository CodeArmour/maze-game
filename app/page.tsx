import { ThemeProvider } from "@/components/theme-provider"
import GameContainer from "@/components/game-container"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="maze-game-theme">
      <main className="min-h-screen bg-background text-foreground p-4">
        <GameContainer />
      </main>
    </ThemeProvider>
  )
}

