"use client";

import { CATEGORIES, QUESTIONS_PER_INTERVIEW } from "@/lib/questions";
import MonsterAvatar from "./MonsterAvatar";
import styles from "./SetupScreen.module.css";

export default function SetupScreen({
  character,
  categoryId,
  onSelectCategory,
  onStart,
  onBack,
}) {
  return (
    <main className={styles.setup}>
      <MonsterAvatar emoji={character.emoji} size="lg" />
      <h1 className={styles.name}>{character.name}</h1>
      <p className={styles.intro}>
        Face {QUESTIONS_PER_INTERVIEW} questions, one at a time. When you finish,
        reveal your fate and get playful, constructive feedback. It is practice,
        not a real hiring decision.
      </p>

      <h2 className={styles.heading}>Choose an interview category</h2>
      <div className={styles.options} role="radiogroup" aria-label="Interview category">
        {CATEGORIES.map((category) => {
          const selected = category.id === categoryId;
          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${styles.option} ${selected ? styles.selected : ""}`}
              onClick={() => onSelectCategory(category.id)}
            >
              <span className={styles.label}>{category.label}</span>
              <span className={styles.description}>{category.description}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.back} onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className={styles.start}
          onClick={onStart}
          disabled={!categoryId}
        >
          Start Interview
        </button>
      </div>
      {!categoryId && (
        <p className={styles.hint}>Pick a category to begin.</p>
      )}
    </main>
  );
}
