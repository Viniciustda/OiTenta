import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenProvider } from '@oitenta/auth';

@Injectable()
export class JwtTokenProvider implements TokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync({
      sub: payload.sub,
      email: payload.email,
    });
  }

  async verify(token: string): Promise<TokenPayload> {
    const decoded = await this.jwtService.verifyAsync<TokenPayload>(token);
    return { sub: decoded.sub, email: decoded.email };
  }
}
