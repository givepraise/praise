import axios, { AxiosInstance } from 'axios';

export const apiBaseURL = `${process.env.API_URL as string}/api`;

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
