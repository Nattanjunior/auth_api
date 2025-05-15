import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt'
import { CaslService } from 'src/casl/casl.service';
import { packRules } from '@casl/ability/extra';

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
}
