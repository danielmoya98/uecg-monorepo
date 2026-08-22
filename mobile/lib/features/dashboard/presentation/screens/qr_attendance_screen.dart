import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/theme/app_theme.dart';

class QRAttendanceScreen extends StatefulWidget {
  const QRAttendanceScreen({super.key});

  @override
  State<QRAttendanceScreen> createState() => _QRAttendanceScreenState();
}

class _QRAttendanceScreenState extends State<QRAttendanceScreen> {
  final MobileScannerController cameraController = MobileScannerController();
  final List<String> _scannedStudents = []; // Simulación de base de datos local temporal

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppTheme.inkBlack, // Fondo negro para la cámara
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        title: Text('ESCÁNER: MATEMÁTICA 3RO A', style: textTheme.labelSmall),
        bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_outlined),
            onPressed: () => cameraController.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. La Cámara
          MobileScanner(
            controller: cameraController,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                final String? rawValue = barcode.rawValue;
                if (rawValue != null && !_scannedStudents.contains(rawValue)) {
                  // Haptic feedback (simulado) y agregar a la lista
                  setState(() {
                    _scannedStudents.insert(0, rawValue); // Agrega al inicio
                  });
                }
              }
            },
          ),

          // 2. El Overlay Estilo Suizo (Recorte cuadrado)
          Container(
            decoration: ShapeDecoration(
              shape: QROverlayShape(
                borderColor: AppTheme.swissBlue,
                borderWidth: 2,
                overlayColor: AppTheme.inkBlack.withOpacity(0.8),
              ),
            ),
          ),

          // 3. Textos guía
          Positioned(
            top: 60,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'POSICIONE EL CÓDIGO QR\nDENTRO DEL CUADRO',
                textAlign: TextAlign.center,
                style: textTheme.labelSmall?.copyWith(color: AppTheme.pureWhite),
              ),
            ),
          ),

          // 4. Panel inferior: Lista de escaneados en tiempo real
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 200,
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
                        Text('REGISTROS RECIENTES', style: textTheme.labelSmall),
                        Text('${_scannedStudents.length} / 30', style: textTheme.labelSmall?.copyWith(color: AppTheme.swissBlue)),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.separated(
                      padding: const EdgeInsets.all(0),
                      itemCount: _scannedStudents.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          leading: const Icon(Icons.check_circle_outline, color: AppTheme.swissBlue),
                          title: Text(_scannedStudents[index], style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
                          trailing: Text(
                            DateTime.now().toString().substring(11, 16), // Hora simulada
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
      ),
    );
  }
}

// Pintor personalizado para el recorte cuadrado perfecto (Swiss Style)
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
    final size = width < height ? width * 0.7 : height * 0.7; // Tamaño del cuadro
    final center = Offset(width / 2, height / 2 - 100); // Lo subimos un poco para dar espacio al panel
    final cutOutRect = Rect.fromCenter(center: center, width: size, height: size);

    // Fondo oscuro
    final backgroundPaint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    // Recortar el centro
    final path = Path()
      ..addRect(rect)
      ..addRect(cutOutRect)
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, backgroundPaint);

    // Borde rígido del escáner
    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    canvas.drawRect(cutOutRect, borderPaint);
  }

  @override
  ShapeBorder scale(double t) => this;
}