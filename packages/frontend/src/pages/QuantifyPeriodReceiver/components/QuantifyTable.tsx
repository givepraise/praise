import { PeriodQuantifierReceiverPraise } from '@/model/periods';
import { useQuantifyPraise } from '@/model/praise';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import getWeek from 'date-fns/getWeek';
import parseISO from 'date-fns/parseISO';
import { groupBy, sortBy } from 'lodash';
import { PraiseDto } from 'api/dist/praise/types';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { QuantifyBackNextLink } from './BackNextLink';
import DismissDialog from './DismissDialog';
import DuplicateDialog from './DuplicateDialog';
import QuantifySlider from './QuantifySlider';
import DuplicateSearchDialog from './DuplicateSearchDialog';
import MarkDuplicateButton from './MarkDuplicateButton';
import MarkDismissedButton from './MarkDismissedButton';
import { PraiseInlineButtons } from './PraiseInlineButtons';
import Praise from '@/components/praise/Praise';
import { dismissed, duplicate } from '@/utils/praise';
import { ActiveUserId } from '@/model/auth';

interface Props {
  periodId: string;
  receiverId: string;
  key: string;
}

const QuantifyTable = ({ periodId, receiverId }: Props): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);
  const data = useRecoilValue(
    PeriodQuantifierReceiverPraise({ periodId, receiverId })
  );
  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;
  const { quantify } = useQuantifyPraise();

  const [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] =
    React.useState(false);
  const [isDuplicateSearchDialogOpen, setIsDuplicateSearchDialogOpen] =
    React.useState(false);
  const [duplicateSearchDialogPraise, setDuplicateSearchDialogPraise] =
    React.useState<PraiseDto | undefined>(undefined);
  const [selectedPraises, setSelectedPraises] = React.useState<PraiseDto[]>([]);

  if (!data) return null;
  if (!userId) return null;

  const handleDismiss = (): void => {
    if (selectedPraises.length > 0) {
      selectedPraises.forEach((praise: PraiseDto) => {
        void quantify(praise._id, 0, true, null);
      });

      setSelectedPraises([]);
    }
  };

  const handleDuplicate = (originalScore: number): void => {
    if (selectedPraises.length >= 2) {
      const originalPraise = selectedPraises[0];
      void quantify(originalPraise._id, originalScore, false, null);

      selectedPraises.slice(1).forEach((praise: PraiseDto) => {
        void quantify(praise._id, 0, false, originalPraise._id);
      });

      setSelectedPraises([]);
    }
  };

  const handleSetScore = (praise: PraiseDto, score: number): void => {
    void quantify(praise._id, score, false, null);
  };

  const handleDuplicateSearchPraise = (originalPraiseId: string): void => {
    if (!duplicateSearchDialogPraise) return;

    void quantify(duplicateSearchDialogPraise._id, 0, false, originalPraiseId);
    setDuplicateSearchDialogPraise(undefined);
  };

  const handleToggleCheckbox = (praise: PraiseDto): void => {
    if (selectedPraises.includes(praise)) {
      const newSelectedPraiseIds = selectedPraises.filter(
        (p) => p._id !== praise._id
      );

      setSelectedPraises(newSelectedPraiseIds);
    } else {
      setSelectedPraises(
        sortBy([...selectedPraises, praise], (p) => p.createdAt)
      );
    }
  };

  const weeklyData = groupBy(
    sortBy(data, (p) => p.createdAt),
    (praise: PraiseDto) => {
      if (!praise) return 0;
      return getWeek(parseISO(praise.createdAt), { weekStartsOn: 1 });
    }
  );

  return (
    <div className=" h-full">
      <div className="p-5 relative space-x-6 bg-gray-200 z-10 w-full rounded-t border-t border-l border-r sticky top-0">
        <MarkDismissedButton
          disabled={selectedPraises.length < 1}
          onClick={(): void => setIsDismissDialogOpen(true)}
        />
        <MarkDuplicateButton
          disabled={selectedPraises.length < 2}
          onClick={(): void => setIsDuplicateDialogOpen(true)}
        />
      </div>

      <div className="praise-box overflow-x-auto rounded-t-none">
        <table className="w-full table-auto">
          <tbody>
            {Object.keys(weeklyData).map((weekKey, index) => (
              <>
                {index !== 0 && index !== data.length - 1 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="border-t border-2 border-gray-400 my-4" />
                    </td>
                  </tr>
                )}

                {weeklyData[weekKey].map((praise, index) => (
                  <tr className="group" key={index}>
                    <td>
                      <input
                        type="checkbox"
                        className="mr-4 text-xl w-5 h-5"
                        checked={selectedPraises.includes(praise)}
                        onChange={(): void => handleToggleCheckbox(praise)}
                      />
                    </td>
                    <td>
                      <Praise
                        praise={praise}
                        showIdPrefix={true}
                        showReceiver={false}
                        periodId={periodId}
                        usePseudonyms={usePseudonyms}
                        contentPrefixChildren={PraiseInlineButtons({ praise })}
                      />
                    </td>
                    <td>
                      <QuantifySlider
                        praise={praise}
                        periodId={periodId}
                        disabled={
                          dismissed(praise, userId) || duplicate(praise, userId)
                        }
                        onChange={(newScore): void =>
                          handleSetScore(praise, newScore)
                        }
                      />
                    </td>
                    <td>
                      <div className="w-3">
                        <button
                          className="hidden group-hover:block text-gray-400 hover:text-gray-500 cursor-pointer"
                          disabled={duplicate(praise, userId)}
                          onClick={(): void => {
                            setDuplicateSearchDialogPraise(praise);
                            setIsDuplicateSearchDialogOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faCopy} size="1x" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
        <QuantifyBackNextLink periodId={periodId} receiverId={receiverId} />
      </div>

      <DismissDialog
        open={isDismissDialogOpen}
        onClose={(): void => setIsDismissDialogOpen(false)}
        praises={selectedPraises}
        onConfirm={(): void => handleDismiss()}
      />
      <DuplicateDialog
        open={isDuplicateDialogOpen}
        originalPraise={selectedPraises[0]}
        duplicatesCount={selectedPraises.length}
        onClose={(): void => setIsDuplicateDialogOpen(false)}
        onConfirm={(originalScore): void => handleDuplicate(originalScore)}
      />
      <DuplicateSearchDialog
        open={isDuplicateSearchDialogOpen}
        selectedPraise={duplicateSearchDialogPraise}
        onClose={(): void => setIsDuplicateSearchDialogOpen(false)}
        onConfirm={(praiseId: string): void =>
          handleDuplicateSearchPraise(praiseId)
        }
      />
    </div>
  );
};

export default QuantifyTable;
