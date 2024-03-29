import { Praise } from '@/model/praise/praise.dto';
import { useHistory } from 'react-router-dom';

interface PraiseRowProps {
  praise: Praise;
  children: JSX.Element;
}

export const PraiseRow = ({
  praise,
  children,
}: PraiseRowProps): JSX.Element => {
  const history = useHistory();

  const handleClick =
    (data: Praise) => (event: React.MouseEvent<HTMLTableRowElement>) => {
      event.stopPropagation();
      const element = event.target as HTMLElement;

      if (element.tagName !== 'A') {
        history.push(`/praise/${data._id}`);
      }
    };

  return (
    <li className="py-5 cursor-pointer  md:p-5 first:rounded-t-lg hover:bg-warm-gray-100 dark:hover:bg-slate-500">
      <div onClick={handleClick(praise)}>{children}</div>
    </li>
  );
};
