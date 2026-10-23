import styles from "./MonsterAvatar.module.css";

// A character's picture: an emoji on a glowing circle, so the MVP needs no image files.
//   emoji - the character to show (e.g. "🧛")
//   size  - "md" (default) or "lg"; the CSS file defines the dimensions
// aria-hidden hides it from screen readers because it is decoration; the
// character's name is always written as text next to it.
export default function MonsterAvatar({ emoji, size = "md" }) {
  return (
    <div className={`${styles.orb} ${styles[size]}`} aria-hidden="true">
      <span className={styles.emoji}>{emoji}</span>
    </div>
  );
}
