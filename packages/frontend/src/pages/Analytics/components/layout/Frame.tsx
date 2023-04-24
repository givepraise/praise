import { classNames } from '../../../../utils';

export const Frame = ({
  children,
  className,
}: {
  children: JSX.Element[];
  className?: string;
}): JSX.Element => {
  const classes = classNames(
    'w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column',
    className
  );
  return <div className={classes}>{children}</div>;
};
