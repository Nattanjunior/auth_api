import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  create(createPostDto: CreatePostDto & { authorId: string }) {
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
    return this.prisma.post.findMany();
  }

  findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id }
    });
  }

  update(id: string, updatePostDto: UpdatePostDto) {
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
