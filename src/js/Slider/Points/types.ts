export type TPoint = {
  index: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  progress: number;
  xDirection: number;
  xMove: number;
};

export type TRow = {
  length: number;
  points: TPoint[];
  pointsSpreadScopes: number[][];
};

export type TPointsProps = {
  rowShift: number;
  isReverse: boolean;
};

export type TProps = TPointsProps & {
  name: string;
  container: HTMLElement;
  hasDomHelpers: boolean;
};
