// "use client" marks this file as a Client Component: it runs in the browser.
// We need that because it uses useState (memory that changes as the user clicks).
"use client";

import { useRef, useState } from "react";
import Landing from "@/components/Landing";
import SetupScreen from "@/components/SetupScreen";
import InterviewScreen from "@/components/InterviewScreen";
import ErrorBanner from "@/components/ErrorBanner";
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
  // The feedback object returned by the server (null until we get one).
  const [feedback, setFeedback] = useState(null);
  // The friendly message shown on the error screen.
  const [errorMessage, setErrorMessage] = useState("");
  // Duplicate-submit lock. A ref (not state) because it changes instantly:
  // state updates are applied later, so a fast second click could slip through.
  const isSubmitting = useRef(false);

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

  // Sends the finished interview to OUR server (never directly to an AI provider).
  // Runs only when the user clicks "Reveal My Fate" or "Try again": not on typing,
  // navigating or refreshing. Only ids and answers are sent; the server looks up
  // the question text itself.
  async function submitInterview() {
    // If a request is already running, ignore this click.
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setScreen("loading");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, categoryId, answers }),
      });

      // The server replies with JSON for both success and errors. If the body is
      // not JSON for some reason, fall back to null instead of crashing.
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Show the server's friendly message when there is one.
        throw new Error(
          data?.error?.message ?? "Something went wrong. Please try again."
        );
      }

      setFeedback(data.feedback);
      setScreen("results");
    } catch (error) {
      // fetch itself throws a TypeError when the network is down. Show a friendly
      // message instead of the raw technical one. `answers` is untouched, so the
      // user can retry without retyping anything.
      setErrorMessage(
        error instanceof TypeError
          ? "Could not reach the server. Check your connection and try again."
          : error.message
      );
      setScreen("error");
    } finally {
      // Always unlock, success or failure, so a deliberate retry is possible.
      isSubmitting.current = false;
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
        onFinish={submitInterview}
      />
    );
  }

  // Waiting for the server. role="status" lets screen readers announce it politely.
  if (screen === "loading") {
    return (
      <main style={{ padding: 32 }} role="status">
        <p>The monsters are judging your answers...</p>
      </main>
    );
  }

  if (screen === "error") {
    return (
      <ErrorBanner
        message={errorMessage}
        onRetry={submitInterview}
        onBack={() => {
          setQuestionIndex(QUESTIONS_PER_INTERVIEW - 1);
          setScreen("interview");
        }}
      />
    );
  }

  // Placeholder results until the real ResultsScreen exists (Step 9).
  return (
    <main style={{ padding: 32 }}>
      <p>{feedback?.title}</p>
      <p>{feedback?.overall}</p>
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
