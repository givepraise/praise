import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

interface NavSubItemProps {
  icon?: IconProp;
  description: string;
  to: string;
}

export const NavSubItem = ({
  icon,
  description,
  to,
}: NavSubItemProps): JSX.Element => {
  return (
    <div className="flex items-center h-12 mx-1 grow hover:bg-warm-gray-100 dark:hover:bg-slate-700">
      <Link to={{ pathname: to }} target="_blank" className="w-full">
        {icon && (
          <div className="inline-block w-8 text-center text-themecolor-3">
            <FontAwesomeIcon icon={icon} size="1x" className="inline-block" />
          </div>
        )}
        <div className="flex-auto inline-block my-1 whitespace-nowrap">
          {description}
        </div>
      </Link>
    </div>
  );
};
