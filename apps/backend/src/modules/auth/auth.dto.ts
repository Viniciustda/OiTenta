import { ApiProperty } from '@nestjs/swagger';
import type {
  LoginUserIn,
  LoginUserOut,
  PublicUser,
  RegisterUserIn,
  RegisterUserOut,
} from '@oitenta/auth';

// Classes só para o Swagger enxergar o contrato; o tipo real é a interface do caso de uso.

export class RegisterUserBody implements RegisterUserIn {
  @ApiProperty({ example: 'Ana Souza' })
  name!: string;

  @ApiProperty({ example: 'ana@bora.app' })
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description:
      'Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.',
  })
  password!: string;
}

export class LoginUserBody implements LoginUserIn {
  @ApiProperty({ example: 'ana@bora.app' })
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  password!: string;
}

export class PublicUserResponse implements PublicUser {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class UserResponse implements RegisterUserOut {
  @ApiProperty({ type: PublicUserResponse })
  user!: PublicUserResponse;
}

export class LoginResponse implements LoginUserOut {
  @ApiProperty({
    description: 'JWT. Envie como Authorization: Bearer <token>.',
  })
  token!: string;

  @ApiProperty({ type: PublicUserResponse })
  user!: PublicUserResponse;
}
