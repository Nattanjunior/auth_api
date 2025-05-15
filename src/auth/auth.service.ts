import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService
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

    const token = this.jwt.sign({
      name: user.name,
      email: user.email,
      role: user.role,
      sub: user.id
    })
    return { acess_token: token }
  }
}
