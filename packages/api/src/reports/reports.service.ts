import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { ApiException } from '../shared/exceptions/api-exception';
import { errorMessages } from '../shared/exceptions/error-messages';
import { ReportManifestDto } from './dto/report-manifest.dto';

@Injectable()
export class ReportsService {
  private octokit: Octokit;
  private owner = 'givepraise';
  private repo = 'reports';
  private basePath = 'reports';

  constructor() {
    this.octokit = new Octokit({
      userAgent: 'Praise API',
    });
  }

  async listAllReports(): Promise<ReportManifestDto[]> {
    try {
      const reportsDirs = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.basePath,
      });

      const manifestsPromises = reportsDirs.data
        .filter((item: { type: string }) => item.type === 'dir')
        .map(async (dir: { name: any }) => {
          try {
            const manifest = await this.octokit.repos.getContent({
              owner: this.owner,
              repo: this.repo,
              path: `${this.basePath}/${dir.name}/manifest.json`,
            });

            const content = Buffer.from(
              (manifest.data as any).content,
              'base64',
            ).toString();

            return JSON.parse(content);
          } catch (error) {
            throw new ApiException(
              errorMessages.REPORTS_LIST_ERROR,
              `Error fetching manifest for ${dir.name}: ${error.message}`,
            );
          }
        });

      return Promise.all(manifestsPromises);
    } catch (error) {
      throw new ApiException(
        errorMessages.REPORTS_LIST_ERROR,
        `Error fetching report directories: ${error.message}`,
      );
    }
  }
}
