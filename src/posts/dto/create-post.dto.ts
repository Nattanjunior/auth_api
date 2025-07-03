import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({
    description: 'The title of the post',
    example: 'My first post',
  })
  title: string;
  @ApiProperty({
    description: 'The content of the post',
    example: 'This is the content of my first post',
  })
  content: string;
  @ApiProperty({
    description: 'Whether the post is published',
    example: true,
  })
  published: boolean;
  @ApiProperty({
    description: 'The author of the post',
    example: 'John Doe',
  })
  authorId: string;
}
