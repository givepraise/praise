import { Praise } from '@/model/praise/praise.dto';
import { useQuantifyPraise } from '@/model/quantification/quantification';
import { InlineLabelClosable } from '../ui/InlineLabelClosable';

interface Props {
  praise: Praise;
  dismissed?: boolean;
  shortDuplicatePraise?: string;
}

export const PraiseInlineLabelClosable = ({
  praise,
  dismissed = false,
  shortDuplicatePraise = undefined,
}: Props): JSX.Element => {
  const { quantify } = useQuantifyPraise();

  return (
    <>
      {dismissed && (
        <InlineLabelClosable
          text="Dismissed"
          className="bg-red-600"
          onClose={(): void => void quantify(praise._id, 0, false, null)}
        />
      )}
      {shortDuplicatePraise && (
        <InlineLabelClosable
          text={`Duplicate of: #${shortDuplicatePraise}`}
          className="bg-warm-gray-700"
          onClose={(): void => void quantify(praise._id, 0, false, null)}
        />
      )}
    </>
  );
};
