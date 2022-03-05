import { PeriodPageParams, useVerifyQuantifierPoolSize } from '@/model/periods';
import {
  faCheckSquare,
  faTimes,
  faTimesCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

interface PeriodAssignDialogProps {
  onClose(): void;
  onAssign(): void;
}

const DialogMessage = ({
  onClose,
  onAssign,
}: PeriodAssignDialogProps): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const { location } = useHistory();
  const poolRequirements = useVerifyQuantifierPoolSize(periodId, location.key);

  const quantPoolBigEnough = poolRequirements
    ? poolRequirements.quantifierPoolDeficitSize === 0
    : false;

  return (
    <>
      <div className="text-center mb-7">
        <div className="mb-3">
          The quantifier pool has{' '}
          {poolRequirements ? poolRequirements.quantifierPoolSize : '#'}{' '}
          members.
        </div>
        <div>
          {quantPoolBigEnough ? (
            <>
              <div className="mb-3">
                No of members that will be assigned to this quantification:{' '}
                {poolRequirements
                  ? poolRequirements.quantifierPoolSizeNeeded
                  : '#'}
              </div>
              <div className="mb-3">
                <FontAwesomeIcon className="text-green" icon={faCheckSquare} />{' '}
                Quantifier pool requirements are met.
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                Additional members needed for quantification:{' '}
                {poolRequirements
                  ? poolRequirements.quantifierPoolDeficitSize
                  : '#'}
              </div>
              <div className="mb-3">
                <FontAwesomeIcon className="text-green" icon={faTimesCircle} />{' '}
                Quantifier pool requirements are not met.
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        {quantPoolBigEnough ? (
          <button
            className="mt-4 praise-button"
            onClick={(): void => {
              onAssign();
              onClose();
            }}
          >
            Assign
          </button>
        ) : (
          <button
            className="mt-4 praise-button"
            onClick={(): void => {
              onClose();
            }}
          >
            Close
          </button>
        )}
      </div>
    </>
  );
};

const PeriodAssignDialog = ({
  onClose,
  onAssign,
}: PeriodAssignDialogProps): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-gray-800 opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Assign quantifiers
          </Dialog.Title>
          <React.Suspense fallback="Loading…">
            <DialogMessage onAssign={onAssign} onClose={onClose} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default PeriodAssignDialog;
