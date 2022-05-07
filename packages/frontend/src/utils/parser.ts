export const markdownParser = (text: string): string => {
  const toHTML = text
    .replace(/```([^_]*)```/gim, '<pre><code>$1</code></pre>') // multiline code
    .replace(/`([^_]*)`/gim, '<code>$1</code>') // inline code
    .replace(/__([^_]*)__/gim, '<u>$1</u>') // underscore text
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
    .replace(/_([^_]*)_/gim, '<i>$1</i>') // italic text
    .replace(/\*(.*)\*/gim, '<i>$1</i>') // italic text
    .replace(/~~([^_]*)~~/gim, '<s>$1</s>'); // strikethrough text
  return toHTML.trim(); // using trim method to remove whitespace
};
