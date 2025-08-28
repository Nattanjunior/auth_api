  import type { Roles } from "@prisma/client";
  import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
  import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';

  // Tipo para permissões customizadas
  type PermissionList = Array<{
    action: string;
    resource: string;
    condition?: Record<string, any>;
  }>;

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome do usuário',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha do usuário',
    example: 'password123',
    minLength: 6,
    maxLength: 128
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsOptional()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Função do usuário',
    example: 'ADMIN',
    enum: ['ADMIN', 'EDITOR', 'WRITER', 'READER']
  })
  @IsEnum(['ADMIN', 'EDITOR', 'WRITER', 'READER'], { message: 'Role deve ser ADMIN, EDITOR, WRITER ou READER' })
  @IsOptional()
  role?: Roles;
}