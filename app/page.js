"use client";

import { useState } from "react";
import Landing from "@/components/Landing";
import SetupScreen from "@/components/SetupScreen";
import { getCharacter } from "@/lib/characters";

// One page, one "screen" state: later steps add interview and results.
export default function Home() {
  const [screen, setScreen] = useState("landing");
  const [characterId, setCharacterId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  function handleEnter(id) {
    setCharacterId(id);
    setScreen("setup");
  }

  if (screen === "landing") {
    return <Landing onEnter={handleEnter} />;
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        character={getCharacter(characterId)}
        categoryId={categoryId}
        onSelectCategory={setCategoryId}
        onStart={() => setScreen("interview")}
        onBack={() => setScreen("landing")}
      />
    );
  }

  // Placeholder until Step 4b builds the interview screen.
  return (
    <main style={{ padding: 32 }}>
      <p>Interview screen coming in Step 4b (category: {categoryId}).</p>
      <button onClick={() => setScreen("setup")}>Back</button>
    </main>
  );
}
