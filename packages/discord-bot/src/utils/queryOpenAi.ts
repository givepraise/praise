import axios from 'axios';

export const queryOpenAi = async (
  data: string,
  prompt: string,
  key: string
) => {
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `${prompt}\n\n${data}` }],
  };
  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  const res = await axios
    .post('https://api.openai.com/v1/chat/completions', body, {
      headers,
    })
    .then((res) => res.data)
    .catch((err) => err.message);

  return res.choices[0].message.content;
};
