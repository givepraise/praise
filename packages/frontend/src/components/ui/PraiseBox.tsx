import { classNames } from '../../utils/';

type PraiseBoxVariant = '' | 'defaults' | 'wide';

interface PraiseBoxProps {
  variant?: PraiseBoxVariant;
  classes?: string;
  ref?: React.MutableRefObject<null>;
  children?:
    | JSX.Element
    | string
    | (string | JSX.Element | undefined | JSX.Element[])[]
    | string[]
    | JSX.Element[];
}

export const PraiseBox = ({
  variant,
  classes,
  ref,
  children,
}: PraiseBoxProps): JSX.Element => {
  const variantClass =
    variant === '' || !variant ? 'praise-box' : `praise-box-${variant}`;

  return (
    <div className={classNames(variantClass, classes)} ref={ref}>
      {children}
    </div>
  );
};
