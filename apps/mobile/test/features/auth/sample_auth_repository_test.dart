import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/auth/data/sample_auth_repository.dart';

void main() {
  final repo = SampleAuthRepository();

  test('loginDemo devolve token e o usuário demo (Arthur) no formato do contrato', () async {
    final s = await repo.loginDemo();
    expect(s.token, isNotEmpty);
    expect(s.user.name, 'Arthur');
    expect(s.user.timezone, 'America/Sao_Paulo');
  });

  test('register usa America/Sao_Paulo quando não recebe fuso (P1)', () async {
    final u = await repo.register(name: 'Bia', email: 'bia@x.com', password: 'Senha@123');
    expect(u.name, 'Bia');
    expect(u.timezone, 'America/Sao_Paulo');
  });

  test('login devolve uma sessão com o e-mail informado', () async {
    final s = await repo.login(email: 'bia@x.com', password: 'Senha@123');
    expect(s.user.email, 'bia@x.com');
  });
}
