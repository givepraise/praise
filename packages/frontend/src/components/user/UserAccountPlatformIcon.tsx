import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserAccount } from '../../model/useraccount/dto/user-account.dto';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

export const UserAccountPlatformIcon = (props: {
  userAccount: UserAccount;
}): JSX.Element | null => {
  const { userAccount } = props;
  if (!userAccount) return null;
  if (userAccount.platform === 'DISCORD') {
    return <FontAwesomeIcon icon={faDiscord} size="1x" />;
  }
  return <FontAwesomeIcon icon={faGlobe} size="1x" />;
};
