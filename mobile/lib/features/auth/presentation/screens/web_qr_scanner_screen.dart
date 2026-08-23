import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/secure_storage_service.dart';
import '../providers/auth_provider.dart';

class WebQrScannerScreen extends ConsumerStatefulWidget {
  const WebQrScannerScreen({super.key});

  @override
  ConsumerState<WebQrScannerScreen> createState() => _WebQrScannerScreenState();
}

class _WebQrScannerScreenState extends ConsumerState<WebQrScannerScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _cameraController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;

    for (final barcode in capture.barcodes) {
      final String? rawValue = barcode.rawValue?.trim();
      if (rawValue != null && rawValue.isNotEmpty) {
        String? challengeId;
        if (rawValue.startsWith('uecg-web-auth:')) {
          challengeId = rawValue.replaceFirst('uecg-web-auth:', '').trim();
        } else if (RegExp(r'^[0-9a-fA-F-]{36}$').hasMatch(rawValue)) {
          challengeId = rawValue;
        }

        if (challengeId != null && challengeId.isNotEmpty) {
          setState(() => _isProcessing = true);
          _handleAuthorize(challengeId);
          break;
        }
      }
    }
  }

  Future<void> _handleAuthorize(String challengeId) async {
    try {
      await _cameraController.stop();
    } catch (_) {}

    if (!mounted) return;

    final token = await SecureStorageService.getToken();
    if (token == null || token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Debe iniciar sesión primero en la aplicación móvil'),
          backgroundColor: Colors.amber,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );
      Navigator.of(context).pop();
      return;
    }

    final shouldAuthorize = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.pureWhite,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        title: const Text(
          'ACCESO A WEB-ADMIN',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
            color: AppTheme.inkBlack,
          ),
        ),
        content: const Text(
          '¿Desea autorizar el inicio de sesión en el navegador de la computadora del colegio con su cuenta docente?',
          style: TextStyle(fontSize: 13, color: AppTheme.slateGray),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('CANCELAR',
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: AppTheme.slateGray)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.swissBlue,
              foregroundColor: AppTheme.pureWhite,
              shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.zero),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('AUTORIZAR ACCESO',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (shouldAuthorize == true) {
      if (!mounted) return;

      // Mostramos feedback de carga
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              ),
              SizedBox(width: 12),
              Text('Autorizando sesión en Web...'),
            ],
          ),
          duration: Duration(seconds: 2),
          backgroundColor: AppTheme.inkBlack,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      );

      final success =
          await ref.read(authProvider.notifier).authorizeWebQr(challengeId);

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Sesión web iniciada exitosamente'),
            backgroundColor: Colors.green,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          ),
        );
        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ Código QR expirado o no válido'),
            backgroundColor: Colors.red,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          ),
        );
        setState(() => _isProcessing = false);
        try {
          await _cameraController.start();
        } catch (_) {}
      }
    } else {
      setState(() => _isProcessing = false);
      try {
        await _cameraController.start();
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkBlack,
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        title: const Text(
          'ESCANEAR QR DE ACCESO WEB',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
            color: AppTheme.inkBlack,
          ),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppTheme.lineGray),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_outlined),
            onPressed: () => _cameraController.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _cameraController,
            onDetect: _onDetect,
          ),
          Container(
            decoration: ShapeDecoration(
              shape: QROverlayShape(
                borderColor: AppTheme.swissBlue,
                borderWidth: 3,
                borderRadius: 0,
                borderLength: 40,
                cutOutSize: 260,
                overlayColor: Colors.black.withOpacity(0.7),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
              color: AppTheme.pureWhite.withOpacity(0.95),
              child: const Text(
                'Apunte la cámara al código QR mostrado en la pantalla de la computadora para ingresar a la plataforma Web.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.inkBlack,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class QROverlayShape extends ShapeBorder {
  final Color borderColor;
  final double borderWidth;
  final Color overlayColor;
  final double borderRadius;
  final double borderLength;
  final double cutOutSize;

  const QROverlayShape({
    this.borderColor = Colors.red,
    this.borderWidth = 3.0,
    this.overlayColor = const Color.fromRGBO(0, 0, 0, 80),
    this.borderRadius = 0,
    this.borderLength = 40,
    this.cutOutSize = 250,
  });

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path();

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) => Path()..addRect(rect);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final width = rect.width;
    final height = rect.height;

    final backgroundPaint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    final boxPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    final cutOutRect = Rect.fromCenter(
      center: Offset(width / 2, height / 2),
      width: cutOutSize,
      height: cutOutSize,
    );

    final backgroundPath = Path()
      ..addRect(rect)
      ..addRect(cutOutRect)
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(backgroundPath, backgroundPaint);

    final path = Path();
    final half = cutOutSize / 2;
    final center = Offset(width / 2, height / 2);

    // Top-left
    path.moveTo(center.dx - half, center.dy - half + borderLength);
    path.lineTo(center.dx - half, center.dy - half);
    path.lineTo(center.dx - half + borderLength, center.dy - half);

    // Top-right
    path.moveTo(center.dx + half - borderLength, center.dy - half);
    path.lineTo(center.dx + half, center.dy - half);
    path.lineTo(center.dx + half, center.dy - half + borderLength);

    // Bottom-right
    path.moveTo(center.dx + half, center.dy + half - borderLength);
    path.lineTo(center.dx + half, center.dy + half);
    path.lineTo(center.dx - half + borderLength, center.dy + half);

    // Bottom-left
    path.moveTo(center.dx - half + borderLength, center.dy + half);
    path.lineTo(center.dx - half, center.dy + half);
    path.lineTo(center.dx - half, center.dy + half - borderLength);

    canvas.drawPath(path, boxPaint);
  }

  @override
  ShapeBorder scale(double t) => this;
}
