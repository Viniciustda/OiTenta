import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../types/authenticated-user.type';

interface JwtClaims {
  sub?: unknown;
  email?: unknown;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    try {
      const claims = await this.jwtService.verifyAsync<JwtClaims>(token);
      request.user = this.toAuthenticatedUser(claims);
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  private extractBearerToken(header: string | undefined): string {
    const [scheme, token] = (header ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token ausente.');
    }
    return token;
  }

  private toAuthenticatedUser(claims: JwtClaims): AuthenticatedUser {
    if (typeof claims.sub !== 'string' || typeof claims.email !== 'string') {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    return { id: claims.sub, email: claims.email };
  }
}
