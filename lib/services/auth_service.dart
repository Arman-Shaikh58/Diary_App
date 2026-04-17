import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

class AuthService {
  final _api = ApiService();
  final _storage = const FlutterSecureStorage();

  Future<Map<String, dynamic>> register({
    required String email,
    required String username,
    required String password,
  }) async {
    final response = await _api.dio.post('/auth/register', data: {
      'email': email,
      'username': username,
      'password': password,
    });

    if (response.data['success'] == true) {
      final data = response.data['data'];
      await _saveTokens(data['accessToken'], data['refreshToken']);
      await _storage.write(key: 'user_id', value: data['user']['id']);
      await _storage.write(key: 'username', value: data['user']['username']);
      await _storage.write(key: 'email', value: data['user']['email']);
      return data['user'];
    }
    throw Exception(response.data['error']?['message'] ?? 'Registration failed');
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    if (response.data['success'] == true) {
      final data = response.data['data'];
      await _saveTokens(data['accessToken'], data['refreshToken']);
      await _storage.write(key: 'user_id', value: data['user']['id']);
      await _storage.write(key: 'username', value: data['user']['username']);
      await _storage.write(key: 'email', value: data['user']['email']);
      return data['user'];
    }
    throw Exception(response.data['error']?['message'] ?? 'Login failed');
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      if (refreshToken != null) {
        await _api.dio.post('/auth/logout', data: {
          'refreshToken': refreshToken,
        });
      }
    } catch (_) {
      // Ignore errors during logout
    } finally {
      await _storage.deleteAll();
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }

  Future<String?> getUsername() async {
    return _storage.read(key: 'username');
  }

  Future<String?> getEmail() async {
    return _storage.read(key: 'email');
  }

  Future<void> _saveTokens(String accessToken, String refreshToken) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
  }
}
