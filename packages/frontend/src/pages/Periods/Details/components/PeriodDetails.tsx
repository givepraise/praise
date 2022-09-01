import { faTimesCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Button } from '@/components/ui/Button';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  AllPeriods,
  PeriodPageParams,
  SinglePeriod,
  useAssignQuantifiers,
  useClosePeriod,
  useExportPraise,
  useExportSummaryPraise,
  useLoadSinglePeriodDetails,
} from '@/model/periods';
import { AllQuantifierUsers } from '@/model/users';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import { saveLocalFile } from '@/utils/file';
import { getPreviousPeriod } from '@/utils/periods';

import { ISelectedItem, SelectInput } from '@/components/form/SelectInput';
import { SingleSetting } from '@/model/settings';
import { PeriodAssignDialog } from './AssignDialog';
import { PeriodCloseDialog } from './CloseDialog';
import { PeriodDateForm } from './PeriodDateForm';
import { PeriodCustomExportDialog } from './CustomExportDialog';

export const PeriodDetails = (): JSX.Element | null => {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [isCustomExportDialogOpen, setIsCustomExportDialogOpen] =
    React.useState(false);

  const allPeriods = useRecoilValue(AllPeriods);
  const allQuantifiers = useRecoilValue(AllQuantifierUsers);
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { exportPraise } = useExportPraise();
  const { exportSummaryPraise } = useExportSummaryPraise();
  const customExportFormat = useRecoilValue(
    SingleSetting('CUSTOM_EXPORT_CSV_FORMAT')
  );

  const history = useHistory();

  const assignDialogRef = React.useRef(null);
  const closeDialogRef = React.useRef(null);
  const customExportDialogRef = React.useRef(null);

  const { closePeriod } = useClosePeriod();
  const { assignQuantifiers } = useAssignQuantifiers(periodId);

  if (!period || !allPeriods) return null;

  const previousPeriod = getPreviousPeriod(allPeriods, period);

  const exportOptions = [
    { value: '', label: 'Export', disabled: true },
    { value: 'export-full', label: 'Export (full)' },
    {
      value: 'export-summary',
      label: 'Export (summary)',
    },
    {
      value: 'aragon',
      label: 'Aragon Token Distribution',
    },
  ];

  const handleClosePeriod = (): void => {
    void closePeriod(periodId);
  };

  const handleAssign = (): void => {
    const promise = assignQuantifiers();
    void toast.promise(
      promise,
      {
        loading: 'Assigning quantifiers …',
        success: 'Quantifiers assigned',
        error: 'Assign failed',
      },
      {
        position: 'top-center',
        loading: {
          duration: Infinity,
        },
      }
    );
    promise.finally(() => setTimeout(() => history.go(0), 1000));
  };

  const handleExport = (): void => {
    const toastId = 'exportToast';
    void toast.promise(
      exportPraise(period),
      {
        loading: 'Exporting …',
        success: (exportData: Blob | undefined) => {
          if (exportData) {
            saveLocalFile(exportData, 'quantification-export.csv');
            setTimeout(() => toast.remove(toastId), 2000);
            return 'Export done';
          }
          return 'Empty export returned';
        },
        error: 'Export failed',
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: 1000,
        },
      }
    );
  };

  const handleDistribution = (
    exportContext: string,
    supportPercentage: boolean
  ): void => {
    const toastId = 'distributeToast';
    void toast.promise(
      exportSummaryPraise(period, exportContext, supportPercentage),
      {
        loading: 'Distributing …',
        success: (data: Blob | undefined) => {
          if (data) {
            saveLocalFile(
              data,
              `summary-export.${customExportFormat?.valueRealized}`
            );
            setTimeout(() => toast.remove(toastId), 2000);
            return 'Export done';
          }

          return 'Empty export returned';
        },
        error: 'Distribution failed',
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: 1000,
        },
      }
    );
  };

  const handleSelectExportChange = (option: ISelectedItem): void => {
    if (option.value === 'export-full') {
      handleExport();
    } else if (option.value === 'export-summary') {
      handleExport();
    } else if (option.value === 'aragon') {
      setIsCustomExportDialogOpen(true);
    }
  };

  if (!period) return <div>Period not found.</div>;

  return (
    <div>
      <div>
        <span className="pr-2">Period start:</span>
        {previousPeriod
          ? formatIsoDateUTC(previousPeriod.endDate, DATE_FORMAT)
          : 'Dawn of time'}
      </div>
      {!isAdmin ? (
        <div>Period end: {formatIsoDateUTC(period.endDate)}</div>
      ) : (
        <>
          <PeriodDateForm />
          <div className="mt-5">
            {period.status === 'OPEN' || period.status === 'QUANTIFY' ? (
              <div className="flex justify-between gap-4">
                {period.status === 'OPEN' &&
                period.receivers &&
                period?.receivers.length > 0 &&
                allQuantifiers &&
                allQuantifiers.length > 0 ? (
                  <Button
                    onClick={(): void => {
                      setIsAssignDialogOpen(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      size="1x"
                      className="mr-2"
                    />
                    Assign quantifiers
                  </Button>
                ) : null}
                {period.status === 'QUANTIFY' ? (
                  <div className="w-3/12">
                    <SelectInput
                      handleChange={handleSelectExportChange}
                      options={exportOptions}
                      selected={exportOptions[0]}
                    />
                  </div>
                ) : null}
                <Button
                  variant={'outline'}
                  onClick={(): void => setIsCloseDialogOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="1x"
                    className="mr-2"
                  />
                  Close period
                </Button>
              </div>
            ) : null}

            {period.status === 'CLOSED' ? (
              <div className="w-3/12">
                <SelectInput
                  handleChange={handleSelectExportChange}
                  options={exportOptions}
                  selected={exportOptions[0]}
                />
              </div>
            ) : null}
          </div>
        </>
      )}

      <Dialog
        open={isCloseDialogOpen}
        onClose={(): void => setIsCloseDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={closeDialogRef}
      >
        <div ref={closeDialogRef}>
          <PeriodCloseDialog
            onClose={(): void => setIsCloseDialogOpen(false)}
            onRemove={(): void => handleClosePeriod()}
          />
        </div>
      </Dialog>

      {period.status === 'OPEN' && isAdmin ? (
        <Dialog
          open={isAssignDialogOpen}
          onClose={(): void => setIsAssignDialogOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={assignDialogRef}
        >
          <div ref={assignDialogRef}>
            <PeriodAssignDialog
              onClose={(): void => setIsAssignDialogOpen(false)}
              onAssign={(): void => handleAssign()}
            />
          </div>
        </Dialog>
      ) : null}

      <Dialog
        open={isCustomExportDialogOpen}
        onClose={(): void => setIsCustomExportDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={customExportDialogRef}
      >
        <div ref={customExportDialogRef}>
          <PeriodCustomExportDialog
            title="Aragon token distribution"
            onClose={(): void => setIsCustomExportDialogOpen(false)}
            onExport={(exportContext, supportPercentage): void =>
              handleDistribution(exportContext, supportPercentage)
            }
          />
        </div>
      </Dialog>
    </div>
  );
};
