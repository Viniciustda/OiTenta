import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/errors/app_errors.dart';
import 'package:oitenta/features/auth/data/http_auth_repository.dart';

import '../../helpers/fake_api.dart';

const _user = {
  'id': 'u1',
  'name': 'Arthur',
  'email': 'arthur@bora.app',
  'timezone': 'America/Sao_Paulo',
};

void main() {
  late FakeApi api;
  late HttpAuthRepository repo;

  setUp(() {
    api = FakeApi();
    repo = HttpAuthRepository(api.client);
  });

  test(
    'loginDemo: POST /auth/demo sem Bearer e devolve token e usuário',
    () async {
      api.respond({'token': 'jwt', 'user': _user});
      final s = await repo.loginDemo();
      expect(api.last.method, 'POST');
      expect(api.last.url.path, '/auth/demo');
      expect(api.last.headers.containsKey('Authorization'), isFalse);
      expect(s.token, 'jwt');
      expect(s.user.name, 'Arthur');
      expect(s.user.timezone, 'America/Sao_Paulo');
    },
  );

  test('loginDemo: 404 (seed não rodado) → NotFoundFailure', () async {
    api.fail(404, 'Usuário demo não encontrado.');
    await expectLater(repo.loginDemo(), throwsA(isA<NotFoundFailure>()));
  });

  test('login: POST /auth/login com {email, password}', () async {
    api.respond({'token': 'jwt', 'user': _user});
    final s = await repo.login(email: 'arthur@bora.app', password: 'Senha@123');
    expect(api.last.method, 'POST');
    expect(api.last.url.path, '/auth/login');
    expect(api.lastBody, {'email': 'arthur@bora.app', 'password': 'Senha@123'});
    expect(api.last.headers.containsKey('Authorization'), isFalse);
    expect(s.user.email, 'arthur@bora.app');
  });

  test('login: 401 → UnauthorizedFailure sem limpar sessão', () async {
    api.fail(401, 'Credenciais inválidas.');
    await expectLater(
      repo.login(email: 'a@b.com', password: 'x'),
      throwsA(isA<UnauthorizedFailure>()),
    );
    expect(api.unauthorizedCalls, 0);
  });

  test('register: POST /auth/register com o fuso e devolve o user', () async {
    api.respond({
      'user': {..._user, 'name': 'Bia'},
    }, 201);
    final u = await repo.register(
      name: 'Bia',
      email: 'bia@x.com',
      password: 'Senha@123',
      timezone: 'America/Manaus',
    );
    expect(api.last.url.path, '/auth/register');
    expect(api.lastBody, {
      'name': 'Bia',
      'email': 'bia@x.com',
      'password': 'Senha@123',
      'timezone': 'America/Manaus',
    });
    expect(u.name, 'Bia');
  });

  test(
    'register sem fuso não manda o campo (o backend usa o padrão, P1)',
    () async {
      api.respond({'user': _user}, 201);
      await repo.register(
        name: 'Bia',
        email: 'bia@x.com',
        password: 'Senha@123',
      );
      expect((api.lastBody as Map).containsKey('timezone'), isFalse);
    },
  );

  test('register: 409 → ConflictFailure; 422 → ValidationFailure', () async {
    api.fail(409, 'E-mail já cadastrado.');
    await expectLater(
      repo.register(name: 'B', email: 'b@x.com', password: 'Senha@123'),
      throwsA(isA<ConflictFailure>()),
    );
    api.fail(422, 'Dados inválidos.');
    await expectLater(
      repo.register(name: 'B', email: 'b@x.com', password: 'fraca'),
      throwsA(isA<ValidationFailure>()),
    );
  });

  test('me: GET /auth/me com Bearer e devolve o usuário', () async {
    api.respond({'user': _user});
    final u = await repo.me();
    expect(api.last.method, 'GET');
    expect(api.last.url.path, '/auth/me');
    expect(api.last.headers['Authorization'], 'Bearer tok-123');
    expect(u.id, 'u1');
  });

  test('me: 401 → UnauthorizedFailure e avisa a sessão', () async {
    api.fail(401, 'Token inválido.');
    await expectLater(repo.me(), throwsA(isA<UnauthorizedFailure>()));
    expect(api.unauthorizedCalls, 1);
  });
}
