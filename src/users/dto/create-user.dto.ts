import type { Roles } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;
  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password: string;
  @ApiProperty({
    description: 'The role of the user',
    example: 'admin',
  })
  role: Roles;
  @ApiProperty({
    description: 'The permissions of the user',
    example: ['read', 'write'],
  })
  permissions?: PrismaJson.PermissionList;
}
