import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt'
import { CaslService } from 'src/casl/casl.service';
import { packRules } from '@casl/ability/extra';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private ability: CaslService
  ) { }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    })

    if (!user) {
      throw new Error('Invalid Credentials')
    }

    const isValidPassword = bcrypt.compareSync(
      loginDto.password,
      user.password,
    )

    if (!isValidPassword) {
      throw new Error('Invalid Credentials')
    }

    const ability = this.ability.createForUser(user);
    const token = this.jwt.sign({
      name: user.name,
      email: user.email,
      role: user.role,
      sub: user.id,
      permissions: packRules(ability.rules),
    })
    return { acess_token: token }
  }

  async register(createUserDto: CreateUserDto) {
    // Verifica se já existe usuário com o mesmo email
    const existing = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existing) {
      throw new Error('Email já cadastrado');
    }
    // Cria usuário com role READER e sem permissions customizadas
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: bcrypt.hashSync(createUserDto.password, 10),
        role: Roles.READER,
        // Não permite permissions customizadas
      }
    });
    // Retorna dados sem a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
