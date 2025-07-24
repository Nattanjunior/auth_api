import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslService } from 'src/casl/casl.service';
import { accessibleBy } from '@casl/prisma';
import { User } from '@prisma/client';
import { subject } from '@casl/ability';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslService
  ) { }

  create(createPostDto: CreatePostDto & { authorId: string }, user: User) {
    const ability = this.abilityService.createForUser(user);

    if (!ability.can('create', 'Post')) {
      throw new Error('Unauthorized')
    }

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        published: createPostDto.published,
        author: {
          connect: { id: createPostDto.authorId }
        }
      },
    });
  }

  findAll(user: User) {
    const ability = this.abilityService.createForUser(user);
    return this.prisma.post.findMany({
      where: {
        AND: [accessibleBy(ability, 'read').Post],
      }
    });
  }

  findOne(id: string, user: User) {
    const ability = this.abilityService.createForUser(user);
    
    if (!ability.can('read', 'Post')) {
      throw new Error('Unauthorized');
    }

    return this.prisma.post.findUnique({
      where: {
        id,
        AND: [accessibleBy(ability, 'read').Post],
      }
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User) {
    const ability = this.abilityService.createForUser(user);

    const post = await this.prisma.post.findUnique({
      where: {
        id,
        AND: [accessibleBy(ability, 'read').Post],
      }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (!ability.can('update', subject('Post', post))) {
      throw new Error('Unauthorized to update this post');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto
    });
  }

  async remove(id: string, user: User) {
    const ability = this.abilityService.createForUser(user);

    const post = await this.prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (!ability.can('delete', subject('Post', post))) {
      throw new Error('Unauthorized to delete this post');
    }

    return this.prisma.post.delete({
      where: { id }
    });
  }
}
