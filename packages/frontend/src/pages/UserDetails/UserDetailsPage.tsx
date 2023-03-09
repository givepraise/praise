import {
  faUser,
  faPrayingHands,
  faHandHoldingHeart,
} from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import {
  SingleUser,
  SingleUserParams,
  useLoadSingleUserDetails,
  useUserProfile,
} from '@/model/user/users';
import { BackLink } from '@/navigation/BackLink';
import { isResponseOk } from '@/model/api';
import { UserInfo } from './components/UserInfo';
import {
  userAccountTypeNumber,
  ReceivedGivenPraiseTable,
} from './components/ReceivedGivenPraiseTable';
import { EditProfileDialog } from './components/EditProfileDialog';
import { UpdateUserRequestDto } from '@/model/user/dto/update-user-request.dto';

const UserDetailsPage = (): JSX.Element | null => {
  const dialogRef = React.useRef(null);
  const { userId } = useParams<SingleUserParams>();
  const { update } = useUserProfile();

  useLoadSingleUserDetails(userId);
  const user = useRecoilValue(SingleUser(userId));

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const pageViews = {
    receivedPraiseView: 1,
    givenPraiseView: 2,
  };

  const [view, setView] = useState<number>(pageViews.receivedPraiseView);

  if (!user) return null;

  const handleSaveUserProfile = async (
    values: UpdateUserRequestDto
  ): Promise<void> => {
    const { username, rewardsEthAddress } = values;
    const response = await update(user._id, username, rewardsEthAddress);

    if (isResponseOk(response)) {
      toast.success('User profile saved');
    } else {
      toast.error('Profile update failed');
    }

    setIsDialogOpen(false);
  };

  return (
    <Page>
      <BreadCrumb name="Profile" icon={faUser} />
      <BackLink />

      <UserInfo
        user={user}
        isDialogOpen={(value): void => setIsDialogOpen(value)}
      />

      <div className="flex mt-5 mb-5 ml-4 md:ml-0">
        <Button
          variant={'outline'}
          className={`rounded-r-none  ${
            view === pageViews.givenPraiseView
              ? 'bg-opacity-50 text-opacity-50 hover:border-themecolor-4'
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.receivedPraiseView)}
        >
          <FontAwesomeIcon icon={faPrayingHands} size="1x" className="mr-2" />
          Received praise
        </Button>
        <Button
          variant={'outline'}
          className={`rounded-l-none  ${
            view === pageViews.receivedPraiseView
              ? 'bg-opacity-50  text-opacity-50 hover:border-themecolor-4 '
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.givenPraiseView)}
        >
          <FontAwesomeIcon
            icon={faHandHoldingHeart}
            size="1x"
            className="mr-2"
          />
          Given praise
        </Button>
      </div>

      <Box className="px-0">
        <React.Suspense fallback={null}>
          <ReceivedGivenPraiseTable
            userAccountType={view as userAccountTypeNumber}
            user={user}
          />
        </React.Suspense>
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={(): void => setIsDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={dialogRef}
      >
        <div ref={dialogRef}>
          <EditProfileDialog
            onClose={(): void => setIsDialogOpen(false)}
            onSave={(values): void => void handleSaveUserProfile(values)}
            user={user}
          />
        </div>
      </Dialog>
    </Page>
  );
};

export default UserDetailsPage;
