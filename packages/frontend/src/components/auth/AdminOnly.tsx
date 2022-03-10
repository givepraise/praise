import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { useRecoilValue } from 'recoil';

interface AdminOnlyProps {
  children: JSX.Element;
}
const AdminOnly = ({ children }: AdminOnlyProps): JSX.Element | null => {
  const hasRole = useRecoilValue(HasRole(ROLE_ADMIN));
  if (!hasRole) return null;
  return children;
};

export default AdminOnly;
