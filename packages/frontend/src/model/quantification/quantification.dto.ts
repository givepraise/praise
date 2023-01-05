export interface QuantificationDto {
  quantifier: string;
  score: number;
  scoreRealized?: number;
  dismissed: boolean;
  duplicatePraise?: string;
  createdAt: string;
  updatedAt: string;
}
