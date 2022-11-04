import { PraiseDto } from 'api/dist/praise/types';

interface PraiseRowProps {
  praise: PraiseDto;
  children: JSX.Element;
}

export const PraiseRow = ({ children }: PraiseRowProps): JSX.Element => {
  return (
    <li className="md:p-5 first:rounded-t-lg hover:bg-warm-gray-100 dark:hover:bg-slate-500">
      <div>{children}</div>
    </li>
  );
};
