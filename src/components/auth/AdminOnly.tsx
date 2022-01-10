import { HasRole, ROLE_ADMIN } from "@/model/auth";
import { useRecoilValue } from "recoil";

const AdminOnly: React.FC<any> = ({ children }) => {
  const hasRole = useRecoilValue(HasRole(ROLE_ADMIN));
  if (!hasRole) return null;
  return children;
};

export default AdminOnly;
