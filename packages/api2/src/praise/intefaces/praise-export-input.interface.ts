export interface PraiseExportInput {
  receiver?: string;
  giver?: string;
  createdAt?: {
    $gt: string;
    $lte: string;
  };
}
