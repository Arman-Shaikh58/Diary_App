import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../services/pin_service.dart';
import '../widgets/pin_pad.dart';

class PinEntryScreen extends StatefulWidget {
  const PinEntryScreen({super.key});

  @override
  State<PinEntryScreen> createState() => _PinEntryScreenState();
}

class _PinEntryScreenState extends State<PinEntryScreen> {
  final PinService _pinService = PinService();
  String _pin = '';
  bool _isError = false;
  String _message = 'Enter PIN';
  bool _isResetting = false;

  void _onDigitTapped(String digit) {
    if (_isError) {
      setState(() {
        _isError = false;
        _message = 'Enter PIN';
        _pin = '';
      });
    }

    if (_pin.length < 4) {
      setState(() => _pin += digit);
    }
    
    if (_pin.length == 4) {
      _verifyPin();
    }
  }

  void _onDeleteTapped() {
    if (_isError) {
      setState(() {
        _isError = false;
        _message = 'Enter PIN';
        _pin = '';
      });
      return;
    }
    setState(() {
      if (_pin.isNotEmpty) {
        _pin = _pin.substring(0, _pin.length - 1);
      }
    });
  }

  Future<void> _verifyPin() async {
    final isValid = await _pinService.verifyPin(_pin);
    if (isValid && mounted) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      setState(() {
        _isError = true;
        _message = 'Incorrect PIN';
        _pin = '';
      });
    }
  }

  void _showForgotPinDialog() {
    final passwordController = TextEditingController();
    bool isLoading = false;
    String? localError;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 24,
                right: 24,
                top: 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Reset PIN',
                    style: GoogleFonts.outfit(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Enter your account password to verify your identity and remove the PIN.',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 24),
                  if (localError != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Text(
                        localError!,
                        style: const TextStyle(color: AppColors.error, fontSize: 13),
                      ),
                    ),
                  TextField(
                    controller: passwordController,
                    obscureText: true,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textHint),
                      filled: true,
                      fillColor: AppColors.surfaceLight,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () async {
                            setModalState(() {
                              isLoading = true;
                              localError = null;
                            });

                            final success = await _pinService
                                .resetPinWithPassword(passwordController.text);

                            if (success && mounted) {
                              Navigator.pop(ctx);
                              Navigator.of(this.context).pushReplacementNamed('/home');
                              ScaffoldMessenger.of(this.context).showSnackBar(
                                SnackBar(
                                  content: const Text('PIN successfully removed'),
                                  backgroundColor: AppColors.surface,
                                ),
                              );
                            } else {
                              setModalState(() {
                                isLoading = false;
                                localError = 'Incorrect password or network error';
                              });
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accent,
                      foregroundColor: AppColors.background,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.background,
                            ),
                          )
                        : const Text(
                            'Verify & Reset',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.lock,
              size: 64,
              color: AppColors.primary,
            ),
            const SizedBox(height: 24),
            Text(
              _message,
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: _isError ? AppColors.error : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 32),
            PinIndicator(
              length: _pin.length,
              isError: _isError,
            ),
            const SizedBox(height: 64),
            PinPad(
              onDigitTapped: _onDigitTapped,
              onDeleteTapped: _onDeleteTapped,
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: _showForgotPinDialog,
              child: const Text(
                'Forgot PIN?',
                style: TextStyle(color: AppColors.textHint),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
