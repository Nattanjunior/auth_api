import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CaslService } from 'src/casl/casl.service';
import { accessibleBy } from '@casl/prisma';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslService
  ) { }

  create(createPostDto: CreatePostDto & { authorId: string }) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Post')) {
      throw new Error('Unauthorized')
    }


    return this.prisma.post.create({
      data: {
        ...createPostDto,
        author: {
          connect: { id: createPostDto.authorId }
        }
      },
    });
  }

  findAll() {
    const ability = this.abilityService.ability;
    return this.prisma.post.findMany({
      where: {
        AND: [accessibleBy(ability, 'read').Post],
      }
    });
  }

  findOne(id: string) {
    const ability = this.abilityService.ability;
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

  async update(id: string, updatePostDto: UpdatePostDto) {
    const ability = this.abilityService.ability;

    const post = await this.prisma.post.findUnique({
      where: {
        id,
        AND: [accessibleBy(ability, 'read').Post],
      }
    });

    if(!post){
      throw new Error('Post not found');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto
    });
  }

  remove(id: string) {
    return this.prisma.post.delete({
      where: { id }
    });
  }
}
