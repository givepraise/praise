import { HasRole, ROLE_QUANTIFIER } from '@/model/auth';
import { useRecoilValue } from 'recoil';

const QuantifierOnly: React.FC<any> = ({ children }) => {
  const hasRole = useRecoilValue(HasRole(ROLE_QUANTIFIER));
  if (!hasRole) return null;
  return children;
};

export default QuantifierOnly;
