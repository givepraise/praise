import { classNames } from '../../utils';

type ButtonVariant = '' | 'outline' | 'round';

interface ButtonProps {
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  children?:
    | JSX.Element
    | string
    | (string | JSX.Element)[]
    | string[]
    | JSX.Element[];
  onClick?: () => void;
}

export const Button = ({
  id,
  type,
  variant = '',
  className,
  disabled = false,
  children,
  onClick,
}: ButtonProps): JSX.Element => {
  const disabledModifier =
    'disabled:cursor-default disabled:bg-themecolor-3/50 disabled:text-white/50';

  const defaultClass = `px-4 py-2 font-bold text-white rounded-md bg-themecolor-3 hover:bg-themecolor-4 ${disabledModifier}`;
  const outlineClass = `border-2 border-themecolor-3 px-4 py-2 font-bold text-white rounded-md bg-themecolor-3 hover:bg-themecolor-4 ${disabledModifier}`;
  const roundClass = `flex items-center justify-center rounded-full hover:bg-warm-gray-300 w-7 h-7 dark:text-white dark:hover:bg-slate-800 ${disabledModifier}`;

  let variantClass = defaultClass;
  switch (variant) {
    case '':
      variantClass = defaultClass;
      break;
    case 'outline':
      variantClass = outlineClass;
      break;
    case 'round':
      variantClass = roundClass;
      break;
    default:
      variantClass = defaultClass;
      break;
  }

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(variantClass, className)}
    >
      {children}
    </button>
  );
};
