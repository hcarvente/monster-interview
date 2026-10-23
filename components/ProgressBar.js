import styles from "./ProgressBar.module.css";

// Shows "Question 1 of 3" plus a filled bar.
// Display-only: it has no state, it just draws whatever numbers it is given.
// `current` is 1-based so the label reads naturally.
export default function ProgressBar({ current, total }) {
  // How full the bar is, e.g. question 2 of 3 -> 66.7%.
  const percent = (current / total) * 100;

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>
        Question {current} of {total}
      </p>
      {/* role="progressbar" + aria-value* let screen readers announce the progress.
          The inner div's inline width is the visible fill. */}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Interview progress"
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
