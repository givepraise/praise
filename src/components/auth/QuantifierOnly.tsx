import { useAuthRecoilValue } from "@/store/api";
import { HasRole, ROLE_QUANTIFIER } from "@/store/auth";

const QuantifierOnly: React.FC<any> = ({ children }) => {
  const isAdmin = useAuthRecoilValue(HasRole(ROLE_QUANTIFIER));
  if (!isAdmin) return null;
  return children;
};

export default QuantifierOnly;
