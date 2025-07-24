import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Título do post',
    example: 'Meu primeiro post',
    minLength: 3,
    maxLength: 200
  })
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Conteúdo do post',
    example: 'Este é o conteúdo do meu primeiro post',
    minLength: 10,
    maxLength: 5000
  })
  @IsString({ message: 'Conteúdo deve ser uma string' })
  @IsNotEmpty({ message: 'Conteúdo é obrigatório' })
  @MinLength(10, { message: 'Conteúdo deve ter pelo menos 10 caracteres' })
  @MaxLength(5000, { message: 'Conteúdo deve ter no máximo 5000 caracteres' })
  content: string;

  @ApiProperty({
    description: 'Se o post está publicado',
    example: true,
    default: false
  })
  @IsBoolean({ message: 'Published deve ser um valor booleano' })
  @IsOptional()
  published?: boolean = false;

  // ✅ OCULTO DO SWAGGER - será preenchido automaticamente pelo controller
  @IsOptional()
  authorId?: string;
}
