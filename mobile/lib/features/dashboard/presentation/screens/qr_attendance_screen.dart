import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/institution_model.dart';
import '../providers/institution_provider.dart';

class QRAttendanceScreen extends ConsumerStatefulWidget {
  final String? classPeriodId;
  final String? courseTitle;

  const QRAttendanceScreen({
    super.key,
    this.classPeriodId,
    this.courseTitle,
  });

  @override
  ConsumerState<QRAttendanceScreen> createState() => _QRAttendanceScreenState();
}

class _QRAttendanceScreenState extends ConsumerState<QRAttendanceScreen> {
  final MobileScannerController cameraController = MobileScannerController();
  final List<QRAttendanceResultModel> _scannedRecords = [];
  final Set<String> _scannedTokens = {};
  bool _isProcessingScan = false;

  Future<void> _handleScan(String rawValue) async {
    if (_isProcessingScan || _scannedTokens.contains(rawValue)) return;

    setState(() {
      _isProcessingScan = true;
      _scannedTokens.add(rawValue);
    });

    try {
      final repository = ref.read(institutionRepositoryProvider);
      final result = await repository.scanQRAttendance(
        qrToken: rawValue,
        classPeriodId: widget.classPeriodId,
      );

      HapticFeedback.mediumImpact();

      if (mounted) {
        setState(() {
          _scannedRecords.insert(0, result);
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${result.studentName} — ${result.status}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            backgroundColor: result.status == 'PUNTUAL'
                ? const Color(0xFF10B981)
                : const Color(0xFFF59E0B),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      HapticFeedback.heavyImpact();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: const Color(0xFFEF4444),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      await Future.delayed(const Duration(milliseconds: 1200));
      if (mounted) {
        setState(() {
          _isProcessingScan = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final settingsAsync = ref.watch(attendanceSettingsProvider);

    return Scaffold(
      backgroundColor: AppTheme.inkBlack,
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        title: Text(
          widget.courseTitle != null
              ? 'ESCÁNER: ${widget.courseTitle!.toUpperCase()}'
              : 'ESCÁNER DE ASISTENCIA QR',
          style: textTheme.labelSmall,
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_outlined),
            onPressed: () => cameraController.toggleTorch(),
          ),
        ],
      ),
      body: settingsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.pureWhite),
        ),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(
              'No fue posible cargar las reglas de asistencia.\n$err',
              textAlign: TextAlign.center,
              style: textTheme.bodyLarge?.copyWith(color: AppTheme.pureWhite),
            ),
          ),
        ),
        data: (settings) {
          if (!settings.enableQrAttendance) {
            return Center(
              child: Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.pureWhite,
                  border: Border.all(color: AppTheme.lineGray),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.qr_code_scanner, size: 48, color: AppTheme.slateGray),
                    const SizedBox(height: 16),
                    Text(
                      'ESCÁNER QR DESHABILITADO',
                      style: textTheme.labelSmall?.copyWith(color: AppTheme.inkBlack),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'La toma de asistencia mediante código QR ha sido desactivada temporalmente por la Dirección en la configuración institucional.',
                      textAlign: TextAlign.center,
                      style: textTheme.bodyMedium?.copyWith(color: AppTheme.slateGray),
                    ),
                  ],
                ),
              ),
            );
          }

          return Stack(
            children: [
              // 1. Cámara
              MobileScanner(
                controller: cameraController,
                onDetect: (capture) {
                  final List<Barcode> barcodes = capture.barcodes;
                  for (final barcode in barcodes) {
                    final String? rawValue = barcode.rawValue;
                    if (rawValue != null) {
                      _handleScan(rawValue);
                    }
                  }
                },
              ),

              // 2. Overlay Estilo Suizo
              Container(
                decoration: ShapeDecoration(
                  shape: QROverlayShape(
                    borderColor: _isProcessingScan
                        ? const Color(0xFF10B981)
                        : AppTheme.swissBlue,
                    borderWidth: 2,
                    overlayColor: AppTheme.inkBlack.withOpacity(0.8),
                  ),
                ),
              ),

              // 3. Textos guía y estado de tolerancia
              Positioned(
                top: 40,
                left: 16,
                right: 16,
                child: Column(
                  children: [
                    Text(
                      'POSICIONE EL CÓDIGO QR\nDENTRO DEL CUADRO',
                      textAlign: TextAlign.center,
                      style: textTheme.labelSmall?.copyWith(color: AppTheme.pureWhite),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.inkBlack.withOpacity(0.6),
                        border: Border.all(color: AppTheme.lineGray.withOpacity(0.3)),
                      ),
                      child: Text(
                        'Tolerancia de Atraso: ${settings.lateToleranceMinutes} min',
                        style: textTheme.bodySmall?.copyWith(
                          color: AppTheme.pureWhite,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // 4. Panel inferior: Lista de escaneados en vivo
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 220,
                  decoration: const BoxDecoration(
                    color: AppTheme.pureWhite,
                    border: Border(top: BorderSide(color: AppTheme.lineGray, width: 1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('REGISTROS EN TIEMPO REAL', style: textTheme.labelSmall),
                            Text(
                              '${_scannedRecords.length} REGISTRADOS',
                              style: textTheme.labelSmall?.copyWith(color: AppTheme.swissBlue),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Expanded(
                        child: _scannedRecords.isEmpty
                          ? Center(
                              child: Text(
                                'Aún no se han escaneado estudiantes.',
                                style: textTheme.bodySmall?.copyWith(color: AppTheme.slateGray),
                              ),
                            )
                          : ListView.separated(
                              padding: EdgeInsets.zero,
                              itemCount: _scannedRecords.length,
                              separatorBuilder: (_, __) => const Divider(height: 1),
                              itemBuilder: (context, index) {
                                final record = _scannedRecords[index];
                                final isPuntual = record.status == 'PUNTUAL';
                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                  leading: Icon(
                                    isPuntual ? Icons.check_circle : Icons.access_time_filled,
                                    color: isPuntual ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                  ),
                                  title: Text(
                                    record.studentName,
                                    style: textTheme.bodyLarge?.copyWith(
                                      color: AppTheme.inkBlack,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Text(
                                    record.status,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: isPuntual ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                    ),
                                  ),
                                  trailing: Text(
                                    '${record.timestamp.hour.toString().padLeft(2, '0')}:${record.timestamp.minute.toString().padLeft(2, '0')}',
                                    style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray),
                                  ),
                                );
                              },
                            ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class QROverlayShape extends ShapeBorder {
  final Color borderColor;
  final double borderWidth;
  final Color overlayColor;

  const QROverlayShape({
    this.borderColor = Colors.white,
    this.borderWidth = 1.0,
    this.overlayColor = const Color(0x88000000),
  });

  @override
  EdgeInsetsGeometry get dimensions => const EdgeInsets.all(10);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path();

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    return Path()..addRect(rect);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final width = rect.width;
    final height = rect.height;
    final size = width < height ? width * 0.7 : height * 0.7;
    final center = Offset(width / 2, height / 2 - 100);
    final cutOutRect = Rect.fromCenter(center: center, width: size, height: size);

    final backgroundPaint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    final path = Path()
      ..addRect(rect)
      ..addRect(cutOutRect)
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, backgroundPaint);

    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    canvas.drawRect(cutOutRect, borderPaint);
  }

  @override
  ShapeBorder scale(double t) => this;
}