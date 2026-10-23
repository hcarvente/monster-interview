// Fixed interview content + limits. Shared by the browser (UI) and the server
// (validation + prompt), so there is one source of truth.

export const QUESTIONS_PER_INTERVIEW = 3;

// Server-enforced cap per answer. ~800 characters is roughly 200 tokens,
// which keeps input cost predictable.
export const MAX_ANSWER_CHARS = 800;

export const CATEGORIES = [
  {
    id: "entry-level",
    label: "Entry-Level Job",
    description: "Your first role. Show your potential and attitude.",
    questions: [
      "Tell me about yourself and why you are interested in this role.",
      "Describe a time you learned something new quickly. How did you do it?",
      "What is your biggest strength, and how would it help our team?",
    ],
  },
  {
    id: "internship",
    label: "Internship",
    description: "Prove you are curious, reliable, and ready to learn.",
    questions: [
      "Why do you want this internship, and what do you hope to learn?",
      "Tell me about a project or class assignment you are proud of.",
      "How do you handle feedback or a task you find difficult?",
    ],
  },
  {
    id: "leadership",
    label: "Leadership / Fellowship",
    description: "Share your vision and how you lift others up.",
    questions: [
      "Tell me about a time you led others toward a shared goal.",
      "Describe a challenge you faced as a leader and how you handled it.",
      "Why should we choose you for this fellowship, and what impact will you make?",
    ],
  },
];

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? null;
}
