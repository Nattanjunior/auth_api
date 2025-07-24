import type { Roles } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';

// Tipo para permissões customizadas
type PermissionList = Array<{
  action: string;
  resource: string;
  condition?: Record<string, any>;
}>;

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
    minLength: 6,
    maxLength: 128
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password: string;

  // ✅ OCULTO DO SWAGGER - sempre será ADMIN por padrão
  @IsEnum(['ADMIN', 'EDITOR', 'WRITER', 'READER'], { message: 'Role deve ser ADMIN, EDITOR, WRITER ou READER' })
  @IsOptional()
  role?: Roles;

  // ✅ OCULTO DO SWAGGER - será ignorado por segurança
  @IsOptional()
  permissions?: PermissionList;
}
