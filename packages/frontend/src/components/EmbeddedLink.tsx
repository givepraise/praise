import { LinkPreview } from '@dhaiwat10/react-link-preview';

const getUrlFromString = (string): string | null => {
  const urlRegex = /\bhttps?:\/\/\S+/gi;
  let url = string.match(urlRegex);

  if (url) {
    url = url[0].replace(/[\])}[{(]/g, '');
  }

  return url;
};

interface EmbeddedLinkProps {
  text: string;
  width: string;
  className: string;
}

const EmbeddedLink = ({
  text,
  width,
  className,
}: EmbeddedLinkProps): JSX.Element | null => {
  const url = getUrlFromString(text);
  return !url ? null : (
    <LinkPreview
      className={className}
      url="https://www.npmjs.com/package/@dhaiwat10/react-link-preview"
      width={width}
      openInNewTab={true}
    />
  );
};

export default EmbeddedLink;
