import styles from "./ErrorBanner.module.css";

// A friendly error panel with a manual retry button.
//   message  - the user-friendly text to show (never a raw technical error)
//   onRetry  - called when the user clicks "Try again" (retries are deliberate,
//              never automatic, so a failing API can't be hammered)
//   onBack   - called when the user wants to review their answers first
export default function ErrorBanner({ message, onRetry, onBack }) {
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
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      </div>
    </main>
  );
}
