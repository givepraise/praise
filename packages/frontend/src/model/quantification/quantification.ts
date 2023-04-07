import { AxiosResponse } from 'axios';
import { useRecoilCallback } from 'recoil';
import { useApiAuthClient } from '../../utils/api';
import { isResponseOk } from '../api';
import { SinglePraise } from '../praise/praise';
import { Praise } from '../praise/praise.dto';

type useQuantifyPraiseReturn = {
  quantify: (
    praiseId: string,
    score: number,
    dismissed: boolean,
    duplicatePraise: string | null
  ) => Promise<void>;
};

/**
 * Returns a function used to for close a period
 */
export const useQuantifyPraise = (): useQuantifyPraiseReturn => {
  const apiAuthClient = useApiAuthClient();

  const quantify = useRecoilCallback(
    ({ set }) =>
      async (
        praiseId: string,
        score: number,
        dismissed: boolean,
        duplicatePraise: string | null
      ): Promise<void> => {
        const response: AxiosResponse<Praise[]> = await apiAuthClient.patch(
          `/quantifications/${praiseId}`,
          {
            score,
            dismissed,
            duplicatePraise,
          }
        );
        if (isResponseOk(response)) {
          response.data.forEach((praise) => {
            set(SinglePraise(praise._id), praise);
          });
        }
      }
  );
  return { quantify };
};

type quantifyMultipleParams = {
  score: number;
  duplicatePraise?: string | null;
  dismissed?: boolean;
};

type useQuantifyMultiplePraiseReturn = {
  quantifyMultiple: (
    params: quantifyMultipleParams,
    praiseIds: string[]
  ) => Promise<void>;
};

/**
 * Returns a function used to quantify multiple praise.
 */
export const useQuantifyMultiplePraise =
  (): useQuantifyMultiplePraiseReturn => {
    const apiAuthClient = useApiAuthClient();

    const quantifyMultiple = useRecoilCallback(
      ({ set }) =>
        async (
          params: quantifyMultipleParams,
          praiseIds: string[]
        ): Promise<void> => {
          const response: AxiosResponse<Praise[]> = await apiAuthClient.patch(
            '/quantifications/multiple',
            {
              params,
              praiseIds,
            }
          );
          if (isResponseOk(response)) {
            response.data.forEach((praise) => {
              set(SinglePraise(praise._id), praise);
            });
          }
        }
    );
    return { quantifyMultiple };
  };
