import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequiredRoles } from 'src/auth/required-roles.decorator';
import { RoleGuard } from 'src/auth/role/role.guard';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { User as PrismaUser } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: PrismaUser;
}

@UseGuards(JwtAuthGuard, RoleGuard)
@RequiredRoles('ADMIN')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
    type: [User],
  })
  findAll(@Req() req: RequestWithUser) {
    return this.usersService.findAll(req.user!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    type: User,
  })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.findOne(id, req.user!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    return this.usersService.update(id, updateUserDto, req.user!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: User,
  })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.remove(id, req.user!);
  }
}
