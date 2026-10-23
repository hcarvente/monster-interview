import MonsterAvatar from "./MonsterAvatar";
import styles from "./CharacterCard.module.css";

// One clickable card for one interviewer.
// This is a button (not a div) so keyboards and screen readers treat it correctly.
//   character - one entry from lib/characters.js
//   selected  - true if this card is the highlighted one
//   onSelect  - called with this character's id when clicked
export default function CharacterCard({ character, selected, onSelect }) {
  // Pull the fields we need out of the character object.
  const { name, title, description, emoji, available } = character;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => onSelect(character.id)}
      // "Coming soon" monsters are disabled so they can't be clicked or tabbed to.
      disabled={!available}
      // aria-pressed tells screen readers whether the card is toggled on.
      // Left undefined for disabled cards because they can't be selected.
      aria-pressed={available ? selected : undefined}
    >
      <MonsterAvatar emoji={emoji} />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {/* Only unavailable characters get the "Coming soon" badge. */}
      {!available && <span className={styles.badge}>Coming soon</span>}
    </button>
  );
}
