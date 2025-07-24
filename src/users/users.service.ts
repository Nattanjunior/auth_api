import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt'
import { CaslService } from 'src/casl/casl.service';
import { accessibleBy } from '@casl/prisma';
import { User, type Roles } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslService
  ) { }

  create(createUserDto: CreateUserDto, currentUser: User) {
    const ability = this.abilityService.createForUser(currentUser);

    if (!ability.can('create', 'User')) {
      throw new Error('Unauthorized');
    }

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
        role: 'ADMIN' as Roles,
      }
    })
  }

  findAll(currentUser: User) {
    const ability = this.abilityService.createForUser(currentUser);
    
    return this.prisma.user.findMany({
      where: {
        AND: [accessibleBy(ability, 'read').User]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  findOne(id: string, currentUser: User) {
    const ability = this.abilityService.createForUser(currentUser);
    
    if (!ability.can('read', 'User')) {
      throw new Error('Unauthorized');
    }
    
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    const ability = this.abilityService.createForUser(currentUser);
    
    if (!ability.can('update', 'User')) {
      throw new Error('Unauthorized');
    }
    
    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: updateUserDto.password
          ? bcrypt.hashSync(updateUserDto.password, 10)
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  remove(id: string, currentUser: User) {
    const ability = this.abilityService.createForUser(currentUser);
    
    if (!ability.can('delete', 'User')) {
      throw new Error('Unauthorized');
    }
    
    return this.prisma.user.delete({
      where: { id }
    });
  }
}
