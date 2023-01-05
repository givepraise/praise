import { Quantifier } from '@/praise/interfaces/quantifier.interface.';

export interface Assignments {
  poolAssignments: Quantifier[];
  remainingAssignmentsCount: number;
  remainingPraiseCount: number;
}
