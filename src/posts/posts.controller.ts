import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { RequiredRoles } from 'src/auth/required-roles.decorator';
import { Roles } from '@prisma/client';
import { RoleGuard } from 'src/auth/role/role.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard, RoleGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @RequiredRoles(Roles.WRITER, Roles.EDITOR)
  @Post()
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: Post,
  })
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    return this.postsService.create({
      ...createPostDto,
      authorId: req.user!.id
    });
  }

  @RequiredRoles(Roles.WRITER, Roles.EDITOR, Roles.READER)
  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'Posts fetched successfully',
    type: [Post],
  })
  findAll() {
    return this.postsService.findAll();
  }

  @RequiredRoles(Roles.WRITER, Roles.EDITOR, Roles.READER)
  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiResponse({
    status: 200,
    description: 'Post fetched successfully',
    type: Post,
  })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @RequiredRoles(Roles.WRITER, Roles.EDITOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a post by id' })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: Post,
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @RequiredRoles(Roles.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by id' })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    type: Post,
  })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
