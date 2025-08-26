import { Body, Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiOkResponse, ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { OAuthConfigStatusDto } from './dto/oauth-config-status.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { Request, Response } from 'express';
import type { UsersProps } from 'src/types/types-users';



@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login do usuário',
    description: 'Autentica um usuário e retorna um token JWT válido por 2 horas.'
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'Token JWT para autenticação',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsInN1YiI6ImN1aWQxMjMiLCJhdXRoUHJvdmlkZXIiOiJMT0NBTCIsImlhdCI6MTY5MDAwMDAwMCwiZXhwIjoxNjkwMDA3MjAwfQ.signature',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de login inválidos',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Email deve ser um endereço de email válido']
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    
    return result;
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'Registro público de usuário',
    description: 'Cria um novo usuário com role ADMIN por padrão. Apenas nome, email e senha são necessários.'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cuid123' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        role: { type: 'string', example: 'ADMIN' },
        authProvider: { type: 'string', example: 'LOCAL' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou email já cadastrado',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['Email deve ser um endereço de email válido']
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    const createUserDto: CreateUserDto = {
      ...registerDto,
      role: Roles.ADMIN, // 🔥 SEMPRE ADMIN POR PADRÃO
      permissions: undefined, // ✅ Ignorado por segurança
    };
    
    return this.authService.register(createUserDto);
  }



  @Get('config/oauth')
  @ApiOperation({ summary: 'Verificar configuração OAuth' })
  @ApiOkResponse({
    description: 'Status das configurações OAuth',
    type: OAuthConfigStatusDto,
  })
  checkOAuthConfig(): OAuthConfigStatusDto {
    const googleConfig = {
      clientId: !!this.configService.get('oauth.google.clientId'),
      clientSecret: !!this.configService.get('oauth.google.clientSecret'),
      callbackURL: this.configService.get('oauth.google.callbackURL'),
      configured: !!this.configService.get('oauth.google.clientId') && !!this.configService.get('oauth.google.clientSecret'),
    };

    const githubConfig = {
      clientId: !!this.configService.get('oauth.github.clientId'),
      clientSecret: !!this.configService.get('oauth.github.clientSecret'),
      callbackURL: this.configService.get('oauth.github.callbackURL'),
      configured: !!this.configService.get('oauth.github.clientId') && !!this.configService.get('oauth.github.clientSecret'),
    };

    return {
      google: googleConfig,
      github: githubConfig,
    };
  }

  // ===============================
  // GOOGLE OAUTH 2.0 ROUTES
  // ===============================

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ 
    summary: 'Iniciar autenticação Google OAuth 2.0',
    description: 'Redireciona para a página de login do Google. Após autorização, retorna para /auth/google/callback'
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para Google OAuth'
  })
  async googleAuth() {
    // Guard handles the redirect
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const tokenData = await this.authService.generateJwtFromUser(user as UsersProps);
    
    return res.json({
      message: 'Autenticação Google realizada com sucesso',
      ...tokenData,
      user
    });
  }

  // ===============================
  // GITHUB OAUTH 2.0 ROUTES
  // ===============================

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ 
    summary: 'Iniciar autenticação GitHub OAuth 2.0',
    description: 'Redireciona para a página de login do GitHub. Após autorização, retorna para /auth/github/callback'
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para GitHub OAuth'
  })
  async githubAuth() {
    // Guard handles the redirect
  }

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  @ApiExcludeEndpoint() 
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const tokenData = await this.authService.generateJwtFromUser(user as UsersProps);
    return res.json({
      message: 'Autenticação GitHub realizada com sucesso',
      ...tokenData,
      user
    });
  }
}
