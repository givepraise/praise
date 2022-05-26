import { markdownParser } from '@/utils/parser';
import linkifyHtml from 'linkify-html';

const getMarkdownText = (text: string): string => {
  return linkifyHtml(markdownParser(text), { target: '_blank' });
};

export default getMarkdownText;
