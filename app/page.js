// "use client" marks this file as a Client Component: it runs in the browser.
// We need that because it uses useState (memory that changes as the user clicks).
"use client";

import { useState } from "react";
import Landing from "@/components/Landing";
import SetupScreen from "@/components/SetupScreen";
import InterviewScreen from "@/components/InterviewScreen";
import { getCharacter } from "@/lib/characters";
import { getCategory, QUESTIONS_PER_INTERVIEW } from "@/lib/questions";

// Builds a fresh array of 3 empty strings: ["", "", ""].
// It is a function (not a constant) so each call returns a brand-new array.
const emptyAnswers = () => Array(QUESTIONS_PER_INTERVIEW).fill("");

// This is the whole app's "traffic controller". There is only one page, and the
// `screen` state decides which component is shown: landing -> setup -> interview -> results.
// All the data the user enters lives HERE, so it survives moving between screens.
export default function Home() {
  // Which screen is showing right now.
  const [screen, setScreen] = useState("landing");
  // Which interviewer was chosen (e.g. "dracula"). null until the user picks one.
  const [characterId, setCharacterId] = useState(null);
  // Which interview category was chosen (e.g. "internship"). null until picked.
  const [categoryId, setCategoryId] = useState(null);
  // The user's typed answers, one string per question. Index 0 = question 1.
  const [answers, setAnswers] = useState(emptyAnswers);
  // Which question we're on (0, 1 or 2). The screen shows this number + 1.
  const [questionIndex, setQuestionIndex] = useState(0);

  // Called by the landing screen when the user clicks "Enter the Interview".
  function handleEnter(id) {
    setCharacterId(id);
    setScreen("setup");
  }

  // Called when a category card is clicked on the setup screen.
  // Changing category means different questions, so old answers no longer fit
  // and we clear them. Re-clicking the same category keeps the answers.
  function handleSelectCategory(id) {
    if (id !== categoryId) {
      setAnswers(emptyAnswers());
    }
    setCategoryId(id);
  }

  // Called on every keystroke in the textarea.
  // React state must not be edited in place, so we build a NEW array: copy every
  // answer, but swap in the new text at the position that changed.
  function handleChangeAnswer(index, text) {
    setAnswers((current) =>
      current.map((value, i) => (i === index ? text : value))
    );
  }

  // Back button on the interview screen: step back one question,
  // or leave to the setup screen if we're already on question 1.
  // Answers are NOT cleared, which is how Back "preserves" what you typed.
  function handleInterviewBack() {
    if (questionIndex === 0) {
      setScreen("setup");
    } else {
      setQuestionIndex(questionIndex - 1);
    }
  }

  // Each `if` below shows one screen and stops, so only one screen renders at a time.
  if (screen === "landing") {
    return <Landing onEnter={handleEnter} />;
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        character={getCharacter(characterId)}
        categoryId={categoryId}
        onSelectCategory={handleSelectCategory}
        onStart={() => {
          // Always begin at question 1 when the interview starts.
          setQuestionIndex(0);
          setScreen("interview");
        }}
        onBack={() => setScreen("landing")}
      />
    );
  }

  if (screen === "interview") {
    return (
      <InterviewScreen
        character={getCharacter(characterId)}
        // Look up the fixed question text for the chosen category.
        questions={getCategory(categoryId).questions}
        answers={answers}
        questionIndex={questionIndex}
        onChangeAnswer={handleChangeAnswer}
        onNext={() => setQuestionIndex(questionIndex + 1)}
        onBack={handleInterviewBack}
        onFinish={() => setScreen("results")}
      />
    );
  }

  // Placeholder until the API route and results screen exist (Steps 5-9).
  // No AI call is made here.
  return (
    <main style={{ padding: 32 }}>
      <p>Results coming later. Your answers are saved in state.</p>
      <button
        onClick={() => {
          // Jump back to the last question so the user can review their answers.
          setQuestionIndex(QUESTIONS_PER_INTERVIEW - 1);
          setScreen("interview");
        }}
      >
        Back to my answers
      </button>
    </main>
  );
}
