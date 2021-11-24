import { HasRole, ROLE_ADMIN } from "@/model/auth";
import { useRecoilValue } from "recoil";

const AdminOnly: React.FC<any> = ({ children }) => {
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  if (!isAdmin) return null;
  return children;
};

export default AdminOnly;
