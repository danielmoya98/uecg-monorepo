import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';

class ConnectedDevicesModal extends ConsumerStatefulWidget {
  const ConnectedDevicesModal({super.key});

  @override
  ConsumerState<ConnectedDevicesModal> createState() =>
      _ConnectedDevicesModalState();
}

class _ConnectedDevicesModalState
    extends ConsumerState<ConnectedDevicesModal> {
  List<Map<String, dynamic>> _sessions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    setState(() => _isLoading = true);
    final sessions = await ref.read(authProvider.notifier).getUserSessions();
    if (mounted) {
      setState(() {
        _sessions = sessions;
        _isLoading = false;
      });
    }
  }

  Future<void> _revokeSession(String sessionId) async {
    final success =
        await ref.read(authProvider.notifier).revokeSession(sessionId);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesión cerrada en el dispositivo remoto'),
          backgroundColor: AppTheme.swissBlue,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );
      _loadSessions();
    }
  }

  Future<void> _revokeOtherSessions() async {
    final success =
        await ref.read(authProvider.notifier).revokeOtherSessions();
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Se cerraron las demás sesiones activas'),
          backgroundColor: AppTheme.swissBlue,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );
      _loadSessions();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: const BoxDecoration(
        color: AppTheme.pureWhite,
        borderRadius: BorderRadius.zero,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'DISPOSITIVOS CONECTADOS',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.2,
                  color: AppTheme.inkBlack,
                ),
              ),
              if (_sessions.length > 1)
                TextButton(
                  onPressed: _revokeOtherSessions,
                  child: const Text(
                    'CERRAR OTROS',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                ),
            ],
          ),
          const Divider(color: AppTheme.lineGray, height: 24),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppTheme.swissBlue,
                ),
              ),
            )
          else if (_sessions.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: Text(
                  'No se encontraron sesiones registradas',
                  style: TextStyle(fontSize: 12, color: AppTheme.slateGray),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _sessions.length,
              separatorBuilder: (_, __) =>
                  const Divider(color: AppTheme.lineGray, height: 1),
              itemBuilder: (ctx, idx) {
                final session = _sessions[idx];
                final isCurrent = session['isCurrent'] == true;
                final deviceType = session['deviceType'] ?? 'UNKNOWN';
                final isMobile = deviceType.toString().startsWith('MOBILE');
                final name = session['deviceName'] ??
                    (isMobile ? 'Aplicación Móvil' : 'Navegador Web');
                final ip = session['ipAddress'] ?? 'Local';

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.pureWhite,
                          border:
                              Border.all(color: AppTheme.lineGray, width: 1),
                        ),
                        child: Icon(
                          isMobile
                              ? Icons.smartphone_outlined
                              : Icons.laptop_chromebook_outlined,
                          size: 18,
                          color: AppTheme.inkBlack,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  name.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.inkBlack,
                                  ),
                                ),
                                if (isCurrent) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 4, vertical: 1),
                                    color: Colors.green.shade100,
                                    child: Text(
                                      'ESTE DISPOSITIVO',
                                      style: TextStyle(
                                        fontSize: 8,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.green.shade800,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'IP: $ip',
                              style: const TextStyle(
                                fontSize: 10,
                                color: AppTheme.slateGray,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (!isCurrent)
                        IconButton(
                          icon: const Icon(Icons.logout_outlined,
                              size: 18, color: Colors.red),
                          onPressed: () => _revokeSession(session['id']),
                          tooltip: 'Cerrar sesión',
                        ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
