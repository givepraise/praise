import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

interface NavProps {
  icon?: IconProp;
  description: string;
  to: string;
}

export const NavItem = ({ icon, description, to }: NavProps): JSX.Element => {
  return (
    <li className="group">
      <NavLink
        to={to}
        className={(isActive): string =>
          `relative group-first:rounded-t-lg group-last:rounded-b-lg px-5 py-2 cursor-pointer no-underline flex items-center ${
            isActive
              ? ' bg-warm-gray-100 dark:bg-slate-700'
              : ' hover:bg-warm-gray-100 dark:hover:bg-slate-700'
          }`
        }
        id={to.substring(1) + '-nav-button'}
      >
        {icon && (
          <div className="inline-block w-8 text-center">
            <FontAwesomeIcon icon={icon} size="1x" className="inline-block" />
          </div>
        )}
        <div className="flex-auto inline-block my-1 whitespace-nowrap">
          {description}
        </div>
      </NavLink>
    </li>
  );
};
