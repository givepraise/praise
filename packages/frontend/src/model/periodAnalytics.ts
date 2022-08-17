import { PraiseDetailsDto, QuantificationDto } from 'api/dist/praise/types';
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
  key: 'PeriodTop10Praise',
  get:
    (periodId: string | undefined) =>
    ({ get }): PraiseDetailsDto[] | undefined => {
      if (!periodId) return undefined;
      const praise = get(PeriodPraiseSortedByScore(periodId));
      if (!praise) return undefined;
      return praise.slice(0, 10);
    },
});

interface PeriodStats {
  totalPraise: number;
  totalPraiseScoreRealized: number;
}
export const PeriodStatsSelector = selectorFamily({
  key: 'PeriodStatsSelector',
  get:
    (periodId: string | undefined) =>
    ({ get }): PeriodStats | undefined => {
      if (!periodId) return undefined;
      const praise = get(AllPeriodPraise(periodId));
      if (!praise) return undefined;
      return {
        totalPraise: praise.length,
        totalPraiseScoreRealized: praise.reduce(
          (acc, curr) => acc + curr.scoreRealized,
          0
        ),
      };
    },
});

export const AllPeriodQuantifications = selectorFamily({
  key: 'AllPeriodQuantifications',
  get:
    (periodId: string | undefined) =>
    ({ get }): QuantificationDto[] | undefined => {
      if (!periodId) return undefined;
      const praise = get(AllPeriodPraise(periodId));
      if (!praise) return undefined;
      return praise.reduce((acc: QuantificationDto[], curr) => {
        for (const q of curr.quantifications) {
          acc.push(q);
        }
        return acc;
      }, []);
    },
});

export const PeriodQuantScoreDistribution = selectorFamily({
  key: 'PeriodQuantScoreDistribution',
  get:
    (periodId: string | undefined) =>
    ({ get }): Map<number, number> | undefined => {
      if (!periodId) return undefined;
      const quantifications = get(AllPeriodQuantifications(periodId));
      if (!quantifications) return undefined;
      return quantifications.reduce(
        (acc: Map<number, number>, curr) =>
          acc.set(curr.score, (acc.get(curr.score) || 0) + 1),
        new Map<number, number>()
      );
    },
});
