export interface LeitnerBox {
  box: number;
  count: number;
}

export interface Stats {
  totalWords: number;
  mastered: number;
  retention: number;
  sessions: number;
  leitnerBoxes: LeitnerBox[];
  weeklyActivity: [number, number, number, number, number, number, number];
}
