import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/swiss_background.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  int _step = 0;
  final _identifierCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _identifierCtrl.dispose();
    _codeCtrl.dispose();
    _newPasswordCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestVerificationCode() async {
    setState(() => _isLoading = true);
    final success = await ref
        .read(authProvider.notifier)
        .forgotPassword(_identifierCtrl.text.trim());
    setState(() => _isLoading = false);

    if (success) {
      setState(() => _step = 1);
    } else {
      _showError();
    }
  }

  Future<void> _updatePassword() async {
    setState(() => _isLoading = true);
    final success = await ref.read(authProvider.notifier).resetPassword(
          _identifierCtrl.text.trim(),
          _codeCtrl.text.trim(),
          _newPasswordCtrl.text,
        );
    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Contraseña actualizada. Inicie sesión.'),
        backgroundColor: AppTheme.swissBlue,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      ));
      context.go('/login');
    } else {
      _showError();
    }
  }

  void _showError() {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(ref.read(authProvider).errorMessage),
      backgroundColor: Colors.red.shade800,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        bottom: const PreferredSize(
            preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
      ),
      body: SwissBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('SEGURIDAD', style: textTheme.labelSmall)
                  .animate()
                  .fade()
                  .slideY(begin: 0.2),
              const SizedBox(height: 8),
              Text('RECUPERAR\nACCESO', style: textTheme.displayLarge)
                  .animate()
                  .fade(delay: 100.ms)
                  .slideY(begin: 0.2),
              const SizedBox(height: 24),

              // 🔥 Acento Suizo
              Container(width: 64, height: 4, color: AppTheme.swissBlue)
                  .animate()
                  .fade(delay: 150.ms)
                  .scaleX(
                      alignment: Alignment.centerLeft,
                      duration: 600.ms,
                      curve: Curves.easeOutExpo),

              const SizedBox(height: 48),

              if (_step == 0) ...[
                Text('Ingrese su CI o correo para recibir un código de seguridad.',
                        style: textTheme.bodyLarge)
                    .animate()
                    .fade(delay: 200.ms),
                const SizedBox(height: 24),
                _buildSwissTextField('DOCUMENTO DE IDENTIDAD O CORREO',
                        _identifierCtrl, false)
                    .animate()
                    .fade(delay: 300.ms)
                    .slideX(begin: 0.05),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.swissBlue,
                        foregroundColor: AppTheme.pureWhite,
                        padding: const EdgeInsets.symmetric(vertical: 20)),
                    onPressed: _isLoading ? null : _requestVerificationCode,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                color: AppTheme.pureWhite, strokeWidth: 2))
                        : const Text('ENVIAR CÓDIGO'),
                  ),
                ).animate().fade(delay: 400.ms).scaleXY(begin: 0.95),
              ] else ...[
                Text('El código ha sido enviado a su correo electrónico personal asociado.',
                        style: textTheme.bodyLarge)
                    .animate()
                    .fade(),
                const SizedBox(height: 24),
                _buildSwissTextField('CÓDIGO DE 6 DÍGITOS', _codeCtrl, false)
                    .animate()
                    .fade(delay: 100.ms)
                    .slideX(begin: 0.05),
                const SizedBox(height: 24),
                _buildSwissTextField('NUEVA CONTRASEÑA', _newPasswordCtrl, true)
                    .animate()
                    .fade(delay: 200.ms)
                    .slideX(begin: 0.05),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.inkBlack,
                        foregroundColor: AppTheme.pureWhite,
                        padding: const EdgeInsets.symmetric(vertical: 20)),
                    onPressed: _isLoading ? null : _updatePassword,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                color: AppTheme.pureWhite, strokeWidth: 2))
                        : const Text('ACTUALIZAR CONTRASEÑA'),
                  ),
                ).animate().fade(delay: 300.ms).scaleXY(begin: 0.95),
              ]
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSwissTextField(
      String label, TextEditingController controller, bool isPassword) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: isPassword,
          decoration: const InputDecoration(
            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: AppTheme.lineGray, width: 1)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: AppTheme.swissBlue, width: 2)),
          ),
        ),
      ],
    );
  }
}
