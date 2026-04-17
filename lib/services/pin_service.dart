import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/material.dart';
import 'auth_service.dart';

class PinService {
  static final PinService _instance = PinService._internal();
  factory PinService() => _instance;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final AuthService _authService = AuthService();

  static const String _pinKey = 'app_pin_locked';

  PinService._internal();

  /// Checks if a PIN is currently set for the app
  Future<bool> hasPin() async {
    final pin = await _storage.read(key: _pinKey);
    return pin != null && pin.isNotEmpty;
  }

  /// Sets a new PIN
  Future<void> savePin(String pin) async {
    await _storage.write(key: _pinKey, value: pin);
  }

  /// Verify if the provided PIN matches the stored PIN
  Future<bool> verifyPin(String enteredPin) async {
    final storedPin = await _storage.read(key: _pinKey);
    return storedPin == enteredPin;
  }

  /// Removes the stored PIN
  Future<void> removePin() async {
    await _storage.delete(key: _pinKey);
  }

  /// Verifies the user's identity using their account password
  /// This acts as the "Forgot PIN" exact mechanism.
  Future<bool> resetPinWithPassword(String password) async {
    try {
      final email = await _authService.getEmail();
      if (email == null) return false;

      // Attempt to login to verify the password
      await _authService.login(email: email, password: password);
      
      // If login succeeds, the password is correct. We can safely remove the PIN.
      await removePin();
      return true;
    } catch (e) {
      debugPrint('Reset PIN via password failed: $e');
      return false;
    }
  }
}
