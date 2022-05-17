import { PraiseDto } from 'api/dist/praise/types';
import { useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useQuantifyPraise } from '@/model/praise';
import { ActiveUserId } from '@/model/auth';
import { InlineLabel } from '@/components/InlineLabel';
import { dismissed, duplicate, shortDuplicatePraiseId } from '@/utils/praise';

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

interface Props {
  praise: PraiseDto;
}

export const PraiseInlineButtons = ({ praise }: Props): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);

  if (!userId) return null;

  return (
    <>
      {dismissed(praise, userId) && (
        <>
          <InlineLabel
            text="Dismissed"
            button={<ResetQuantificationButton praise={praise} />}
            className="bg-red-600"
          />
          <span className="line-through">{praise.reason}</span>
        </>
      )}
      {duplicate(praise, userId) && (
        <>
          <InlineLabel
            text={`Duplicate of: #${shortDuplicatePraiseId(praise, userId)}`}
            button={<ResetQuantificationButton praise={praise} />}
          />
          <span className="text-gray-400">{praise.reason}</span>
        </>
      )}
    </>
  );
};
