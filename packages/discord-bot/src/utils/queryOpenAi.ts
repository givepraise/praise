import axios from 'axios';

export const queryOpenAi = async (
  data: string,
  prompt: string,
  key: string
): Promise<string> => {
  try {
    const body = {
      model: process.env?.OPENAI_MODEL || 'gpt-3.5-turbo',
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
      }
    );

    return res.data.choices[0].message.content;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.response) {
      throw new Error(
        `(queryOpenAi) ${err.response.status as string}: ${
          err.response.data as string
        }\n`
      );
    } else {
      throw new Error(`(queryOpenAi) ${err.message as string}\n`);
    }
  }
};
