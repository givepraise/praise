import { classNames } from '../../utils/';

type PraisePageVariant = '' | 'wide';

interface PraisePageProps {
  variant?: PraisePageVariant;
  classes?: string;
  ref?: React.MutableRefObject<null>;
  children?:
    | JSX.Element
    | string
    | (string | JSX.Element)[]
    | string[]
    | JSX.Element[];
}

export const PraisePage = ({
  variant,
  classes,
  ref,
  children,
}: PraisePageProps): JSX.Element => {
  const variantClass =
    variant === '' || !variant ? 'praise-page' : `praise-page-${variant}`;

  return (
    <div className={classNames(variantClass, classes)} ref={ref}>
      {children}
    </div>
  );
};
