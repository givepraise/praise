import { classNames } from '../../utils';

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
  let typeclassName = '';

  if (type === 'danger') {
    typeclassName = 'bg-red-200';
  } else if (type === 'success') {
    typeclassName = 'bg-green-300';
  } else if (type === 'warning') {
    typeclassName = 'bg-orange-300';
  } else if (type === 'info') {
    typeclassName = 'bg-warm-gray-300 dark:bg-slate-700';
  }

  return (
    <div
      className={classNames(
        'w-full p-4 text-center text-white rounded-sm',
        className,
        typeclassName
      )}
    >
      {children}
    </div>
  );
};
