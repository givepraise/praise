import { classNames } from '../../utils/';

type BoxVariant = '' | 'defaults' | 'wide';

interface BoxProps {
  variant?: BoxVariant;
  classes?: string;
  ref?: React.MutableRefObject<null>;
  children?:
    | JSX.Element
    | string
    | (string | JSX.Element | undefined | JSX.Element[])[]
    | string[]
    | JSX.Element[];
}

export const Box = ({
  variant,
  classes,
  ref,
  children,
}: BoxProps): JSX.Element => {
  const defaultClass =
    'border shadow-md rounded-xl bg-warm-gray-50 dark:bg-slate-600';
  const regularClass = `w-full md:w-[710px] p-5 ${defaultClass}`;
  const wideClass = `w-full md:w-[710px] xl:w-[960px] p-5 ${defaultClass}`;

  let variantClass = regularClass;
  switch (variant) {
    case '':
      variantClass = regularClass;
      break;
    case 'defaults':
      variantClass = defaultClass;
      break;
    case 'wide':
      variantClass = wideClass;
      break;
    default:
      variantClass = regularClass;
      break;
  }

  return (
    <div className={classNames(variantClass, classes)} ref={ref}>
      {children}
    </div>
  );
};
