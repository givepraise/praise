import { PraiseDto } from 'api/dist/praise/types';
import { useHistory } from 'react-router-dom';

interface PraiseRowProps {
  praise: PraiseDto;
  children: JSX.Element;
}

export const PraiseRow = ({
  praise,
  children,
}: PraiseRowProps): JSX.Element => {
  const history = useHistory();

  const handleClick =
    (data: PraiseDto) => (event: React.MouseEvent<HTMLTableRowElement>) => {
      const element = event.target as HTMLElement;

      console.log('ELEMENT:', element.tagName);

      // if (element.tagName !== 'A') {
      //   history.push(`/praise/${data._id}`);
      // }
    };

  return (
    <li className="md:p-5 first:rounded-t-lg hover:bg-warm-gray-100 dark:hover:bg-slate-500">
      <div>{children}</div>
    </li>
  );
};
