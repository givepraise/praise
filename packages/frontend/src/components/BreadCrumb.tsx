import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface BreadCrumbProps {
  name: string;
  icon: IconProp;
}
const BreadCrumb = ({ name, icon }: BreadCrumbProps): JSX.Element => {
  return (
    <div className="inline-block px-4 py-2 mb-4 text-xs text-gray-500 rounded-full bg-warm-gray-50 dark:text-gray-400 dark:bg-slate-600">
      <h3>
        <FontAwesomeIcon
          icon={icon}
          size="1x"
          className="inline-block mb-[2px] mr-2 align-text-bottom"
        />
        {name}
      </h3>
    </div>
  );
};

export default BreadCrumb;
