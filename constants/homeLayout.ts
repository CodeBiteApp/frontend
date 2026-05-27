export const ROW_HEIGHT = 90;
export const BANNER_H = 68;
export const STAGES_TOP_PAD = 80;
export const ZIGZAG = [0.5, 0.68, 0.6, 0.42, 0.32, 0.52, 0.5];
export const DOTORI_STAGE_IDX = 5;
export const CODING_DOBI_STAGE_IDX = 2;
export const CODING_DOBI_SIZE = 150;
export const DOBI_SIZE = 110;

export function computeSectionHeight(stageCount: number): number {
  return BANNER_H + ROW_HEIGHT * stageCount + STAGES_TOP_PAD;
}

export function computeBreakpoints(stageCounts: number[]): number[] {
  const heights = stageCounts.map(computeSectionHeight);
  return heights.reduce<number[]>(
    (acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + heights[i - 1]],
    [],
  );
}
