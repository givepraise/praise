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
        target: '_blank',
      },
      state
    );
  };

  let html = toHTML(
    text,
    { discordOnly: false },
    parser,
    markdownEngine.outputFor(rules, 'html')
  ).trim(); // using trim method to remove whitespace

  // check if exetrnal image exists in string if it add class to reduce size of image
  if (html.match(/<img/)) {
    html = html.replace(/d-emoji/gi, 'w-5 inline-block');
  }

  return html;
};
