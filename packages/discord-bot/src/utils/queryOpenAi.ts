import axios from 'axios';

export const queryOpenAi = async (
  data: string,
  prompt: string,
  key: string
): Promise<string> => {
  try {
    const body = {
      model: 'gpt-3.5-turbo',
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
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(`(queryOpenAi) ${(err as any).message as string}`);
  }
};
