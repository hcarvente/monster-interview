// Client Component: it handles button clicks.
"use client";

import { CATEGORIES, QUESTIONS_PER_INTERVIEW } from "@/lib/questions";
import MonsterAvatar from "./MonsterAvatar";
import styles from "./SetupScreen.module.css";

// The screen between choosing a monster and starting the questions.
// It stores nothing itself: the chosen category lives in page.js and arrives as a
// prop, and clicks are reported back up through the callback props.
//   character         - the chosen interviewer (name + emoji)
//   categoryId        - the selected category id, or null if none yet
//   onSelectCategory  - called with a category id when a card is clicked
//   onStart           - called when Start Interview is clicked
//   onBack            - called when Back is clicked
export default function SetupScreen({
  character,
  categoryId,
  onSelectCategory,
  onStart,
  onBack,
}) {
  return (
    <main className={styles.setup}>
      {/* Interviewer identity at the top. */}
      <MonsterAvatar emoji={character.emoji} size="lg" />
      <h1 className={styles.name}>{character.name}</h1>
      {/* Explains the challenge. The number comes from the shared constant. */}
      <p className={styles.intro}>
        Face {QUESTIONS_PER_INTERVIEW} questions, one at a time. When you finish,
        reveal your fate and get playful, constructive feedback. It is practice,
        not a real hiring decision.
      </p>

      <h2 className={styles.heading}>Choose an interview category</h2>
      {/* The three categories behave like radio buttons: only one can be chosen.
          role="radiogroup" / "radio" and aria-checked tell screen readers that. */}
      <div className={styles.options} role="radiogroup" aria-label="Interview category">
        {/* Loop over the data in lib/questions.js, one button per category. */}
        {CATEGORIES.map((category) => {
          // True only for the card whose id matches the current choice.
          const selected = category.id === categoryId;
          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={selected}
              // Add the orange "selected" style only when this card is chosen.
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
        {/* disabled until a category is picked: !null is true, !"internship" is false. */}
        <button
          type="button"
          className={styles.start}
          onClick={onStart}
          disabled={!categoryId}
        >
          Start Interview
        </button>
      </div>
      {/* Hint text shown only while no category has been picked. */}
      {!categoryId && (
        <p className={styles.hint}>Pick a category to begin.</p>
      )}
    </main>
  );
}
