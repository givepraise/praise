import { PraiseDto } from 'shared/dist/praise/types';
import { useQuantifyPraise } from '@/model/praise';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
  praise: PraiseDto;
}

const ResetQuantificationButton = ({ praise }: Props): JSX.Element => {
  const { quantify } = useQuantifyPraise();

  return (
    <button
      onClick={(): void => void quantify(praise._id, 0, false, null)}
      className="ml-2"
    >
      <FontAwesomeIcon
        className="text-white text-opacity-50 hover:text-opacity-100"
        icon={faTimes}
        size="1x"
      />
    </button>
  );
};

export default ResetQuantificationButton;
