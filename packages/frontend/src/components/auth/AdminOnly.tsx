import { useRecoilValue } from 'recoil';

import { HasRole, ROLE_ADMIN } from '@/model/auth';

interface AdminOnlyProps {
  children: JSX.Element;
}

export const AdminOnly = ({ children }: AdminOnlyProps): JSX.Element | null => {
  const hasRole = useRecoilValue(HasRole(ROLE_ADMIN));
  if (!hasRole) return null;
  return children;
};
