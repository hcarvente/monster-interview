// Client Component: it keeps state (the highlighted character) and handles clicks.
"use client";

import { useState } from "react";
import { CHARACTERS } from "@/lib/characters";
import CharacterCard from "./CharacterCard";
import styles from "./Landing.module.css";

// The first screen: branding, tagline, character cards, and the Enter button.
// `onEnter` is a callback from page.js; we call it with the chosen character's id.
export default function Landing({ onEnter }) {
  // Which card is highlighted. Starts on Dracula, the only playable monster.
  // This lives here (not in page.js) because nothing else needs it until Enter is clicked.
  const [characterId, setCharacterId] = useState("dracula");

  return (
    <main className={styles.landing}>
      {/* Branding and tagline. */}
      <h1 className={styles.brand}>Monster Interview</h1>
      <p className={styles.tagline}>
        The scariest job interview you&apos;ll ever love.
      </p>

      <h2 className={styles.heading}>Choose your interviewer</h2>
      <div className={styles.grid}>
        {/* One card per character from lib/characters.js.
            `key` helps React track each item in the list. */}
        {CHARACTERS.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={character.id === characterId}
            onSelect={setCharacterId}
          />
        ))}
      </div>

      {/* Hands the chosen character up to page.js, which moves to the setup screen. */}
      <button
        type="button"
        className={styles.enter}
        onClick={() => onEnter(characterId)}
      >
        Enter the Interview
      </button>
    </main>
  );
}
