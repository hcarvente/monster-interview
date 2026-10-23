// Client Component: it uses useEffect/useRef to move keyboard focus to the title.
"use client";

import { useEffect, useRef } from "react";
import MonsterAvatar from "./MonsterAvatar";
import styles from "./ResultsScreen.module.css";

// The "Reveal My Fate" screen. It only DISPLAYS data; it never calls the AI.
// By the time it renders, the server has already validated `feedback`
// (lib/validateFeedback.js), so every field below is known to exist.
//   character     - the interviewer (name + emoji)
//   feedback      - { title, overall, strengths[], improvements[], improvedAnswer }
//   improvedQuestion - the text of the question the improved answer belongs to
//   onRestart     - called when the user clicks "Play again"
//   onReview      - called when the user wants to go back to their answers
export default function ResultsScreen({
  character,
  feedback,
  improvedQuestion,
  onRestart,
  onReview,
}) {
  const { title, overall, strengths, improvements, improvedAnswer } = feedback;

  // Move focus to the title when the screen appears, so keyboard and screen
  // reader users land on the new content. tabIndex={-1} lets a heading take focus
  // without becoming a normal tab stop.
  const titleRef = useRef(null);
  useEffect(() => {
    titleRef.current?.focus();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={styles.results}>
      {/* The `--i` value is each block's position; the CSS uses it to stagger the
          entrance animation (block 0 first, then 1, 2, ...). */}
      <header className={styles.hero} style={{ "--i": 0 }}>
        <MonsterAvatar emoji={character.emoji} size="lg" />
        <p className={styles.verdictLabel}>{character.name} has spoken</p>
        <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
          {title}
        </h1>
      </header>

      {/* The overall assessment, highlighted as the main message. */}
      <section className={styles.overall} style={{ "--i": 1 }} aria-label="Overall assessment">
        <p>{overall}</p>
      </section>

      {/* Two columns on wide screens, stacked on phones. */}
      <div className={styles.columns}>
        <section className={`${styles.card} ${styles.strengths}`} style={{ "--i": 2 }}>
          <h2 className={styles.cardHeading}>What worked</h2>
          <ul className={styles.list}>
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={`${styles.card} ${styles.improvements}`} style={{ "--i": 3 }}>
          <h2 className={styles.cardHeading}>Sharpen your fangs</h2>
          <ul className={styles.list}>
            {improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* A rewritten version of one of the user's answers, shown like a quote. */}
      <section className={`${styles.card} ${styles.improved}`} style={{ "--i": 4 }}>
        <h2 className={styles.cardHeading}>
          A stronger take on question {improvedAnswer.questionNumber}
        </h2>
        <p className={styles.improvedQuestion}>{improvedQuestion}</p>
        <blockquote className={styles.quote}>{improvedAnswer.text}</blockquote>
      </section>

      {/* Honest framing: this is practice, not a real decision. */}
      <p className={styles.disclaimer} style={{ "--i": 5 }}>
        This is playful practice feedback from an AI, not a real hiring decision.
        Use it as a starting point, and edit any suggested wording so it stays true to you.
      </p>

      <div className={styles.actions} style={{ "--i": 6 }}>
        <button type="button" className={styles.secondary} onClick={onReview}>
          Back to my answers
        </button>
        <button type="button" className={styles.primary} onClick={onRestart}>
          Play again
        </button>
      </div>
    </main>
  );
}
