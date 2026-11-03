import { FEELING_LEVELS, FEELING_SCORES, type FeelingLevel, type FeelingScore } from "@/lib/types";

const LEVELS: { score: FeelingLevel; color: string; mouth: string }[] = [
  { score: 1, color: "#FF4D4D", mouth: "M16 34c2.4-7 5.2-10 8-10s5.6 3 8 10" },
  { score: 3, color: "#FF8C32", mouth: "M17 31c2-3.5 4.2-5 7-5s5 1.5 7 5" },
  { score: 5, color: "#F5C518", mouth: "M16 30h16" },
  { score: 8, color: "#3DDC6A", mouth: "M17 28c2 4 4.4 6 7 6s5-2 7-6" },
  { score: 10, color: "#146B32", mouth: "M15 26c2.6 7 5.4 10 9 10s6.4-3 9-10" },
];

export function feelingLevel(score: FeelingScore) {
  return LEVELS.find((item) => item.score === score) ?? null;
}

function scoreLabel(score: FeelingScore): string {
  if (score === 1) return "1, worst";
  if (score === 10) return "10, best";
  return String(score);
}

export function FeelingChoices({
  value,
  onChange,
}: {
  value: FeelingScore | null;
  onChange: (feeling: FeelingScore | null) => void;
}) {
  return (
    <div className="date-field-block">
      <span>Feeling</span>
      <div className="feeling-choices" role="group" aria-label="Feeling">
        {FEELING_LEVELS.map((score) => (
          <button
            key={score}
            type="button"
            className="feeling-choice"
            aria-pressed={value === score}
            aria-label={scoreLabel(score)}
            onClick={() => onChange(value === score ? null : score)}
          >
            <FeelingFace feeling={score} decorative />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScoreChoices({
  value,
  onChange,
}: {
  value: FeelingScore | null;
  onChange: (feeling: FeelingScore | null) => void;
}) {
  return (
    <div className="date-field-block">
      <span>Feeling</span>
      <div className="score-choices" role="group" aria-label="Feeling">
        {FEELING_SCORES.map((score) => (
          <button
            key={score}
            type="button"
            className="score-choice"
            aria-pressed={value === score}
            aria-label={scoreLabel(score)}
            onClick={() => onChange(value === score ? null : score)}
          >
            {score}
          </button>
        ))}
      </div>
      <p className="feeling-hint">1 is the worst, 10 is the best.</p>
    </div>
  );
}

export function FeelingMark({ feeling }: { feeling: FeelingScore }) {
  if (feelingLevel(feeling)) return <FeelingFace feeling={feeling as FeelingLevel} />;
  return <span className="feeling-score" aria-label={`Feeling ${feeling}`}>{feeling}</span>;
}

export function FeelingFace({ feeling, decorative = false }: { feeling: FeelingLevel; decorative?: boolean }) {
  const level = feelingLevel(feeling);
  if (!level) return null;
  const ink = feeling === 10 ? "#F4FFF4" : "#101408";
  return (
    <svg viewBox="0 0 48 48" className="feeling-face" role={decorative ? undefined : "img"} aria-hidden={decorative ? true : undefined} aria-label={decorative ? undefined : scoreLabel(feeling)}>
      <circle cx="24" cy="24" r="20" fill={level.color} />
      <circle cx="17" cy="20" r="2.3" fill={ink} />
      <circle cx="31" cy="20" r="2.3" fill={ink} />
      <path d={level.mouth} fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
