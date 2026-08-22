import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/swiss_background.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  int _selectedRoleIndex = 0;
  final _ciCtrl = TextEditingController();
  final _birthDateCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _ciCtrl.dispose();
    _birthDateCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    setState(() => _isLoading = true);
    bool success = _selectedRoleIndex == 0
        ? await ref.read(authProvider.notifier).registerStudent(
            _ciCtrl.text.trim(),
            _birthDateCtrl.text.trim(),
            _emailCtrl.text.trim(),
            _passwordCtrl.text)
        : await ref.read(authProvider.notifier).registerGuardian(
            _ciCtrl.text.trim(), _emailCtrl.text.trim(), _passwordCtrl.text);

    setState(() => _isLoading = false);

    if (success && mounted) {
      _showSuccessDialog();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(ref.read(authProvider).errorMessage),
        backgroundColor: Colors.red.shade800,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      ));
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        backgroundColor: AppTheme.pureWhite,
        title: Text('CUENTA CREADA',
            style: Theme.of(context).textTheme.displayLarge),
        content: Text(
            'Su identidad ha sido validada. Su correo institucional ya está activo.',
            style: Theme.of(context).textTheme.bodyLarge),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.swissBlue,
                foregroundColor: AppTheme.pureWhite),
            onPressed: () {
              Navigator.pop(context);
              context.go(_selectedRoleIndex == 0
                  ? '/dashboard/student'
                  : '/dashboard/parent');
            },
            child: const Text('IR A MI PANEL'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final isStudent = _selectedRoleIndex == 0;

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
              Text('NUEVO USUARIO', style: textTheme.labelSmall)
                  .animate()
                  .fade()
                  .slideY(begin: 0.2),
              const SizedBox(height: 8),
              Text('CREAR\nCUENTA', style: textTheme.displayLarge)
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

              Row(
                children: [
                  _buildRoleTab('SOY ESTUDIANTE', 0, textTheme),
                  _buildRoleTab('SOY TUTOR', 1, textTheme),
                ],
              ).animate().fade(delay: 200.ms),
              const SizedBox(height: 32),

              _buildSwissTextField('CARNET DE IDENTIDAD (CI)', _ciCtrl, false)
                  .animate()
                  .fade(delay: 300.ms)
                  .slideX(begin: 0.05),
              if (isStudent) ...[
                const SizedBox(height: 24),
                _buildSwissTextField('FECHA DE NACIMIENTO (YYYY-MM-DD)',
                        _birthDateCtrl, false)
                    .animate()
                    .fade(delay: 350.ms)
                    .slideX(begin: 0.05),
              ],
              const SizedBox(height: 24),
              _buildSwissTextField(
                      'CORREO PERSONAL (RECUPERACIÓN)', _emailCtrl, false)
                  .animate()
                  .fade(delay: 400.ms)
                  .slideX(begin: 0.05),
              const SizedBox(height: 24),
              _buildSwissTextField('NUEVA CONTRASEÑA', _passwordCtrl, true)
                  .animate()
                  .fade(delay: 450.ms)
                  .slideX(begin: 0.05),
              const SizedBox(height: 48),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.inkBlack,
                    foregroundColor: AppTheme.pureWhite,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                  ),
                  onPressed: _isLoading ? null : _handleRegister,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: AppTheme.pureWhite, strokeWidth: 2))
                      : const Text('REGISTRAR IDENTIDAD',
                          style: TextStyle(
                              letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                ),
              ).animate().fade(delay: 550.ms).scaleXY(begin: 0.95),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleTab(String label, int index, TextTheme textTheme) {
    final isSelected = _selectedRoleIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRoleIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.swissBlue : AppTheme.pureWhite,
            border: Border.all(color: AppTheme.lineGray, width: 1),
          ),
          alignment: Alignment.center,
          child: Text(label,
              style: textTheme.labelSmall?.copyWith(
                  color: isSelected ? AppTheme.pureWhite : AppTheme.slateGray)),
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
