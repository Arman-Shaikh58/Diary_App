import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  bool _isLoggedIn = false;
  String? _username;
  String? _email;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  String? get username => _username;
  String? get email => _email;
  String? get errorMessage => _errorMessage;

  Future<void> checkAuthState() async {
    _isLoggedIn = await _authService.isLoggedIn();
    if (_isLoggedIn) {
      _username = await _authService.getUsername();
      _email = await _authService.getEmail();
    }
    notifyListeners();
  }

  Future<bool> register({
    required String email,
    required String username,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authService.register(
        email: email,
        username: username,
        password: password,
      );
      _isLoggedIn = true;
      _username = user['username'];
      _email = user['email'];
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = _parseError(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authService.login(
        email: email,
        password: password,
      );
      _isLoggedIn = true;
      _username = user['username'];
      _email = user['email'];
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = _parseError(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    await _authService.logout();
    _isLoggedIn = false;
    _username = null;
    _email = null;
    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  String _parseError(dynamic e) {
    if (e.toString().contains('EMAIL_ALREADY_EXISTS') ||
        e.toString().contains('already exists')) {
      return 'An account with this email already exists';
    }
    if (e.toString().contains('Invalid email or password')) {
      return 'Invalid email or password';
    }
    if (e.toString().contains('SocketException') ||
        e.toString().contains('Connection')) {
      return 'Unable to connect to server. Please check your connection.';
    }
    return e.toString().replaceAll('Exception: ', '');
  }
}
