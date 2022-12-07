import { Permission } from './enums/permission.enum';

export const RolePermissions: { [key: string]: string[] } = {
  ADMIN: [Permission.UsersFind, Permission.UsersManageRoles],
  USER: [Permission.UsersFind],
};
