import { Fragment } from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { numeroALetras } from "@/shared/utils/number-to-letters";

// Interfaces estrictas para erradicar el tipo 'any'
export interface Asignatura {
  name: string;
  t1?: number | null;
  t2?: number | null;
  t3?: number | null;
  promedioAnual?: number | null;
}

export interface CampoSaberes {
  areaName: string;
  asignaturas: Asignatura[];
}

export interface LibretaStudent {
  rudeCode?: string | null;
  names: string;
  lastNamePaterno: string;
  lastNameMaterno: string;
}

export interface LibretaInstitution {
  name: string;
  rueCode?: string | null;
  district: string;
  department: string;
  dependencyType: string;
}

export interface LibretaClassroom {
  level: string;
  grade: string;
  section: string;
  shift: string;
}

export interface LibretaAcademicYear {
  year: number | string;
}

export interface BolivianLibretaData {
  student: LibretaStudent;
  institution: LibretaInstitution;
  classroom: LibretaClassroom;
  academicYear: LibretaAcademicYear;
  campos: CampoSaberes[];
}

export interface BolivianLibretaProps {
  data: BolivianLibretaData;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  headerLogo: { 
    width: 60, 
    height: 60, 
    borderWidth: 1, 
    borderColor: "#e5e7eb", 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f9fafb" 
  },
  logoText: { fontSize: 7, fontWeight: "bold", color: "#9ca3af" },
  headerCenter: { textAlign: "center", flex: 1, paddingHorizontal: 10 },
  titleMain: { fontSize: 13, fontWeight: "bold", marginBottom: 5, letterSpacing: 0.5 },
  titleSub: { fontSize: 9, fontWeight: "bold", color: "#374151" },
  headerDetails: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, fontSize: 8 },
  detailsColumn: { flexDirection: "column", width: "32%" },
  detailRow: { flexDirection: "row", marginBottom: 3 },
  labelBold: { fontWeight: "bold", color: "#1f2937" },
  table: { width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#000000", borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
    padding: 5,
    textAlign: "center",
  },
  tableColArea: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColSubject: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColTrim: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "center",
  },
  tableColProm: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "center",
    backgroundColor: "#eef2ff",
  },
  tableColLiteral: {
    width: "18%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 6.5,
  },
  tableCell: { margin: "auto", marginTop: 2, fontSize: 7 },
  signatures: { flexDirection: "row", justifyContent: "space-around", marginTop: 50 },
  signBox: { borderTopWidth: 1, borderTopColor: "#000000", width: 140, textAlign: "center", paddingTop: 5, fontSize: 7 },
});

export const BolivianLibreta = ({ data }: BolivianLibretaProps) => {
  const student = data?.student || { names: "", lastNamePaterno: "", lastNameMaterno: "", rudeCode: "" };
  const institution = data?.institution || { name: "", rueCode: "", district: "", department: "", dependencyType: "" };
  const classroom = data?.classroom || { level: "", grade: "", section: "", shift: "" };
  const academicYear = data?.academicYear || { year: "" };
  const campos = data?.campos || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CABECERA (Como en la foto) */}
        <View style={styles.header}>
          <View style={styles.headerLogo}>
            <Text style={styles.logoText}>ESCUDO</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.titleMain}>Libreta Escolar Electrónica</Text>
            <Text style={styles.titleSub}>
              Educación {classroom.level || "Primaria"} Comunitaria Vocacional
            </Text>
          </View>
          <View style={styles.headerLogo}>
            <Text style={styles.logoText}>QR RUDE</Text>
          </View>
        </View>

        {/* DETALLES DE ENCABEZADO */}
        <View style={styles.headerDetails}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Código RUDE: </Text>
              <Text>{student.rudeCode || "-"}</Text>
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Apellidos y Nombres: </Text>
              <Text>
                {`${student.lastNamePaterno || ""} ${student.lastNameMaterno || ""} ${student.names || ""}`.trim()}
              </Text>
            </Text>
          </View>

          <View style={styles.detailsColumn}>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Unidad Educativa: </Text>
              <Text>{`${institution.rueCode || ""} - ${institution.name || ""}`}</Text>
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Distrito Educativo: </Text>
              <Text>{institution.district || "-"}</Text>
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Turno: </Text>
              <Text>{classroom.shift || "-"}</Text>
            </Text>
          </View>

          <View style={styles.detailsColumn}>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Departamento: </Text>
              <Text>{institution.department || "-"}</Text>
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Dependencia: </Text>
              <Text>{institution.dependencyType || "-"}</Text>
            </Text>
            <Text style={styles.detailRow}>
              <Text style={styles.labelBold}>Gestión: </Text>
              <Text>{academicYear.year || "-"}</Text>
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={styles.labelBold}>
            Año de Escolaridad:{" "}
            <Text style={{ fontWeight: "normal" }}>
              {`${classroom.grade || ""} "${classroom.section || ""}"`}
            </Text>
          </Text>
        </View>

        {/* TABLA PRINCIPAL DE SABERES Y ÁREAS CURRICULARES */}
        <View style={styles.table}>
          {/* Encabezados de la Tabla Nivel 1 */}
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableColArea, width: "40%", backgroundColor: "#f3f4f6", textAlign: "center" }}>
              <Text style={styles.tableCell}>Campos de Saberes / Áreas Curriculares</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: "24%" }}>
              <Text style={styles.tableCell}>Evaluación</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: "26%" }}>
              <Text style={styles.tableCell}>Valoración Cuantitativa</Text>
            </View>
          </View>
          
          {/* Encabezados de la Tabla Nivel 2 */}
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableColArea, width: "15%", backgroundColor: "#f9fafb" }}>
              <Text style={styles.tableCell}>Campo</Text>
            </View>
            <View style={{ ...styles.tableColSubject, backgroundColor: "#f9fafb" }}>
              <Text style={styles.tableCell}>Área</Text>
            </View>
            <View style={styles.tableColTrim}>
              <Text style={styles.tableCell}>1er Trim</Text>
            </View>
            <View style={styles.tableColTrim}>
              <Text style={styles.tableCell}>2do Trim</Text>
            </View>
            <View style={styles.tableColTrim}>
              <Text style={styles.tableCell}>3er Trim</Text>
            </View>
            <View style={styles.tableColProm}>
              <Text style={styles.tableCell}>Prom Anual</Text>
            </View>
            <View style={styles.tableColLiteral}>
              <Text style={styles.tableCell}>Valoración Literal</Text>
            </View>
          </View>

          {/* Filas de Datos de Calificaciones */}
          {campos.map((campo, index) => (
            <Fragment key={`campo-${index}`}>
              {campo.asignaturas.map((asig, idx) => (
                <View style={styles.tableRow} key={`${campo.areaName}-${asig.name}`}>
                  {/* Solo mostramos el nombre del campo en la primera asignatura del grupo */}
                  <View style={styles.tableColArea}>
                    <Text style={styles.tableCell}>{idx === 0 ? campo.areaName : ""}</Text>
                  </View>
                  <View style={styles.tableColSubject}>
                    <Text style={styles.tableCell}>{asig.name}</Text>
                  </View>
                  <View style={styles.tableColTrim}>
                    <Text style={styles.tableCell}>{asig.t1 ?? "-"}</Text>
                  </View>
                  <View style={styles.tableColTrim}>
                    <Text style={styles.tableCell}>{asig.t2 ?? "-"}</Text>
                  </View>
                  <View style={styles.tableColTrim}>
                    <Text style={styles.tableCell}>{asig.t3 ?? "-"}</Text>
                  </View>
                  <View style={styles.tableColProm}>
                    <Text style={styles.tableCell}>{asig.promedioAnual ?? "-"}</Text>
                  </View>
                  <View style={styles.tableColLiteral}>
                    <Text style={styles.tableCell}>
                      {asig.promedioAnual !== null && asig.promedioAnual !== undefined 
                        ? numeroALetras(asig.promedioAnual) 
                        : "-"}
                    </Text>
                  </View>
                </View>
              ))}
            </Fragment>
          ))}
        </View>

        {/* ZONA DE FIRMAS */}
        <View style={styles.signatures}>
          <View style={styles.signBox}>
            <Text>Sello Unidad Educativa</Text>
          </View>
          <View style={styles.signBox}>
            <Text>Firma Director(a)</Text>
          </View>
          <View style={styles.signBox}>
            <Text>Firma Maestra/o</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
