import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';

class PinSetupModal extends ConsumerStatefulWidget {
  const PinSetupModal({super.key});

  @override
  ConsumerState<PinSetupModal> createState() => _PinSetupModalState();
}

class _PinSetupModalState extends ConsumerState<PinSetupModal> {
  final _pinCtrl = TextEditingController();
  final _confirmPinCtrl = TextEditingController();
  bool _hasExistingPin = false;
  bool _isLoading = true;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    _checkExistingPin();
  }

  Future<void> _checkExistingPin() async {
    final hasPin = await ref.read(authProvider.notifier).hasQuickPin();
    if (mounted) {
      setState(() {
        _hasExistingPin = hasPin;
        _isLoading = false;
      });
    }
  }

  Future<void> _savePin() async {
    final pin = _pinCtrl.text.trim();
    final confirmPin = _confirmPinCtrl.text.trim();

    if (pin.length != 4 || !RegExp(r'^[0-9]{4}$').hasMatch(pin)) {
      setState(() => _errorMsg = 'El PIN debe ser exactamente de 4 dígitos');
      return;
    }

    if (pin != confirmPin) {
      setState(() => _errorMsg = 'Los PINs ingresados no coinciden');
      return;
    }

    await ref.read(authProvider.notifier).setQuickPin(pin);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ PIN de acceso rápido configurado correctamente'),
          backgroundColor: AppTheme.swissBlue,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  Future<void> _removePin() async {
    await ref.read(authProvider.notifier).removeQuickPin();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('PIN de acceso rápido desactivado'),
          backgroundColor: AppTheme.slateGray,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _pinCtrl.dispose();
    _confirmPinCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.pureWhite,
        borderRadius: BorderRadius.zero,
      ),
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'PIN DE ACCESO RÁPIDO',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        color: AppTheme.inkBlack,
                      ),
                    ),
                    if (_hasExistingPin)
                      TextButton(
                        onPressed: _removePin,
                        child: const Text(
                          'DESACTIVAR',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Configure un código de 4 números para ingresar rápidamente y acceder sin conexión a internet.',
                  style: TextStyle(fontSize: 11, color: AppTheme.slateGray),
                ),
                const Divider(color: AppTheme.lineGray, height: 24),
                if (_errorMsg != null) ...[
                  Container(
                    padding: const EdgeInsets.all(8),
                    color: Colors.red.shade50,
                    child: Text(
                      _errorMsg!,
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.red.shade800),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  controller: _pinCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                  obscureText: true,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 8,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'NUEVO PIN (4 DÍGITOS)',
                    counterText: '',
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.zero,
                      borderSide:
                          BorderSide(color: AppTheme.lineGray, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.zero,
                      borderSide:
                          BorderSide(color: AppTheme.swissBlue, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _confirmPinCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                  obscureText: true,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 8,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'CONFIRMAR PIN',
                    counterText: '',
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.zero,
                      borderSide:
                          BorderSide(color: AppTheme.lineGray, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.zero,
                      borderSide:
                          BorderSide(color: AppTheme.swissBlue, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.inkBlack,
                      foregroundColor: AppTheme.pureWhite,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.zero),
                    ),
                    onPressed: _savePin,
                    child: Text(
                      _hasExistingPin ? 'ACTUALIZAR PIN' : 'GUARDAR PIN',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
