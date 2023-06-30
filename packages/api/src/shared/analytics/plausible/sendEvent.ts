import axios from 'axios';
import { logger } from '../../logger';

interface PlausibleEventInput {
  userAgent: string;
  xForwardedFor: string;
  url: string;
  eventName?: string;
  props?: any;
}

export async function sendPageViewEvent(
  input: PlausibleEventInput,
): Promise<void> {
  const endpoint = 'https://plausible.io/api/event';
  const { userAgent, xForwardedFor, url, eventName, props } = input;
  const headers = {
    'User-Agent': userAgent,
    'X-Forwarded-For': xForwardedFor,
    'Content-Type': 'application/json',
  };

  const domain = process.env.PLAUSIBLE_DOMAIN;
  const body = {
    name: eventName || 'pageview',
    domain,
    url,
    props,
  };

  try {
    const response = await axios.post(endpoint, body, { headers: headers });

    // Check status
    if (response.status != 200) {
      throw new Error(`Unexpected response code: ${response.status}`);
    }
  } catch (error) {
    logger.error(`Error sending pageview event: ${error}`);
  }
}
