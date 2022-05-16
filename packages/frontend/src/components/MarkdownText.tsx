import { markdownParser } from '@/utils/parser';

const getMarkdownText = (text: string): string => {
  return markdownParser(text);
};

export default getMarkdownText;
