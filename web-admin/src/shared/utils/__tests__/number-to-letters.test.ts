import { describe, it, expect } from "vitest";
import { numeroALetras } from "../number-to-letters";

describe("numeroALetras utility", () => {
  it("should return empty string for null and undefined", () => {
    expect(numeroALetras(null)).toBe("");
    expect(numeroALetras(undefined)).toBe("");
  });

  it("should handle boundary cases 0 and 100", () => {
    expect(numeroALetras(0)).toBe("CERO");
    expect(numeroALetras(100)).toBe("CIEN");
  });

  it("should translate single digits correctly", () => {
    expect(numeroALetras(1)).toBe("UNO");
    expect(numeroALetras(5)).toBe("CINCO");
    expect(numeroALetras(9)).toBe("NUEVE");
  });

  it("should translate values from 10 to 29 correctly", () => {
    expect(numeroALetras(10)).toBe("DIEZ");
    expect(numeroALetras(11)).toBe("ONCE");
    expect(numeroALetras(15)).toBe("QUINCE");
    expect(numeroALetras(20)).toBe("VEINTE");
    expect(numeroALetras(24)).toBe("VEINTICUATRO");
    expect(numeroALetras(29)).toBe("VEINTINUEVE");
  });

  it("should translate values from 30 to 99 correctly", () => {
    expect(numeroALetras(30)).toBe("TREINTA");
    expect(numeroALetras(31)).toBe("TREINTA Y UNO");
    expect(numeroALetras(45)).toBe("CUARENTA Y CINCO");
    expect(numeroALetras(78)).toBe("SETENTA Y OCHO");
    expect(numeroALetras(99)).toBe("NOVENTA Y NUEVE");
  });

  it("should handle floating point inputs by flooring them", () => {
    expect(numeroALetras(85.6)).toBe("OCHENTA Y CINCO");
    expect(numeroALetras(10.2)).toBe("DIEZ");
  });
});
