import { AxiosResponse, AxiosError } from 'axios';
import { selector, selectorFamily } from 'recoil';
import { ApiAuthGet, isResponseOk } from '../api';
import { ReportManifestDto } from './dto/report-manifest.dto';

/**
 * Selector query to fetch all reports from the api.
 * @returns Full response/error returned by server.
 */
const AllReportsQuery = selector({
  key: 'AllReportsQuery',
  get: ({ get }): AxiosResponse<ReportManifestDto[]> | AxiosError => {
    return get(ApiAuthGet({ url: '/reports' })) as
      | AxiosResponse<ReportManifestDto[]>
      | AxiosError;
  },
});

export const AllReports = selector({
  key: 'AllReports',
  get: ({ get }): ReportManifestDto[] | null => {
    const reports = get(AllReportsQuery);

    if (isResponseOk(reports)) {
      return reports.data;
    }

    return null;
  },
});

export const SingleReport = selectorFamily({
  key: 'SingleReport',
  get:
    (name: string | null | undefined) =>
    ({ get }): ReportManifestDto | null => {
      const reports = get(AllReports);

      if (reports && name) {
        const report = reports.find((report) => report.name === name);
        if (report) return report;
      }

      return null;
    },
});
