// Client Component: it has its own state (the error message) and handles clicks/typing.
"use client";

import { useState } from "react";
import { MAX_ANSWER_CHARS } from "@/lib/questions";
import MonsterAvatar from "./MonsterAvatar";
import ProgressBar from "./ProgressBar";
import styles from "./InterviewScreen.module.css";

// The screen where the user answers one question at a time.
// It owns NO answer data: everything comes in as props from page.js and changes
// go back out through the on... callback props. (This is a "controlled component".)
//   character      - the interviewer (name + emoji)
//   questions      - the 3 question strings for the chosen category
//   answers        - all 3 typed answers
//   questionIndex  - which question we're on (0, 1 or 2)
export default function InterviewScreen({
  character,
  questions,
  answers,
  questionIndex,
  onChangeAnswer,
  onNext,
  onBack,
  onFinish,
}) {
  // The red validation message. "" means no error is showing.
  const [error, setError] = useState("");

  // True on the final question, where "Next" becomes "Reveal My Fate".
  const isLast = questionIndex === questions.length - 1;
  // The text typed so far for the current question.
  const answer = answers[questionIndex];

  // Runs on every keystroke: pass the new text up to page.js.
  // Also hides the error as soon as the user starts fixing the problem.
  function handleChange(event) {
    onChangeAnswer(questionIndex, event.target.value);
    if (error) setError("");
  }

  // Runs when the user clicks Next / Reveal My Fate.
  // Light check for UX only. The server re-validates in a later step, because
  // anything in the browser can be bypassed and must not be trusted.
  function handleForward() {
    // trim() removes spaces, so an answer of only spaces counts as empty.
    if (answer.trim() === "") {
      setError("Even monsters need an answer. Type something before moving on.");
      return; // stop here: do not move to the next question
    }
    setError("");
    if (isLast) {
      onFinish();
    } else {
      onNext();
    }
  }

  // Clear any old error, then let page.js decide where "back" goes.
  function handleBack() {
    setError("");
    onBack();
  }

  return (
    <main className={styles.interview}>
      {/* Top row: interviewer avatar on the left, name + progress on the right. */}
      <div className={styles.header}>
        <MonsterAvatar emoji={character.emoji} />
        <div className={styles.progress}>
          <p className={styles.speaker}>{character.name} asks:</p>
          {/* questionIndex starts at 0, so add 1 to show "Question 1 of 3". */}
          <ProgressBar current={questionIndex + 1} total={questions.length} />
        </div>
      </div>

      {/* The question text. The id lets the textarea below use it as its label. */}
      <h1 id="question" className={styles.question}>
        {questions[questionIndex]}
      </h1>

      {/* Controlled textarea: what it shows always comes from `answer`.
          maxLength stops typing at 800 characters (the shared limit).
          The aria-* attributes tell screen readers what the box is for and
          whether it currently has an error. */}
      <textarea
        className={styles.textarea}
        value={answer}
        onChange={handleChange}
        maxLength={MAX_ANSWER_CHARS}
        rows={7}
        placeholder="Type your answer here..."
        aria-labelledby="question"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "answer-error" : undefined}
      />
      {/* Live character counter, e.g. "120 / 800". */}
      <p className={styles.count}>
        {answer.length} / {MAX_ANSWER_CHARS}
      </p>

      {/* Only rendered when there is an error. role="alert" makes screen
          readers announce it immediately. */}
      {error && (
        <p id="answer-error" role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {/* Navigation buttons. The right-hand label changes on the last question. */}
      <div className={styles.actions}>
        <button type="button" className={styles.back} onClick={handleBack}>
          Back
        </button>
        <button type="button" className={styles.next} onClick={handleForward}>
          {isLast ? "Reveal My Fate" : "Next Question"}
        </button>
      </div>
    </main>
  );
}
