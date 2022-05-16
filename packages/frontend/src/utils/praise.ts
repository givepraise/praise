import { PraiseDto, QuantificationDto } from 'api/dist/praise/types';

export const quantification = (
  praise: PraiseDto,
  userId: string
): QuantificationDto | undefined => {
  return praise.quantifications.find((q) => q.quantifier === userId);
};

export const dismissed = (praise: PraiseDto, userId: string): boolean => {
  const q = quantification(praise, userId);
  return q ? !!q.dismissed : false;
};

export const duplicate = (praise: PraiseDto, userId: string): boolean => {
  const q = quantification(praise, userId);
  return q ? (q.duplicatePraise ? true : false) : false;
};

export const shortDuplicatePraiseId = (
  praise: PraiseDto,
  userId: string
): string => {
  const q = quantification(praise, userId);
  return q && q.duplicatePraise ? q.duplicatePraise?.slice(-4) : '';
};
