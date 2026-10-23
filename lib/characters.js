// Interviewer characters. For the MVP only Dracula is playable.

export const CHARACTERS = [
  {
    id: "dracula",
    name: "Count Dracula",
    emoji: "🧛",
    title: "The Theatrical CEO",
    description:
      "Demanding, dramatic, and obsessed with confident communication.",
    available: true,
  },
  {
    id: "zombie",
    name: "Zombie Boss",
    emoji: "🧟",
    title: "The Distracted Manager",
    description: "Chaotic and playful. Where did he put your resume?",
    available: false,
  },
  {
    id: "ghost",
    name: "Friendly Ghost",
    emoji: "👻",
    title: "The Gentle Mentor",
    description: "Encouraging and kind. Perfect for nervous applicants.",
    available: false,
  },
];

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) ?? null;
}
