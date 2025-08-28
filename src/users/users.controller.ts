import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequiredRoles } from 'src/auth/required-roles.decorator';
import { RoleGuard } from 'src/auth/role/role.guard';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { User as PrismaUser, type Roles } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: PrismaUser;
}

@UseGuards(JwtAuthGuard, RoleGuard)
@RequiredRoles('ADMIN')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Get()
  @ApiOperation({ summary: 'Buscar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Usuários buscados com sucesso',
    type: [User],
  })
  findAll(@Req() req: RequestWithUser) {
    return this.usersService.findAll(req.user!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um usuário por id' })
  @ApiResponse({
    status: 200,
    description: 'Usuário buscado com sucesso',
    type: User,
  })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.findOne(id, req.user!);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar um usuário por id', 
    description: 'O campo ROLE deve receber uma das seguintes strings: ADMIN, EDITOR, WRITER ou READER.'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'EDITOR', 'WRITER', 'READER'] },
      },
    },
    type: User,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    return this.usersService.update(id, updateUserDto, req.user!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um usuário por id' })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
    type: User,
  })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.remove(id, req.user!);
  }
}
