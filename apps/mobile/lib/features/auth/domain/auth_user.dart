/// `user{id,name,email,timezone}` (contrato §1).
class AuthUser {
  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    required this.timezone,
  });

  final String id;
  final String name;
  final String email;
  final String timezone;

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
    id: json['id'] as String,
    name: json['name'] as String,
    email: json['email'] as String,
    timezone: json['timezone'] as String,
  );
}

/// Resposta de `POST /auth/login` e `/auth/demo`: `{ token, user }`.
class AuthSession {
  const AuthSession({required this.token, required this.user});

  final String token;
  final AuthUser user;

  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(
    token: json['token'] as String,
    user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
  );
}
