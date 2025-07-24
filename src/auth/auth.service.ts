import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt'
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) { }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    })

    if (!user) {
      throw new Error('Invalid Credentials')
    }

    if (!user.password) {
      throw new Error('Invalid Credentials')
    }

    const isValidPassword = bcrypt.compareSync(
      loginDto.password,
      user.password,
    )

    if (!isValidPassword) {
      throw new Error('Invalid Credentials')
    }

    const token = this.jwt.sign({
      name: user.name,
      email: user.email,
      role: user.role,
      sub: user.id,
      authProvider: user.authProvider,
    })
    
    return { access_token: token }
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async register(createUserDto: CreateUserDto) {
    const existing = await this.findUserByEmail(createUserDto.email);
    if (existing) {
      throw new Error('Email já cadastrado');
    }
    
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: bcrypt.hashSync(createUserDto.password, 10),
        role: Roles.ADMIN,
      }
    });
    

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createOAuthUser(userData: {
    email: string;
    name: string;
    authProvider: string;
    providerId: string;
    avatar?: string;
    emailVerified: boolean;
    role: Roles;
  }) {
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        authProvider: userData.authProvider as any,
        providerId: userData.providerId,
        avatar: userData.avatar,
        emailVerified: userData.emailVerified,
        role: userData.role,
        isActive: true,
        // OAuth users don't have password
        password: null,
      }
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateOAuthUser(userId: string, updateData: {
    authProvider: string;
    providerId: string;
    avatar?: string;
    emailVerified: boolean;
  }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        authProvider: updateData.authProvider as any,
        providerId: updateData.providerId,
        avatar: updateData.avatar,
        emailVerified: updateData.emailVerified,
        lastLoginAt: new Date(),
      }
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateJwtFromUser(user: any) {
    const token = this.jwt.sign({
      name: user.name,
      email: user.email,
      role: user.role,
      sub: user.id,
      authProvider: user.authProvider,
    });
    
    return { access_token: token };
  }
}
