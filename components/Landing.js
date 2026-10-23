"use client";

import { useState } from "react";
import { CHARACTERS } from "@/lib/characters";
import CharacterCard from "./CharacterCard";
import styles from "./Landing.module.css";

export default function Landing({ onEnter }) {
  const [characterId, setCharacterId] = useState("dracula");

  return (
    <main className={styles.landing}>
      <h1 className={styles.brand}>Monster Interview</h1>
      <p className={styles.tagline}>
        The scariest job interview you&apos;ll ever love.
      </p>

      <h2 className={styles.heading}>Choose your interviewer</h2>
      <div className={styles.grid}>
        {CHARACTERS.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={character.id === characterId}
            onSelect={setCharacterId}
          />
        ))}
      </div>

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
