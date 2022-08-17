import { PraiseDetailsDto } from 'api/dist/praise/types';
import { selectorFamily } from 'recoil';
import { AllPeriodPraise } from './periods';

export const PeriodPraiseSortedByScore = selectorFamily({
  key: 'PeriodPraiseSortedByScore',
  get:
    (periodId: string | undefined) =>
    ({ get }): PraiseDetailsDto[] | undefined => {
      if (!periodId) return undefined;
      const praise = get(AllPeriodPraise(periodId));
      if (!praise) return undefined;
      return [...praise].sort((a, b) => b.scoreRealized - a.scoreRealized);
    },
});

export const PeriodTop10Praise = selectorFamily({
  key: 'Top10Praise',
  get:
    (periodId: string | undefined) =>
    ({ get }): PraiseDetailsDto[] | undefined => {
      if (!periodId) return undefined;
      const praise = get(PeriodPraiseSortedByScore(periodId));
      if (!praise) return undefined;
      return praise.slice(0, 10);
    },
});
