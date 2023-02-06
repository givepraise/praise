export interface QuantificationDto {
  quantifier: string;
  score: number;
  scoreRealized?: number;
  dismissed: boolean;
  duplicatePraiseId?: string;
  createdAt: string;
  updatedAt: string;
}
