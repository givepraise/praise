import { useAuthRecoilValue } from "@/store/api";
import { HasRole, ROLE_ADMIN } from "@/store/auth";

const AdminOnly: React.FC<any> = ({ children }) => {
  const isAdmin = useAuthRecoilValue(HasRole(ROLE_ADMIN));
  if (!isAdmin) return null;
  return children;
};

export default AdminOnly;
