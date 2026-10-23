// Client Component: it runs a countdown timer, which needs state and an effect.
"use client";

import { useEffect, useState } from "react";
import styles from "./ErrorBanner.module.css";

// A friendly error panel with a manual retry button.
//   message          - the user-friendly text to show (never a raw technical error)
//   cooldownSeconds  - after a rate limit (HTTP 429) the server says how long to wait;
//                      "Try again" stays disabled until the countdown ends. 0 = no wait.
//   onRetry          - called when the user clicks "Try again" (retries are deliberate,
//                      never automatic, so a failing API can't be hammered)
//   onBack           - called when the user wants to review their answers first
export default function ErrorBanner({ message, cooldownSeconds = 0, onRetry, onBack }) {
  // Seconds left before retrying is allowed. Starts at the server's suggestion.
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);

  // Tick down once per second. The cleanup function stops the timer when the
  // countdown reaches 0 or when this panel disappears, so no timer is left running.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const waiting = secondsLeft > 0;

  return (
    <main className={styles.wrapper}>
      {/* role="alert" makes screen readers announce the problem right away. */}
      <div className={styles.banner} role="alert">
        <h1 className={styles.heading}>The monsters hit a snag</h1>
        <p className={styles.message}>{message}</p>
        <p className={styles.reassure}>Your answers are safe.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.back} onClick={onBack}>
          Back to my answers
        </button>
        {/* `disabled` while the cooldown runs; the label shows the time left. */}
        <button type="button" className={styles.retry} onClick={onRetry} disabled={waiting}>
          {waiting ? `Try again in ${secondsLeft}s` : "Try again"}
        </button>
      </div>
    </main>
  );
}
