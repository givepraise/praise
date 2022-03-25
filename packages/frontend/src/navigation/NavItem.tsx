import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

interface NavProps {
  icon?: IconProp;
  description: string;
  to: string;
}

const NavItem = ({ icon, description, to }: NavProps): JSX.Element => {
  return (
    <Link
      to={to}
      className="relative px-4 py-1 cursor-pointer hover:bg-gray-100 mr-[1px] no-underline flex items-center"
      id={to.substring(1) + '-nav-button'}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          size="1x"
          className="inline-block ml-2 mr-3"
        />
      )}
      <div className="flex-auto inline-block my-1">
        <span>{description}</span>
      </div>
    </Link>
  );
};

export default NavItem;
