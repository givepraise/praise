import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { InlineLabel } from './InlineLabel';

interface Props {
  text: string;
  button?: JSX.Element;
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
}

export const InlineLabelClosable = ({
  text,
  className,
  onClick,
  onClose,
}: Props): JSX.Element => {
  return (
    <InlineLabel
      text={text}
      className={className}
      onClick={onClick}
      button={
        <button className="ml-2" onClick={onClose}>
          <FontAwesomeIcon
            className="text-white text-opacity-50 hover:text-opacity-100"
            icon={faTimes}
            size="1x"
          />
        </button>
      }
    />
  );
};
