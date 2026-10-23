"use client";

import { useState } from "react";
import Landing from "@/components/Landing";

// One page, one "screen" state: later steps add setup, interview, results.
export default function Home() {
  const [screen, setScreen] = useState("landing");
  const [characterId, setCharacterId] = useState(null);

  function handleEnter(id) {
    setCharacterId(id);
    setScreen("setup");
  }

  if (screen === "landing") {
    return <Landing onEnter={handleEnter} />;
  }

  // Placeholder until Step 4 builds the setup screen.
  return (
    <main style={{ padding: 32 }}>
      <p>Setup screen coming in Step 4 (character: {characterId}).</p>
      <button onClick={() => setScreen("landing")}>Back</button>
    </main>
  );
}
