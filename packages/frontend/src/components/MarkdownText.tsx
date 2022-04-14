import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

const getMarkdownText = (text: string): string => {
  return micromark(text, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
};

export default getMarkdownText;
