import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../services/pin_service.dart';
import '../widgets/pin_pad.dart';

class PinSetupScreen extends StatefulWidget {
  const PinSetupScreen({super.key});

  @override
  State<PinSetupScreen> createState() => _PinSetupScreenState();
}

class _PinSetupScreenState extends State<PinSetupScreen> {
  final PinService _pinService = PinService();
  String _pin = '';
  String _confirmPin = '';
  String _currentPin = '';
  bool _isConfirming = false;
  bool _isRemoving = false;
  bool _isError = false;
  bool _hasExistingPin = false;
  String _message = 'Enter new PIN';

  @override
  void initState() {
    super.initState();
    _checkExistingPin();
  }

  Future<void> _checkExistingPin() async {
    final hasPin = await _pinService.hasPin();
    if (mounted) {
      setState(() {
        _hasExistingPin = hasPin;
        if (hasPin) {
          _isRemoving = true;
          _message = 'Enter current PIN to remove or change';
        }
      });
    }
  }

  void _onDigitTapped(String digit) {
    if (_isError) {
      setState(() => _isError = false);
    }
    
    if (_isRemoving) {
      if (_currentPin.length < 4) {
        setState(() => _currentPin += digit);
      }
      if (_currentPin.length == 4) {
        _verifyCurrentPin();
      }
    } else if (!_isConfirming) {
      if (_pin.length < 4) {
        setState(() => _pin += digit);
      }
      if (_pin.length == 4) {
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) {
            setState(() {
              _isConfirming = true;
              _message = 'Confirm new PIN';
            });
          }
        });
      }
    } else {
      if (_confirmPin.length < 4) {
        setState(() => _confirmPin += digit);
      }
      if (_confirmPin.length == 4) {
        _verifyNewPin();
      }
    }
  }

  void _onDeleteTapped() {
    if (_isError) {
      setState(() => _isError = false);
    }
    setState(() {
      if (_isRemoving && _currentPin.isNotEmpty) {
        _currentPin = _currentPin.substring(0, _currentPin.length - 1);
      } else if (_isConfirming && _confirmPin.isNotEmpty) {
        _confirmPin = _confirmPin.substring(0, _confirmPin.length - 1);
      } else if (!_isConfirming && _pin.isNotEmpty) {
        _pin = _pin.substring(0, _pin.length - 1);
      }
    });
  }

  Future<void> _verifyCurrentPin() async {
    final isValid = await _pinService.verifyPin(_currentPin);
    if (!isValid) {
      _showError('Incorrect PIN');
      setState(() {
        _currentPin = '';
      });
    } else {
      // Prompt user whether to just remove or to set a new one
      final action = await showDialog<String>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.surface,
          title: Text('Security', style: TextStyle(color: AppColors.textPrimary)),
          content: const Text('Do you want to turn off PIN lock or change your PIN?', style: TextStyle(color: AppColors.textSecondary)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, 'turn_off'),
              child: const Text('Turn Off', style: TextStyle(color: AppColors.error)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, 'change'),
              child: const Text('Change', style: TextStyle(color: AppColors.accent)),
            ),
          ],
        ),
      );

      if (action == 'turn_off') {
        await _pinService.removePin();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: const Text('PIN lock disabled'), backgroundColor: AppColors.surface, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          );
          Navigator.pop(context);
        }
      } else {
        setState(() {
          _isRemoving = false;
          _currentPin = '';
          _message = 'Enter new PIN';
        });
      }
    }
  }

  Future<void> _verifyNewPin() async {
    if (_pin == _confirmPin) {
      await _pinService.savePin(_pin);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('PIN saved successfully'), 
            backgroundColor: AppColors.success.withOpacity(0.8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        Navigator.pop(context);
      }
    } else {
      _showError('PINs do not match');
      setState(() {
        _confirmPin = '';
      });
    }
  }

  void _showError(String errMsg) {
    setState(() {
      _isError = true;
      _message = errMsg;
    });
  }

  @override
  Widget build(BuildContext context) {
    int currentLength;
    if (_isRemoving) {
      currentLength = _currentPin.length;
    } else if (_isConfirming) {
      currentLength = _confirmPin.length;
    } else {
      currentLength = _pin.length;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('App Lock'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _hasExistingPin && _isRemoving ? Icons.lock : Icons.lock_outline,
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
              length: currentLength,
              isError: _isError,
            ),
            const SizedBox(height: 64),
            PinPad(
              onDigitTapped: _onDigitTapped,
              onDeleteTapped: _onDeleteTapped,
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
