import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AuthProvider, Roles } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('oauth.google.clientId');
    const clientSecret = configService.get<string>('oauth.google.clientSecret');
    const callbackURL = configService.get<string>('oauth.google.callbackURL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth configuration is missing');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const email = emails[0]?.value;
    if (!email) {
      return done(new Error('Email não fornecido pelo Google'), false);
    }

    try {
      // Busca usuário existente
      let user = await this.authService.findUserByEmail(email);
      
      if (user) {
        // Atualiza dados do usuário existente se necessário
        if (user.authProvider !== AuthProvider.GOOGLE || user.providerId !== id) {
          user = await this.authService.updateOAuthUser(user.id, {
            authProvider: AuthProvider.GOOGLE,
            providerId: id,
            avatar: photos[0]?.value,
            emailVerified: true,
          }) as any;
        }
      } else {
        // Cria novo usuário
        user = await this.authService.createOAuthUser({
          email,
          name: name.givenName + ' ' + name.familyName,
          authProvider: AuthProvider.GOOGLE,
          providerId: id,
          avatar: photos[0]?.value,
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