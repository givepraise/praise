import ScrollableDialog from '@/components/ScrollableDialog';
import {
  faTimes,
  faArrowRightArrowLeft,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '@/components/IconButton';
import { useState } from 'react';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import SelectUserRadioGroup from '@/components/user/SelectUserRadioGroup';

interface Props {
  onClose(): void;
  onConfirm(newQuantifierId: string): void;
  open: boolean;
  selectedUserId: string | undefined;
  availableUserIds: string[];
}

const ReplaceQuantifierDialog = ({
  onClose,
  onConfirm,
  open = false,
  selectedUserId,
  availableUserIds,
}: Props): JSX.Element | null => {
  const [replacementUserId, setReplacementUserId] = useState<
    string | undefined
  >(undefined);

  const availableQuantifiers = [{ _id: 1 }, { _id: 2 }];

  if (!selectedUserId) return null;
  if (!availableUserIds) return null;

  const resetAndClose = (): void => {
    setReplacementUserId(undefined);
    onClose();
  };

  return (
    <ScrollableDialog open={open} onClose={resetAndClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={resetAndClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faArrowRightArrowLeft} size="2x" />
          </div>
          <h2 className="text-center">Replace Quantifier</h2>
          <div className="text-center">
            <UserAvatarAndName userId={selectedUserId} />
          </div>
          <div className="text-center px-12">
            <FontAwesomeIcon
              icon={faWarning}
              size="1x"
              className="text-yellow-500"
            />{' '}
            Please note that any quantifications already made by this user will
            be deleted.
          </div>

          {availableQuantifiers.length === 0 ? (
            <div className="text-center">
              There are no quantifiers available.
            </div>
          ) : (
            <>
              <div>
                <SelectUserRadioGroup
                  userIds={availableUserIds}
                  value={replacementUserId}
                  onSelect={setReplacementUserId}
                />
              </div>
              <div className="flex justify-center">
                <IconButton
                  icon={faArrowRightArrowLeft}
                  disabled={replacementUserId === undefined}
                  text="Replace"
                  onClick={(): void => {
                    if (!replacementUserId) return;

                    onConfirm(replacementUserId);
                    onClose();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollableDialog>
  );
};

export default ReplaceQuantifierDialog;
