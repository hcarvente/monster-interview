import MonsterAvatar from "./MonsterAvatar";
import styles from "./CharacterCard.module.css";

export default function CharacterCard({ character, selected, onSelect }) {
  const { name, title, description, emoji, available } = character;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => onSelect(character.id)}
      disabled={!available}
      aria-pressed={available ? selected : undefined}
    >
      <MonsterAvatar emoji={emoji} />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {!available && <span className={styles.badge}>Coming soon</span>}
    </button>
  );
}
