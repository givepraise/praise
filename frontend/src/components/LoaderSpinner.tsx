import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LoaderSpinner = () => {
  return (
    <div className="w-full mt-2 text-center">
      <FontAwesomeIcon
        icon={faSpinner}
        size="1x"
        spin
        className="inline-block mr-4"
      />
    </div>
  );
};

export default LoaderSpinner;
