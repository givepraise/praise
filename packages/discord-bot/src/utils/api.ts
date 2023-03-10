import axios, { AxiosInstance } from 'axios';

export const apiBaseURL = `${process.env.API_URL as string}/api`;

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: { 'x-api-key': process.env.DISCORD_BOT_API_KEY },
});
