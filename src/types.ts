export type ItemType = 'bundle' | 'stick' | 'rope';

export interface BoardItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  rotation?: number;
  isDeleting?: boolean;
  unbundledGroup?: string; // id linking sticks that came from the same bundle
}

export interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface MathProblem {
  a: number; // Minuend (被减数)
  b: number; // Subtrahend (减数)
  diff: number; // a - b
}
