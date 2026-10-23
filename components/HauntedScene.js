import styles from "./HauntedScene.module.css";

// A decorative haunted-house backdrop for the landing screen, drawn as inline SVG
// so it needs no image files and stays crisp at any size.
// It is pure decoration: aria-hidden hides it from screen readers, and
// pointer-events: none (in the CSS) means it can never block a click.
//
// This component has no state or click handling, so it needs no "use client".

// Lit windows: x/y/width/height inside the 1200 x 600 drawing, plus which ones flicker.
// Keeping them in a list means we don't repeat the same <rect> tag by hand.
const WINDOWS = [
  { x: 330, y: 300, w: 28, h: 44, flicker: "a" }, //   left tower
  { x: 330, y: 380, w: 28, h: 44 },
  { x: 430, y: 380, w: 34, h: 50 }, //                 main house, row 1
  { x: 520, y: 380, w: 34, h: 50, flicker: "b" },
  { x: 646, y: 380, w: 34, h: 50 },
  { x: 736, y: 380, w: 34, h: 50, flicker: "a" },
  { x: 470, y: 305, w: 30, h: 44 }, //                 main house, row 2
  { x: 570, y: 300, w: 60, h: 44 }, //                 big center window
  { x: 700, y: 305, w: 30, h: 44, flicker: "b" },
  { x: 834, y: 330, w: 26, h: 42 }, //                 right tower
];

export default function HauntedScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      {/* viewBox is the drawing's own coordinate system (1200 wide, 600 tall).
          preserveAspectRatio="xMidYMax slice" keeps the house centered and sitting on
          the bottom edge, and crops the sides on narrow phones instead of squashing. */}
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" className={styles.svg}>
        <defs>
          {/* Soft glow around the moon. */}
          <radialGradient id="moonGlow">
            <stop offset="0%" stopColor="#ffe2b8" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ffb066" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffb066" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Moon, upper right. */}
        <circle cx="1010" cy="110" r="110" fill="url(#moonGlow)" />
        <circle cx="1010" cy="110" r="44" fill="#ffe9cc" />

        {/* Bats. Each is a small wing shape; the CSS makes them drift side to side. */}
        <g className={`${styles.bat} ${styles.batOne}`} fill="#1b0f2e">
          <path d="M0,0 Q10,-12 20,0 Q30,-12 40,0 Q30,-3 20,6 Q10,-3 0,0Z" transform="translate(760 90)" />
        </g>
        <g className={`${styles.bat} ${styles.batTwo}`} fill="#1b0f2e">
          <path d="M0,0 Q10,-12 20,0 Q30,-12 40,0 Q30,-3 20,6 Q10,-3 0,0Z" transform="translate(850 150) scale(0.8)" />
        </g>
        <g className={`${styles.bat} ${styles.batThree}`} fill="#1b0f2e">
          <path d="M0,0 Q10,-12 20,0 Q30,-12 40,0 Q30,-3 20,6 Q10,-3 0,0Z" transform="translate(240 130) scale(0.9)" />
        </g>

        {/* Hill the house sits on. */}
        <ellipse cx="600" cy="610" rx="780" ry="110" className={styles.ground} />

        {/* Bare tree on the left: a trunk and a few branches drawn as lines. */}
        <g className={styles.tree} fill="none" strokeLinecap="round">
          <path d="M170,520 L170,400" strokeWidth="14" />
          <path d="M170,430 L120,370 M170,410 L225,350 M120,370 L95,335 M225,350 L255,318 M170,450 L135,420" strokeWidth="7" />
        </g>

        {/* The house: main body, two towers, pointed roofs and a chimney. */}
        <g className={styles.house}>
          <rect x="390" y="280" width="420" height="250" />
          <polygon points="368,286 600,170 832,286" />
          <rect x="690" y="195" width="34" height="80" />
          <rect x="300" y="260" width="96" height="270" />
          <polygon points="290,266 348,140 406,266" />
          <rect x="812" y="300" width="84" height="230" />
          <polygon points="802,306 854,200 906,306" />
        </g>

        {/* Lit windows (some flicker) and the front door. */}
        {WINDOWS.map((w) => (
          <rect
            key={`${w.x}-${w.y}`}
            x={w.x}
            y={w.y}
            width={w.w}
            height={w.h}
            rx="3"
            className={`${styles.window} ${w.flicker === "a" ? styles.flickerA : ""} ${w.flicker === "b" ? styles.flickerB : ""}`}
          />
        ))}
        <path d="M572,530 L572,468 Q600,436 628,468 L628,530 Z" className={styles.door} />

        {/* Iron fence along the bottom. */}
        <g className={styles.fence}>
          <rect x="250" y="500" width="700" height="6" />
          {Array.from({ length: 24 }, (_, i) => (
            <rect key={i} x={254 + i * 29} y="476" width="5" height="54" />
          ))}
        </g>
      </svg>
    </div>
  );
}
