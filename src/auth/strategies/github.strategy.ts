import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { AuthProvider, Roles } from '@prisma/client';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('oauth.github.clientId');
    const clientSecret = configService.get<string>('oauth.github.clientSecret');
    const callbackURL = configService.get<string>('oauth.github.callbackURL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('GitHub OAuth configuration is missing');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, emails, photos } = profile;
    
    const email = emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email não fornecido pelo GitHub'), false);
    }

    try {
      // Busca usuário existente
      let user = await this.authService.findUserByEmail(email);
      
      if (user) {
        // Atualiza dados do usuário existente se necessário
        if (user.authProvider !== AuthProvider.GITHUB || user.providerId !== id.toString()) {
          user = await this.authService.updateOAuthUser(user.id, {
            authProvider: AuthProvider.GITHUB,
            providerId: id.toString(),
            avatar: photos?.[0]?.value,
            emailVerified: true,
          }) as any;
        }
      } else {
        // Cria novo usuário
        user = await this.authService.createOAuthUser({
          email,
          name: profile.displayName || username,
          authProvider: AuthProvider.GITHUB,
          providerId: id.toString(),
          avatar: photos?.[0]?.value,
          emailVerified: true,
          role: Roles.ADMIN, // Todos são ADMIN por padrão
        }) as any;
      }

      // Remove password do objeto antes de retornar
      const { password, ...userWithoutPassword } = user as any;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, false);
    }
  }
} 