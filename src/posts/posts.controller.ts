import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

import { User } from '@prisma/client';
import { Post as PostEntity } from './entities/post.entity';

interface RequestWithUser extends Request {
  user?: User;
}
import { RequiredRoles } from 'src/auth/required-roles.decorator';
import { RoleGuard } from 'src/auth/role/role.guard';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @RequiredRoles('WRITER', 'EDITOR')
  @Post()
  @ApiOperation({ 
    summary: 'Create a post',
    description: 'Cria um novo post. Requer role WRITER ou EDITOR.'
  })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão (role WRITER ou EDITOR necessária)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  create(@Body() createPostDto: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.create({
      ...createPostDto,
      authorId: req.user!.id
    }, req.user!);
  }

  @RequiredRoles('WRITER', 'EDITOR', 'READER')
  @Get()
  @ApiOperation({ 
    summary: 'Get all posts',
    description: 'Lista todos os posts acessíveis ao usuário. Requer role READER, WRITER ou EDITOR.'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts fetched successfully',
    type: [PostEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão (role READER, WRITER ou EDITOR necessária)'
  })
  findAll(@Req() req: RequestWithUser) {
    return this.postsService.findAll(req.user!);
  }

  @RequiredRoles('WRITER', 'EDITOR', 'READER')
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a post by id',
    description: 'Busca um post específico por ID. Requer role READER, WRITER ou EDITOR.'
  })
  @ApiResponse({
    status: 200,
    description: 'Post fetched successfully',
    type: PostEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão ou post não acessível'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.postsService.findOne(id, req.user!);
  }

  @RequiredRoles('WRITER', 'EDITOR')
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a post by id',
    description: 'Atualiza um post existente. Requer role WRITER ou EDITOR e ser o autor do post.'
  })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão ou não é o autor do post'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.update(id, updatePostDto, req.user!);
  }

  @RequiredRoles('ADMIN')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a post by id',
    description: 'Deleta um post permanentemente. Requer role ADMIN.'
  })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    type: PostEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou não fornecido'
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão (role ADMIN necessária)'
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado'
  })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.postsService.remove(id, req.user!);
  }
}
