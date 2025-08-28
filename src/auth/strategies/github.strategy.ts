import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { AuthProvider, Roles } from '@prisma/client';
import type { UsersProps } from 'src/types/types-users';

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
      let user = await this.authService.findUserByEmail(email);
      const userProviderGithub = user?.authProvider !== AuthProvider.GITHUB || user.providerId !== id.toString();

      if (user) {
        if (userProviderGithub) {
          user = await this.authService.updateOAuthUser(user.id, {
            authProvider: AuthProvider.GITHUB,
            providerId: id.toString(),
            avatar: photos?.[0]?.value,
            emailVerified: true,
          })  as UsersProps;
        }
      } else {
        user = await this.authService.createOAuthUser({
          email,
          name: profile.displayName || username,
          authProvider: AuthProvider.GITHUB,
          providerId: id.toString(),
          avatar: photos?.[0]?.value,
          emailVerified: true,
          isActive: true,
          password: null,
          role: Roles.READER,
        }) as UsersProps;
      }

      // Remove password do objeto antes de retornar
      const { password, ...userWithoutPassword } = user as UsersProps;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, false);
    }
  }
} 