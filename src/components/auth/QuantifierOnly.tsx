import { HasRole, ROLE_QUANTIFIER } from "@/store/auth";
import { useRecoilValue } from "recoil";

const QuantifierOnly: React.FC<any> = ({ children }) => {
  const isAdmin = useRecoilValue(HasRole(ROLE_QUANTIFIER));
  if (!isAdmin) return null;
  return children;
};

export default QuantifierOnly;
