import axios, { AxiosError } from 'axios';
import { logger } from './logger';
import { ApiException } from './exceptions/api-exception';
import { errorMessages } from './exceptions/error-messages';

export const queryOpenAi = async (
  data: string,
  prompt: string,
  key: string,
): Promise<string> => {
  try {
    const body = {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `${prompt}\n\n${data}` }],
    };
    const headers = {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      body,
      {
        headers,
      },
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    const axiosError = err as AxiosError;
    logger.error(axiosError);
    logger.error(axiosError.response?.data);
    throw new ApiException(
      errorMessages.OPEN_AI_API_ERROR,
      "Couldn't query OpenAI API.",
    );
  }
};
