export interface BatchInfo {
  id: string;
  label: string;
  shortLabel: string;
  cardClass: string;
  emoji: string;
  description: string;
  gradient: string;
}

export const BATCHES: BatchInfo[] = [
  {
    id: "class-6",
    label: "Class 6",
    shortLabel: "VI",
    cardClass: "batch-card-6",
    emoji: "🌱",
    description: "Foundation building for young learners",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    id: "class-7",
    label: "Class 7",
    shortLabel: "VII",
    cardClass: "batch-card-7",
    emoji: "📐",
    description: "Strengthening core concepts",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    id: "class-8",
    label: "Class 8",
    shortLabel: "VIII",
    cardClass: "batch-card-8",
    emoji: "🔭",
    description: "Exploring advanced topics",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "class-9",
    label: "Class 9",
    shortLabel: "IX",
    cardClass: "batch-card-9",
    emoji: "⚡",
    description: "Building exam readiness",
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    id: "class-10",
    label: "Class 10",
    shortLabel: "X",
    cardClass: "batch-card-10",
    emoji: "🏆",
    description: "Board exam preparation",
    gradient: "from-emerald-400 to-green-600",
  },
  {
    id: "class-11",
    label: "Class 11",
    shortLabel: "XI",
    cardClass: "batch-card-11",
    emoji: "🧪",
    description: "Science & commerce foundation",
    gradient: "from-amber-400 to-yellow-600",
  },
  {
    id: "class-12",
    label: "Class 12",
    shortLabel: "XII",
    cardClass: "batch-card-12",
    emoji: "🎯",
    description: "Final year mastery",
    gradient: "from-red-400 to-red-600",
  },
  {
    id: "neet",
    label: "NEET",
    shortLabel: "NEET",
    cardClass: "batch-card-neet",
    emoji: "🩺",
    description: "Medical entrance excellence",
    gradient: "from-indigo-800 to-indigo-600",
  },
  {
    id: "mission-jeet",
    label: "Mission Jeet",
    shortLabel: "JEET",
    cardClass: "batch-card-jeet",
    emoji: "🚀",
    description: "JEE + NEET combined powerhouse batch",
    gradient: "from-fuchsia-500 to-orange-500",
  },
];

export function getBatchById(id: string): BatchInfo | undefined {
  return BATCHES.find((b) => b.id === id);
}
