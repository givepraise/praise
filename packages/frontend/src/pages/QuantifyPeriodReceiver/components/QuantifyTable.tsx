import { PraiseDto } from 'api/dist/praise/types';
import { PeriodQuantifierReceiverPraise } from '@/model/periods';
import { useQuantifyMultiplePraise, useQuantifyPraise } from '@/model/praise';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import getWeek from 'date-fns/getWeek';
import parseISO from 'date-fns/parseISO';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { QuantifyBackNextLink } from './BackNextLink';
import DismissDialog from './DismissDialog';
import DuplicateDialog from './DuplicateDialog';
import DuplicateSearchDialog from './DuplicateSearchDialog';
import MarkDuplicateButton from './MarkDuplicateButton';
import MarkDismissedButton from './MarkDismissedButton';
import QuantifyPraiseRow from './QuantifyPraiseRow';
import SearchInput from '@/components/form/SearchInput';
import PraiseMultipleDialog from '@/pages/QuantifyPeriodReceiver/components/PraiseMultipleDialog';
import PraiseMultipleButton from '@/pages/QuantifyPeriodReceiver/components/PraiseMultipleButton';

interface Props {
  periodId: string;
  receiverId: string;
  key: string;
}

const QuantifyTable = ({ periodId, receiverId }: Props): JSX.Element | null => {
  const [searchValue, setSearchValue] = React.useState<string | undefined>(
    undefined
  );

  const data = useRecoilValue(
    PeriodQuantifierReceiverPraise({ periodId, receiverId })
  );
  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;
  const { quantify } = useQuantifyPraise();
  const { quantifyMultiple } = useQuantifyMultiplePraise();

  const [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] =
    React.useState(false);
  const [isDuplicateSearchDialogOpen, setIsDuplicateSearchDialogOpen] =
    React.useState(false);
  const [isPraiseMultipleDialogOpen, setIsPraiseMultipleDialogOpen] =
    React.useState(false);
  const [duplicateSearchDialogPraise, setDuplicateSearchDialogPraise] =
    React.useState<PraiseDto | undefined>(undefined);
  const [selectedPraises, setSelectedPraises] = React.useState<PraiseDto[]>([]);
  const [selectAllChecked, setSelectAllChecked] =
    React.useState<boolean>(false);

  const allowedValues = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_ALLOWED_VALUES'
  ) as number[];

  const applyFilter = React.useCallback(
    (data: PraiseDto[] | undefined): PraiseDto[] => {
      if (!data) return [];
      if (!searchValue) return data;

      const filteredData = data.filter((praise: PraiseDto) => {
        return praise.reasonRealized.includes(searchValue);
      });

      return filteredData;
    },
    [searchValue]
  );

  if (!data) return null;

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

  const handleSetMultipleScore = (
    score: number,
    selectedPraises: PraiseDto[]
  ): void => {
    const praiseIds = selectedPraises.map((praise) => praise._id);

    void quantifyMultiple(score, praiseIds);
    setSelectedPraises([]);
  };

  const handleDuplicateSearchPraise = (originalPraiseId: string): void => {
    if (!duplicateSearchDialogPraise) return;

    void quantify(duplicateSearchDialogPraise._id, 0, false, originalPraiseId);
    setDuplicateSearchDialogPraise(undefined);
  };

  const handleToggleCheckbox = (praise: PraiseDto): void => {
    setSelectAllChecked(false);

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

  const handleToggleSelectAll = (): void => {
    setSelectAllChecked(!selectAllChecked);

    if (selectAllChecked) {
      setSelectedPraises([]);
    } else {
      setSelectedPraises(applyFilter(data));
    }
  };

  const handleSearchInput = (searchValue: string): void => {
    setSearchValue(searchValue);
    setSelectedPraises([]);
  };

  const weeklyData = groupBy(
    sortBy(applyFilter(data), (p) => p.createdAt),
    (praise: PraiseDto) => {
      if (!praise) return 0;
      return getWeek(parseISO(praise.createdAt), { weekStartsOn: 1 });
    }
  );

  const isChecked = (praise: PraiseDto): boolean => {
    return selectedPraises.map((p) => p._id).includes(praise._id);
  };

  return (
    <div>
      <div className="flex sticky z-10 w-full p-5 border-t border-l border-r top-14 lg:top-0 rounded-t-xl bg-warm-gray-100 dark:bg-slate-700">
        <div className="mr-4">
          <MarkDuplicateButton
            disabled={selectedPraises.length < 2}
            onClick={(): void => setIsDuplicateDialogOpen(true)}
          />
        </div>

        <div className="mr-4">
          <MarkDismissedButton
            disabled={selectedPraises.length < 1}
            onClick={(): void => setIsDismissDialogOpen(true)}
          />
        </div>

        <div>
          <PraiseMultipleButton
            disabled={selectedPraises.length < 1}
            onClick={(): void => setIsPraiseMultipleDialogOpen(true)}
          />
        </div>

        <div className="w-22 ml-auto h-8">
          <SearchInput
            handleChange={(e): void => handleSearchInput(e)}
            placeholder="Filter"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-t-none praise-box-wide">
        <table className="w-full table-auto">
          <tbody>
            <tr>
              <td colSpan={2} className="pb-4">
                <input
                  type="checkbox"
                  onChange={handleToggleSelectAll}
                  checked={selectAllChecked}
                />
                <span className="ml-4">Select All</span>
              </td>
            </tr>
            <tr>
              <td colSpan={5}>
                <div className="mb-5 border-2 border-t border-warm-gray-400" />
              </td>
            </tr>

            {Object.keys(weeklyData).map((weekKey, index) => (
              <React.Fragment key={index}>
                {index !== 0 && index !== data.length - 1 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="mb-5 border-2 border-t border-warm-gray-400" />
                    </td>
                  </tr>
                )}

                {weeklyData[weekKey].map((praise) => (
                  <QuantifyPraiseRow
                    key={praise._id}
                    praise={praise}
                    periodId={periodId}
                    usePseudonyms={usePseudonyms}
                    allowedValues={allowedValues}
                    checked={isChecked(praise)}
                    onToggleCheck={(): void => handleToggleCheckbox(praise)}
                    onSetScore={(score): void => handleSetScore(praise, score)}
                    onDuplicateClick={(): void => {
                      setDuplicateSearchDialogPraise(praise);
                      setIsDuplicateSearchDialogOpen(true);
                    }}
                  />
                ))}
              </React.Fragment>
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
      <PraiseMultipleDialog
        open={isPraiseMultipleDialogOpen}
        onClose={(): void => setIsPraiseMultipleDialogOpen(false)}
        selectedPraises={selectedPraises}
        allowedValues={allowedValues}
        onSetScore={(score, selectedPraises): void =>
          handleSetMultipleScore(score, selectedPraises)
        }
      />
    </div>
  );
};

export default QuantifyTable;
