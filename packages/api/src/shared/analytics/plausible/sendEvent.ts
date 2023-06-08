import axios from 'axios';

interface PlausibleEventInput {
  userAgent: string;
  xForwardedFor: string;
  eventName?: string;
  props?: any;
}

export async function sendPageViewEvent(
  input: PlausibleEventInput,
): Promise<void> {
  const endpoint = 'https://plausible.io/api/event';

  const headers = {
    'User-Agent': input.userAgent,
    'X-Forwarded-For': input.xForwardedFor,
    'Content-Type': 'application/json',
  };

  const domain = process.env.PRAISE_DOMAIN_IN_PLAUSIBLE;
  const url = process.env.PRAISE_URL_IN_PLAUSIBLE;
  const body = {
    name: input.eventName || 'pageview',
    domain,
    url,
    props: input.props,
  };

  try {
    const response = await axios.post(endpoint, body, { headers: headers });

    // Check status
    if (response.status != 200) {
      throw new Error(`Unexpected response code: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error sending pageview event: ${error}`);
  }
}
