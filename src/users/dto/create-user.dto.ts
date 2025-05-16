import type { Roles } from "@prisma/client";

// data transfer object
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Roles;
  permissions?: PrismaJson.PermissionList
}
