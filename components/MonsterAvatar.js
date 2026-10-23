import styles from "./MonsterAvatar.module.css";

// Emoji on a glowing orb: no image files needed for the MVP.
export default function MonsterAvatar({ emoji, size = "md" }) {
  return (
    <div className={`${styles.orb} ${styles[size]}`} aria-hidden="true">
      <span className={styles.emoji}>{emoji}</span>
    </div>
  );
}
