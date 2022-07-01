import { classNames } from '../utils';

interface Params {
  children?: JSX.Element;
  type?: string;
  className?: string;
}

export const Notice = ({
  children,
  type = 'danger',
  className = '',
}: Params): JSX.Element => {
  let typeClasses = '';

  if (type === 'danger') {
    typeClasses = 'bg-red-200';
  } else if (type === 'success') {
    typeClasses = 'bg-green-300';
  } else if (type === 'warning') {
    typeClasses = 'bg-orange-300';
  } else if (type === 'info') {
    typeClasses = 'bg-warm-gray-300 dark:bg-slate-700';
  }

  return (
    <div
      className={classNames(
        'w-full p-4 text-center text-white rounded-sm',
        className,
        typeClasses
      )}
    >
      {children}
    </div>
  );
};
