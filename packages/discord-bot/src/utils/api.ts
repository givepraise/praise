import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { isDocker } from './isDocker';
import { logger } from './logger';

export const apiBaseURL = isDocker()
  ? `http://api:${process.env.API_PORT as string}/api`
  : `${process.env.API_URL as string}/api`;

/**
 * Get the API key for the Discord bot from the list of API keys and roles
 * defined in the environment variables.
 */
function getApiKey(): string {
  const keys = process.env.API_KEYS?.split(',');
  const keyRoles = process.env.API_KEY_ROLES?.split(',');

  if (!keys || !keyRoles) {
    throw new Error('API_KEYS and API_KEY_ROLES must be defined');
  }

  const keyIndex = keyRoles.indexOf('API_KEY_DISCORD_BOT');
  return keys[keyIndex];
}

/**
 * Axios instance for the API.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'user-agent': 'DiscordBot/0.13.1',
    'x-api-key': getApiKey(),
  },
});

export async function apiGet<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  try {
    return await apiClient.get<T>(endpoint, config);
  } catch (err) {
    logger.error(err);
    logger.error((err as AxiosError).response?.data);
    throw err;
  }
}

export async function apiPost<T, U>(
  endpoint: string,
  data?: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  try {
    return await apiClient.post<T>(endpoint, data, config);
  } catch (err) {
    logger.error(err);
    logger.error((err as AxiosError).response?.data);
    throw err;
  }
}

export async function apiPatch<T, U>(
  endpoint: string,
  data?: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  try {
    return await apiClient.patch<T>(endpoint, data, config);
  } catch (err) {
    logger.error(err);
    logger.error((err as AxiosError).response?.data);
    throw err;
  }
}
