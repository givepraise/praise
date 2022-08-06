import { classNames } from '../../utils/';

type PraiseButtonVariant = '' | 'disabled' | 'outline' | 'round';

interface PraiseButtonProps {
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: PraiseButtonVariant;
  classes?: string;
  children?:
    | JSX.Element
    | string
    | (string | JSX.Element)[]
    | string[]
    | JSX.Element[];
  onClick?: () => void;
}

export const PraiseButton = ({
  id,
  type,
  variant = '',
  classes,
  children,
  onClick,
}: PraiseButtonProps): JSX.Element => {
  const isDisabled = variant === 'disabled';
  const variantClass =
    variant === '' || !variant ? 'praise-button' : `praise-button-${variant}`;

  return (
    <button
      id={id}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={classNames(variantClass, classes)}
    >
      {children}
    </button>
  );
};
