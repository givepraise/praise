import {
  toHTML,
  rules,
  htmlTag,
  markdownEngine,
  parser,
} from 'discord-markdown';

export const getMarkdownText = (text: string): string => {
  rules.url.html = (node, output, state): string => {
    return htmlTag(
      'a',
      output(
        node.content[0].content.length > 50
          ? [
              {
                content: `${node.content[0].content.slice(0, 50)}...`,
                type: 'text',
              },
            ]
          : node.content,
        state
      ),
      {
        href: markdownEngine?.sanitizeUrl(node.target) || '',
      },
      state
    );
  };
  return toHTML(
    text,
    { discordOnly: false },
    parser,
    markdownEngine.outputFor(rules, 'html')
  ).trim(); // using trim method to remove whitespace
};
