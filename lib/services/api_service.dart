import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final Dio dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService._internal() {
    dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 120),
      receiveTimeout: const Duration(seconds: 120),
      sendTimeout: const Duration(seconds: 120),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Request interceptor — attach JWT
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        // Auto-refresh on 401
        if (error.response?.statusCode == 401) {
          try {
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the original request
              final opts = error.requestOptions;
              final token = await _storage.read(key: 'access_token');
              opts.headers['Authorization'] = 'Bearer $token';
              final response = await dio.fetch(opts);
              return handler.resolve(response);
            }
          } catch (_) {
            // Refresh failed — let error propagate
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      if (refreshToken == null) return false;

      // Use a separate Dio instance to avoid interceptor loop
      final freshDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      final response = await freshDio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        await _storage.write(
          key: 'access_token',
          value: response.data['data']['accessToken'],
        );
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}
