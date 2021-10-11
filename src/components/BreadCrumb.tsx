import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface BreadCrumbProps {
  name: string;
  icon: IconProp;
}
const BreadCrumb = ({ name, icon }: BreadCrumbProps) => {
  return (
    <div className="mb-16 text-sm">
      <FontAwesomeIcon
        icon={icon}
        size="2x"
        className="inline-block mr-2 align-text-bottom"
      />
      {name}
    </div>
  );
};

export default BreadCrumb;
