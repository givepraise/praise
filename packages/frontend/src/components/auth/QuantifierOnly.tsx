import { HasRole, ROLE_QUANTIFIER } from '@/model/auth';
import { useRecoilValue } from 'recoil';

interface QuantifierOnlyProps {
  children: JSX.Element;
}
const QuantifierOnly = ({
  children,
}: QuantifierOnlyProps): JSX.Element | null => {
  const hasRole = useRecoilValue(HasRole(ROLE_QUANTIFIER));
  if (!hasRole) return null;
  return children;
};

export default QuantifierOnly;
