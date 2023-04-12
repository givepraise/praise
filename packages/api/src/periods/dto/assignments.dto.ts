import { Quantifier } from '../../praise/interfaces/quantifier.interface';

export interface AssignmentsDto {
  poolAssignments: Quantifier[];
  remainingAssignmentsCount: number;
  remainingPraiseCount: number;
}
