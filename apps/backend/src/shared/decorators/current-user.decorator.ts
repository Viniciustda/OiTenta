import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../types/authenticated-user.type';

/**
 * Lê o usuário anexado pelo JwtAuthGuard.
 * `@CurrentUser()` devolve o objeto; `@CurrentUser('id')`, só o id.
 * O dono de um recurso vem sempre daqui, nunca do body.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }
    return field ? user[field] : user;
  },
);
