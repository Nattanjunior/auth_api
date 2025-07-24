import { ApiProperty } from '@nestjs/swagger';

class ProviderStatus {
  @ApiProperty({ example: true })
  clientId: boolean;

  @ApiProperty({ example: true })
  clientSecret: boolean;

  @ApiProperty({ example: 'http://localhost:3000/auth/google/callback' })
  callbackURL: string;

  @ApiProperty({ example: true })
  configured: boolean;
}

export class OAuthConfigStatusDto {
  @ApiProperty({ type: ProviderStatus })
  google: ProviderStatus;

  @ApiProperty({ type: ProviderStatus })
  github: ProviderStatus;
} 