import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // 1. Paleta de Colores
  static const Color swissBlue = Color(0xFF000089);
  static const Color deepNight = Color(0xFF000060);
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color inkBlack = Color(0xFF111827);
  static const Color slateGray = Color(0xFF6B7280);
  static const Color lineGray = Color(0xFFE5E7EB);

  // 2. Definición del Tema Global
  static ThemeData get swissTheme {
    final baseTextTheme = GoogleFonts.jostTextTheme();

    return ThemeData(
      scaffoldBackgroundColor: pureWhite,
      primaryColor: swissBlue,
      colorScheme: const ColorScheme.light(
        primary: swissBlue,
        secondary: deepNight,
        background: pureWhite,
        surface: pureWhite,
      ),

      // 3. Tipografía
      textTheme: baseTextTheme.copyWith(
        // Títulos (Display)
        displayLarge: GoogleFonts.jost(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: inkBlack,
          letterSpacing: -1.5,
          height: 1.0,
        ),
        // Micro-Etiquetas (Labels)
        labelSmall: GoogleFonts.jost(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: swissBlue,
          letterSpacing: 2.0, // Equivalente a 0.2em
        ),
        // Cuerpo (Body)
        bodyLarge: GoogleFonts.jost(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: slateGray,
        ),
      ),

      // 4. UI Kit & Componentes (Botones rectangulares sin bordes redondeados)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: pureWhite,
          foregroundColor: swissBlue,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero, // Radio 0px estricto
            side: BorderSide(color: swissBlue, width: 1), // Borde fino
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.jost(
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ).copyWith(
          // Lógica para el Hover/Pressed (Inversión total)
          backgroundColor: MaterialStateProperty.resolveWith<Color>(
                (Set<MaterialState> states) {
              if (states.contains(MaterialState.pressed) || states.contains(MaterialState.hovered)) {
                return swissBlue;
              }
              return pureWhite;
            },
          ),
          foregroundColor: MaterialStateProperty.resolveWith<Color>(
                (Set<MaterialState> states) {
              if (states.contains(MaterialState.pressed) || states.contains(MaterialState.hovered)) {
                return pureWhite;
              }
              return swissBlue;
            },
          ),
        ),
      ),

      // Estilo de líneas de división (Grid)
      dividerTheme: const DividerThemeData(
        color: lineGray,
        thickness: 1,
        space: 1,
      ),
    );
  }
}