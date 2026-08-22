import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RootMetricsWidget from "../root-metrics-widget";
import GlobalMetricsWidget from "../global-metrics-widget";
import TeacherMetricsWidget from "../teacher-metrics-widget";
import type { RootStats, GlobalStats, TeacherStats } from "../../types/dashboard.types";

// Mock de @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="mock-link">{children}</a>
  )
}))

const mockRootStats: RootStats = {
  accounts: 42,
  roles: 5,
  dbSize: "128 MB",
  status: "ONLINE",
  latency: "15ms",
};

const mockGlobalStats: GlobalStats = {
  students: 1200,
  teachers: 60,
  classrooms: 32,
  lastSync: "17/06/2026 09:30",
};

const mockTeacherStats: TeacherStats = {
  nextClassTime: "09:00",
  nextSubject: "Química",
  nextGroup: "5to A",
  studentsCount: 38,
  attendanceStatus: "Al día",
  currentTrimester: "2do Trimestre",
};

describe("Dashboard Module - Presentational Widgets Tests", () => {
  describe("RootMetricsWidget", () => {
    it("debe renderizar el estado de carga (loader) correctamente", () => {
      render(<RootMetricsWidget stats={undefined} isLoading={true} />);
      const loaders = screen.getAllByRole("region");
      // 1 contenedor section + 4 tarjetas métricas = 5 regiones
      expect(loaders).toHaveLength(5);
      loaders.slice(1).forEach(loader => {
        expect(loader.querySelector(".animate-spin")).toBeInTheDocument();
      });
    });

    it("debe renderizar las métricas root con datos simulados", () => {
      render(<RootMetricsWidget stats={mockRootStats} isLoading={false} />);
      expect(screen.getByText("Centro de Mando")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("128 MB")).toBeInTheDocument();
      expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();
      expect(screen.getByText("Latencia: 15ms")).toBeInTheDocument();
    });
  });

  describe("GlobalMetricsWidget", () => {
    it("debe renderizar el estado de carga (loader) correctamente", () => {
      render(<GlobalMetricsWidget stats={undefined} isLoading={true} />);
      const loaders = screen.getAllByRole("region");
      // 1 contenedor section + 4 tarjetas métricas = 5 regiones
      expect(loaders).toHaveLength(5);
    });

    it("debe renderizar las métricas globales con datos simulados", () => {
      render(<GlobalMetricsWidget stats={mockGlobalStats} isLoading={false} />);
      expect(screen.getByText("Estado del Colegio")).toBeInTheDocument();
      expect(screen.getByText("1200")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument();
      expect(screen.getByText("32")).toBeInTheDocument();
      expect(screen.getByText("Última Act.: 17/06/2026 09:30")).toBeInTheDocument();
    });
  });

  describe("TeacherMetricsWidget", () => {
    it("debe renderizar las métricas de profesor con datos simulados", () => {
      render(<TeacherMetricsWidget stats={mockTeacherStats} isLoading={false} />);
      expect(screen.getByText("Panel Docente")).toBeInTheDocument();
      expect(screen.getByText("09:00")).toBeInTheDocument();
      expect(screen.getByText(/Química/i)).toBeInTheDocument();
      expect(screen.getByText("38")).toBeInTheDocument();
      expect(screen.getByText("Al día")).toBeInTheDocument();
      expect(screen.getByText("2do Trimestre")).toBeInTheDocument();
      expect(screen.getByText("Tomar Asistencia")).toBeInTheDocument();
      expect(screen.getByText("Libreta Escolar")).toBeInTheDocument();
    });
  });
});
