const UNIDADES = ["", "UNO ", "DOS ", "TRES ", "CUATRO ", "CINCO ", "SEIS ", "SIETE ", "OCHO ", "NUEVE "];
const DECENAS = [
  "DIEZ ",
  "ONCE ",
  "DOCE ",
  "TRECE ",
  "CATORCE ",
  "QUINCE ",
  "DIECISEIS ",
  "DIECISIETE ",
  "DIECIOCHO ",
  "DIECINUEVE ",
  "VEINTE ",
  "TREINTA ",
  "CUARENTA ",
  "CINCUENTA ",
  "SESENTA ",
  "SETENTA ",
  "OCHENTA ",
  "NOVENTA ",
];

/**
 * Traduce un valor numérico cuantitativo de calificación (0 - 100)
 * a su representación literal en idioma castellano.
 * @param num Valor numérico de la calificación escolar.
 * @returns Cadena de texto correspondiente a la valoración literal.
 */
export function numeroALetras(num: number | null | undefined): string {
  if (num === null || num === undefined) return "";
  if (num === 0) return "CERO";
  if (num === 100) return "CIEN";

  let letras: string;
  const n = Math.floor(num); // Nos aseguramos que sea entero

  if (n >= 10 && n < 20) {
    letras = DECENAS[n - 10];
  } else if (n === 20) {
    letras = "VEINTE";
  } else if (n > 20 && n < 30) {
    const unidadStr = UNIDADES[n - 20].trim();
    letras = `VEINTI${unidadStr}`;
  } else if (n >= 30 && n < 100) {
    const decena = Math.floor(n / 10);
    const unidad = n % 10;
    letras = DECENAS[decena + 8]; // Offset para saltar la primera decena (10-29)
    if (unidad > 0) {
      letras += `Y ${UNIDADES[unidad]}`;
    }
  } else {
    letras = UNIDADES[n];
  }

  return letras.trim();
}
