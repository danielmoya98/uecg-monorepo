import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ============================================================================
// ESTILOS NATIVOS PARA REACT-PDF (A4, Alta Densidad)
// ============================================================================
const styles = StyleSheet.create({
    page: { padding: 15, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
    mainBox: { border: "1.5pt solid #000", flexGrow: 1, padding: 4, display: "flex", flexDirection: "column" },
    row: { display: "flex", flexDirection: "row" },

    // Tipografía
    textXxs: { fontSize: 4.5 },
    textXs: { fontSize: 5.5 },
    textSm: { fontSize: 6.5 },
    textMd: { fontSize: 8 },
    textLg: { fontSize: 10 },
    textXl: { fontSize: 12 },
    fontBold: { fontFamily: "Helvetica-Bold" },
    textCenter: { textAlign: "center" },
    textRight: { textAlign: "right" },
    uppercase: { textTransform: "uppercase" },

    // Utilidades de Layout
    w100: { width: "100%" },
    w70: { width: "70%" },
    w60: { width: "60%" },
    w50: { width: "50%" },
    w40: { width: "40%" },
    w33: { width: "33.33%" },
    w30: { width: "30%" },
    w25: { width: "25%" },
    w20: { width: "20%" },
    bAll: { border: "1pt solid #000" },
    bTop: { borderTop: "1pt solid #000" },
    bBottom: { borderBottom: "1pt solid #000" },
    bLeft: { borderLeft: "1pt solid #000" },
    bRight: { borderRight: "1pt solid #000" },
    bgGray: { backgroundColor: "#e5e7eb" },
    bgLight: { backgroundColor: "#f9f9f9" },
    p1: { padding: 2 },
    p2: { padding: 4 },
    p3: { padding: 6 },

    // Cabeceras y Cajas
    sectionHeader: {
        backgroundColor: "#e6e6e6",
        borderTop: "1pt solid #000",
        borderBottom: "1pt solid #000",
        paddingHorizontal: 4,
        paddingVertical: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
    boxInput: {
        border: "1pt solid #000",
        padding: 2,
        backgroundColor: "#FFF",
        display: "flex",
        flexDirection: "column",
        minHeight: 18,
        justifyContent: "space-between",
    },
    boxLabel: { fontSize: 5.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
    boxValue: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", textAlign: "center" },

    // Checkboxes
    checkboxRow: { display: "flex", flexDirection: "row", alignItems: "center", marginRight: 6, marginBottom: 2 },
    checkboxBox: {
        width: 8,
        height: 8,
        border: "1pt solid #000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 3,
        backgroundColor: "#FFF",
    },
    checkboxMark: { fontSize: 6, fontFamily: "Helvetica-Bold" },
    checkboxLabel: { fontSize: 5.5, textTransform: "uppercase" },

    headerBorder: { border: "1pt dashed #9ca3af", display: "flex", justifyContent: "center", alignItems: "center" },
});

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================
const SectionHeader = ({ num, title }: { num: string; title: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
            {num}. {title}
        </Text>
    </View>
);

const BoxInput = ({ label, value, style }: { label: string; value?: string | null; style?: any }) => (
    <View style={[styles.boxInput, style]}>
        <Text style={styles.boxLabel}>{label}</Text>
        <Text style={styles.boxValue}>{value || " "}</Text>
    </View>
);

const CheckBox = ({ label, checked }: { label: string; checked?: boolean }) => (
    <View style={styles.checkboxRow}>
        <View style={styles.checkboxBox}>{checked && <Text style={styles.checkboxMark}>X</Text>}</View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
);

// ============================================================================
// PLANTILLA PRINCIPAL
// ============================================================================
interface Props {
    data: any;
}

export default function RudePdfTemplate({ data }: Props) {
    if (!data)
        return (
            <Document>
                <Page>
                    <Text>Error cargando datos</Text>
                </Page>
            </Document>
        );

    const s = data.student || {};
    const r = data.rudeRecord || {};

    const getGuardian = (rel: string) => s.guardians?.find((g: any) => g.relationship === rel) || {};
    const padre = getGuardian("PADRE");
    const madre = getGuardian("MADRE");
    const tutor = getGuardian("TUTOR");
    const tutorExtra = getGuardian("TUTOR_EXTRAORDINARIO");

    const bDate = s.birthDate ? new Date(s.birthDate) : null;
    const bDay = bDate ? String(bDate.getUTCDate()).padStart(2, "0") : "";
    const bMonth = bDate ? String(bDate.getUTCMonth() + 1).padStart(2, "0") : "";
    const bYear = bDate ? String(bDate.getUTCFullYear()) : "";

    return (
        <Document>
            {/* ===================================================================== */}
            {/* PÁGINA 1: ANVERSO */}
            {/* ===================================================================== */}
            <Page size="A4" style={styles.page}>
                <View style={styles.mainBox}>
                    {/* CABECERA */}
                    <View style={[styles.row, { marginBottom: 4, alignItems: "center" }]}>
                        <View style={[styles.w20, { height: 40 }, styles.headerBorder]}>
                            <Text style={styles.textXs}>ESCUDO BOLIVIA</Text>
                        </View>
                        <View style={[styles.w60, styles.textCenter]}>
                            <Text style={[styles.textLg, styles.fontBold, styles.uppercase]}>
                                Formulario de Inscripción/Actualización
                            </Text>
                            <Text style={[styles.textXl, styles.fontBold, styles.uppercase]}>
                                Registro Único de Estudiantes
                            </Text>
                            <Text style={[styles.textMd, styles.fontBold]}>Resolución Ministerial N° 0684/2025</Text>
                            <Text style={[styles.textXxs, styles.fontBold, { marginTop: 4 }]}>
                                LA INFORMACIÓN RECABADA POR EL RUDE ES CONSIDERADA COMO UNA DECLARACIÓN JURADA...
                            </Text>
                        </View>
                        <View style={styles.w20} />
                    </View>
                    <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                        Importante: El formulario debe ser llenado por el padre, madre o tutor(a)... (* Llenado por UE |
                        ** Req. Documento)
                    </Text>

                    {/* I. DATOS UE */}
                    <SectionHeader num="I" title="DATOS DE LA UNIDAD EDUCATIVA" />
                    <View style={[styles.row, { marginBottom: 2 }]}>
                        <BoxInput
                            label="(**) CÓDIGO SIE DE LA UNIDAD EDUCATIVA"
                            value="80730145"
                            style={{ width: "30%", borderRightWidth: 0 }}
                        />
                        <BoxInput
                            label="NOMBRE DE LA UNIDAD EDUCATIVA"
                            value="ERNESTO CHE GUEVARA"
                            style={{ width: "70%" }}
                        />
                    </View>

                    {/* II. ESTUDIANTE */}
                    <SectionHeader num="II" title="DATOS DE LA O EL ESTUDIANTE" />

                    {/* 2.1 NOMBRES y 2.5.1 DOC EXTRANJERO */}
                    <View style={[styles.row, styles.bAll, { borderBottomWidth: 0 }]}>
                        <View style={[styles.w70, styles.bRight, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                (+) 2.1 APELLIDO(S) Y NOMBRE(S)
                            </Text>
                            <View style={[styles.row, { marginBottom: 1, alignItems: "center" }]}>
                                <Text style={[styles.textXs, styles.textRight, { width: "25%", paddingRight: 2 }]}>
                                    Ap. Paterno
                                </Text>
                                <BoxInput label="" value={s.lastNamePaterno} style={{ width: "75%", minHeight: 12 }} />
                            </View>
                            <View style={[styles.row, { marginBottom: 1, alignItems: "center" }]}>
                                <Text style={[styles.textXs, styles.textRight, { width: "25%", paddingRight: 2 }]}>
                                    Ap. Materno
                                </Text>
                                <BoxInput label="" value={s.lastNameMaterno} style={{ width: "75%", minHeight: 12 }} />
                            </View>
                            <View style={[styles.row, { alignItems: "center" }]}>
                                <Text style={[styles.textXs, styles.textRight, { width: "25%", paddingRight: 2 }]}>
                                    Nombre(s)
                                </Text>
                                <BoxInput label="" value={s.names} style={{ width: "75%", minHeight: 12 }} />
                            </View>
                        </View>
                        <View style={[styles.w30, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                (+) 2.5.1 SOLO EXTRANJEROS: DOC.
                            </Text>
                            <CheckBox label="DNI" checked={s.documentType === "DNI"} />
                            <CheckBox label="Cédula Extranjero" checked={s.documentType === "PASAPORTE"} />
                            <Text style={[styles.textXs, styles.fontBold, { marginTop: 4 }]}>
                                (**) 2.5.2 CÓDIGO DOC EXTRANJERO
                            </Text>
                            <BoxInput
                                label=""
                                value={s.documentType !== "CI" ? s.ci : ""}
                                style={{ minHeight: 14, marginTop: 1 }}
                            />
                        </View>
                    </View>

                    {/* 2.2 NACIMIENTO Y 2.6 RUDE */}
                    <View style={[styles.row, styles.bAll]}>
                        <View style={[styles.w70, styles.bRight, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                2.2 LUGAR DE NACIMIENTO
                            </Text>
                            <View style={styles.row}>
                                <BoxInput label="País" value={s.birthCountry} style={[styles.w25]} />
                                <BoxInput
                                    label="Depto."
                                    value={s.birthDepartment}
                                    style={[styles.w25, { borderLeftWidth: 0 }]}
                                />
                                <BoxInput
                                    label="Provincia"
                                    value={s.birthProvince}
                                    style={[styles.w25, { borderLeftWidth: 0 }]}
                                />
                                <BoxInput
                                    label="Localidad"
                                    value={s.birthLocality}
                                    style={[styles.w25, { borderLeftWidth: 0 }]}
                                />
                            </View>
                        </View>
                        <View style={[styles.w30, styles.p1, { justifyContent: "flex-end" }]}>
                            <Text style={[styles.textXs, styles.fontBold]}>(*) 2.6 CÓDIGO RUDE</Text>
                            <View
                                style={[
                                    styles.bAll,
                                    styles.bgGray,
                                    { height: 20, justifyContent: "center", alignItems: "center", marginTop: 2 },
                                ]}
                            >
                                <Text style={[styles.textLg, styles.fontBold]}>{s.rudeCode}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 2.3 CERTIFICADO Y 2.4 FECHA */}
                    <View style={[styles.row, styles.bAll, { borderTopWidth: 0 }]}>
                        <View style={[styles.w60, styles.bRight, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                (**) 2.3 CERTIFICADO DE NACIMIENTO
                            </Text>
                            <View style={styles.row}>
                                <BoxInput label="Oficialía N°" value={s.certOficialia} style={styles.w25} />
                                <BoxInput
                                    label="Libro N°"
                                    value={s.certLibro}
                                    style={[styles.w25, { borderLeftWidth: 0 }]}
                                />
                                <BoxInput
                                    label="Partida N°"
                                    value={s.certPartida}
                                    style={[styles.w25, { borderLeftWidth: 0 }]}
                                />
                                <BoxInput
                                    label="Folio N°"
                                    value={s.certFolio}
                                    style={[styles.w25, { borderLeftWidth: 0 }]}
                                />
                            </View>
                        </View>
                        <View style={[styles.w40, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                2.4 FECHA DE NACIMIENTO
                            </Text>
                            <View style={styles.row}>
                                <BoxInput label="Día" value={bDay} style={styles.w33} />
                                <BoxInput label="Mes" value={bMonth} style={[styles.w33, { borderLeftWidth: 0 }]} />
                                <BoxInput label="Año" value={bYear} style={[styles.w33, { borderLeftWidth: 0 }]} />
                            </View>
                        </View>
                    </View>

                    {/* 2.5 CI Y 2.7 SEXO */}
                    <View style={[styles.row, styles.bAll, { borderTopWidth: 0, marginBottom: 2 }]}>
                        <View style={[styles.w60, styles.bRight, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                (+) 2.5 DOCUMENTO DE IDENTIFICACIÓN (Nacionales)
                            </Text>
                            <View style={styles.row}>
                                <BoxInput
                                    label="Nro. Cédula"
                                    value={s.documentType === "CI" ? s.ci : ""}
                                    style={styles.w60}
                                />
                                <BoxInput
                                    label="Comp."
                                    value={s.complement}
                                    style={[styles.w20, { borderLeftWidth: 0 }]}
                                />
                                <BoxInput
                                    label="Exp."
                                    value={s.expedition}
                                    style={[styles.w20, { borderLeftWidth: 0 }]}
                                />
                            </View>
                        </View>
                        <View style={[styles.w40, styles.p1, { justifyContent: "center" }]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 4 }]}>2.7 SEXO</Text>
                            <View style={[styles.row, { justifyContent: "space-around" }]}>
                                <CheckBox label="Masculino" checked={s.gender === "MASCULINO"} />
                                <CheckBox label="Femenino" checked={s.gender === "FEMENINO"} />
                            </View>
                        </View>
                    </View>

                    {/* 2.8 DISCAPACIDAD */}
                    <View style={[styles.bAll, styles.p1, { marginBottom: 2 }]}>
                        <View
                            style={[styles.row, styles.bBottom, { justifyContent: "space-between", paddingBottom: 2 }]}
                        >
                            <Text style={[styles.textXs, styles.fontBold]}>
                                2.8 ¿EL/LA ESTUDIANTE PRESENTA ALGUNA DISCAPACIDAD?
                            </Text>
                            <View style={styles.row}>
                                <CheckBox label="Sí (Pase a 2.8.1)" checked={s.hasDisability} />
                                <CheckBox label="No (Pase a 2.9)" checked={!s.hasDisability} />
                            </View>
                        </View>
                        <View style={[styles.row, { alignItems: "center", paddingVertical: 2 }]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginRight: 8 }]}>
                                (+) (**) 2.8.1 CARNET DISCAPACIDAD:
                            </Text>
                            <CheckBox label="CODEPEDIS" checked={s.disabilityRegistry === "CODEPEDIS"} />
                            <CheckBox label="IBC" checked={s.disabilityRegistry === "IBC"} />
                            <Text style={[styles.textXs, { marginLeft: 10 }]}>
                                {" "}
                                N°:{" "}
                                <Text style={[styles.fontBold, { borderBottom: "1pt solid #000" }]}>
                                    {" "}
                                    {s.disabilityCode || "          "}{" "}
                                </Text>
                            </Text>
                        </View>
                        <Text style={[styles.textXs, styles.fontBold, styles.bTop, { paddingTop: 2, marginBottom: 2 }]}>
                            (**) 2.8.2 TIPOS Y GRADOS DE DISCAPACIDAD:
                        </Text>
                        <View style={[styles.row, styles.bAll]}>
                            {["AUDITIVA", "VISUAL", "INTELECTUAL", "FÍSICA", "MENTAL", "MÚLTIPLE"].map((type, i) => {
                                const typeMap: Record<string, string> = {
                                    AUDITIVA: "AUDITIVA",
                                    VISUAL: "VISUAL",
                                    INTELECTUAL: "INTELECTUAL",
                                    FÍSICA: "FISICA_MOTORA",
                                    MENTAL: "MENTAL_PSIQUICA",
                                    MÚLTIPLE: "MULTIPLE",
                                };
                                const isMatch = s.disabilityType === typeMap[type];
                                return (
                                    <View key={type} style={[{ width: "16.66%" }, i < 5 ? styles.bRight : {}]}>
                                        <View style={[styles.bgGray, styles.bBottom, { padding: 1 }]}>
                                            <Text style={[styles.textXxs, styles.fontBold, styles.textCenter]}>
                                                {type}
                                            </Text>
                                        </View>
                                        <View style={{ padding: 2 }}>
                                            <CheckBox label="Leve" checked={isMatch && s.disabilityDegree === "LEVE"} />
                                            <CheckBox
                                                label="Moderado"
                                                checked={isMatch && s.disabilityDegree === "MODERADO"}
                                            />
                                            <CheckBox
                                                label="Grave"
                                                checked={isMatch && s.disabilityDegree === "GRAVE"}
                                            />
                                            <CheckBox
                                                label="Muy Grave"
                                                checked={isMatch && s.disabilityDegree === "MUY_GRAVE"}
                                            />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={[styles.row, styles.bTop, { marginTop: 2, paddingTop: 2 }]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginRight: 8 }]}>
                                2.8.3 LA DISCAPACIDAD ES:
                            </Text>
                            <CheckBox label="De Nacimiento" checked={s.disabilityOrigin === "DE_NACIMIENTO"} />
                            <CheckBox label="Adquirida" checked={s.disabilityOrigin === "ADQUIRIDA"} />
                        </View>
                    </View>

                    {/* 2.9, 2.10 y 2.11 */}
                    <View style={[styles.row, { marginBottom: 2 }]}>
                        {/* 2.9 TEA */}
                        <View style={[styles.w30, styles.bAll, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                (**) 2.9 ¿DIAGNÓSTICO TEA?
                            </Text>
                            <View style={[styles.row, { justifyContent: "space-between", marginBottom: 2 }]}>
                                <CheckBox label="Sí" checked={s.hasAutism} />
                                <CheckBox label="No" checked={!s.hasAutism} />
                            </View>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 1 }]}>2.9.1 TIPO TEA:</Text>
                            <View style={styles.row}>
                                <CheckBox label="Tipo 1" checked={s.autismType === "TIPO_1"} />
                                <CheckBox label="Tipo 2" checked={s.autismType === "TIPO_2"} />
                                <CheckBox label="Tipo 3" checked={s.autismType === "TIPO_3"} />
                            </View>
                        </View>
                        {/* 2.10 APRENDIZAJE */}
                        <View style={[styles.w40, styles.bAll, styles.p1, { marginLeft: 2 }]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 1 }]}>
                                (**) 2.10 DIFICULTAD APRENDIZAJE
                            </Text>
                            <View style={[styles.row, { flexWrap: "wrap" }]}>
                                <CheckBox label="Diag." checked={s.learningDisabilityStatus === "DIAGNOSTICO"} />
                                <CheckBox label="Inf." checked={s.learningDisabilityStatus === "INFORME"} />
                                <CheckBox
                                    label="Sin Diag."
                                    checked={s.learningDisabilityStatus === "SIN_DIAGNOSTICO"}
                                />
                                <CheckBox label="No" checked={s.learningDisabilityStatus === "NO"} />
                            </View>
                            <Text style={[styles.textXs, styles.fontBold, { marginTop: 1 }]}>TIPO:</Text>
                            <View style={[styles.row, { flexWrap: "wrap" }]}>
                                <CheckBox
                                    label="Lect/Esc"
                                    checked={s.learningDisabilityTypes?.includes("LECTURA_ESCRITURA")}
                                />
                                <CheckBox label="Razon" checked={s.learningDisabilityTypes?.includes("RAZONAMIENTO")} />
                                <CheckBox label="Calculo" checked={s.learningDisabilityTypes?.includes("CALCULO")} />
                            </View>
                        </View>
                        {/* 2.11 TALENTO */}
                        <View style={[styles.w30, styles.bAll, styles.p1, { marginLeft: 2 }]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                (**) 2.11 TALENTO EXTRAORDINARIO
                            </Text>
                            <View style={[styles.row, { justifyContent: "space-between", marginBottom: 2 }]}>
                                <CheckBox label="Sí" checked={s.hasExtraordinaryTalent} />
                                <CheckBox label="No" checked={!s.hasExtraordinaryTalent} />
                            </View>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 1 }]}>TIPO:</Text>
                            <View style={[styles.row, { flexWrap: "wrap" }]}>
                                <CheckBox label="Gral" checked={s.talentType === "GENERAL"} />
                                <CheckBox label="Espec" checked={s.talentType === "ESPECIFICO"} />
                                <CheckBox label="Doble" checked={s.talentType === "DOBLE_EXCEPCIONALIDAD"} />
                            </View>
                        </View>
                    </View>

                    {/* III. DIRECCIÓN */}
                    <SectionHeader num="III" title="DIRECCIÓN ACTUAL DE LA O EL ESTUDIANTE" />
                    <View style={[styles.bAll, { borderTopWidth: 0 }]}>
                        <View style={styles.row}>
                            <BoxInput
                                label="Departamento"
                                value={r.department}
                                style={[styles.w25, { borderRightWidth: 0, borderTopWidth: 0, borderLeftWidth: 0 }]}
                            />
                            <BoxInput
                                label="Provincia"
                                value={r.province}
                                style={[styles.w25, { borderRightWidth: 0, borderTopWidth: 0 }]}
                            />
                            <BoxInput
                                label="Municipio"
                                value={r.municipality}
                                style={[styles.w25, { borderRightWidth: 0, borderTopWidth: 0 }]}
                            />
                            <BoxInput
                                label="Localidad"
                                value={r.locality}
                                style={[styles.w25, { borderRightWidth: 0, borderTopWidth: 0 }]}
                            />
                        </View>
                        <View style={styles.row}>
                            <BoxInput
                                label="Zona/Villa"
                                value={r.zone}
                                style={[styles.w40, { borderRightWidth: 0, borderTopWidth: 0, borderLeftWidth: 0 }]}
                            />
                            <BoxInput
                                label="Avenida/Calle"
                                value={r.street}
                                style={[styles.w40, { borderRightWidth: 0, borderTopWidth: 0 }]}
                            />
                            <BoxInput
                                label="N° Vivienda"
                                value={r.houseNumber}
                                style={[styles.w20, { borderRightWidth: 0, borderTopWidth: 0 }]}
                            />
                        </View>
                        <View style={styles.row}>
                            <BoxInput
                                label=""
                                value=""
                                style={[
                                    styles.w50,
                                    {
                                        borderTopWidth: 0,
                                        borderLeftWidth: 0,
                                        borderRightWidth: 0,
                                        borderBottomWidth: 0,
                                    },
                                ]}
                            />
                            <BoxInput
                                label="Teléfono Fijo"
                                value={r.phone}
                                style={[
                                    styles.w25,
                                    {
                                        borderTopWidth: 0,
                                        borderRightWidth: 0,
                                        borderBottomWidth: 0,
                                        borderLeftWidth: "1pt solid #000",
                                    },
                                ]}
                            />
                            <BoxInput
                                label="Celular"
                                value={r.cellphone}
                                style={[styles.w25, { borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 0 }]}
                            />
                        </View>
                    </View>

                    <Text style={[styles.textXs, styles.fontBold, styles.textRight, { marginTop: "auto" }]}>
                        CONTINÚA AL REVERSO
                    </Text>
                </View>
            </Page>

            {/* ===================================================================== */}
            {/* PÁGINA 2: REVERSO */}
            {/* ===================================================================== */}
            <Page size="A4" style={styles.page}>
                <View style={styles.mainBox}>
                    <SectionHeader num="IV" title="ASPECTOS SOCIOECONÓMICOS DE LA O EL ESTUDIANTE" />

                    {/* 4.1 y 4.2 */}
                    <View style={[styles.row, styles.bAll, { borderTopWidth: 0, marginBottom: 2 }]}>
                        <View style={[styles.w40, styles.bRight, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>
                                4.1 IDIOMA Y AUTOIDENTIFICACIÓN
                            </Text>
                            <BoxInput label="4.1.1 Idioma niñez" value={r.nativeLanguage} style={{ marginBottom: 2 }} />
                            <BoxInput
                                label="4.1.2 Idiomas frecuentes"
                                value={r.frequentLanguages?.join(", ")}
                                style={{ marginBottom: 2 }}
                            />
                            <BoxInput label="(+) 4.1.3 Nación/Pueblo Indígena" value={r.culturalIdentity} />
                        </View>
                        <View style={[styles.w60, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 2 }]}>4.2 SALUD</Text>
                            <View style={[styles.row, { justifyContent: "space-between", marginBottom: 2 }]}>
                                <Text style={styles.textXs}>4.2.1 ¿Centro de Salud cerca?</Text>
                                <View style={styles.row}>
                                    <CheckBox label="Sí" checked={r.nearestHealthCenter} />
                                    <CheckBox label="No" checked={!r.nearestHealthCenter} />
                                </View>
                            </View>

                            <Text style={[styles.textXs, styles.fontBold, styles.bTop, { paddingTop: 2 }]}>
                                4.2.2 El año pasado acudió a:
                            </Text>
                            <View style={[styles.row, { flexWrap: "wrap", marginBottom: 2 }]}>
                                <View style={styles.w33}>
                                    <CheckBox label="1. SUS" checked={r.healthCareLocations?.includes("SUS")} />
                                    <CheckBox
                                        label="2. Caja Salud"
                                        checked={r.healthCareLocations?.includes("OTRA_CAJA")}
                                    />
                                    <CheckBox label="3. Público" checked={r.healthCareLocations?.includes("PUBLICO")} />
                                </View>
                                <View style={styles.w33}>
                                    <CheckBox label="4. Privado" checked={r.healthCareLocations?.includes("PRIVADO")} />
                                    <CheckBox
                                        label="5. Vivienda"
                                        checked={r.healthCareLocations?.includes("VIVIENDA")}
                                    />
                                    <CheckBox
                                        label="6. Tradicional"
                                        checked={r.healthCareLocations?.includes("TRADICIONAL")}
                                    />
                                </View>
                                <View style={styles.w33}>
                                    <CheckBox
                                        label="7. Farmacia"
                                        checked={r.healthCareLocations?.includes("FARMACIA")}
                                    />
                                </View>
                            </View>

                            <View style={[styles.row, styles.bTop, { paddingTop: 2, justifyContent: "space-between" }]}>
                                <Text style={styles.textXs}>4.2.3 Veces que acudió:</Text>
                                <View style={styles.row}>
                                    <CheckBox label="1 a 2" checked={r.healthCenterVisits === "1_A_2"} />
                                    <CheckBox label="3 a 5" checked={r.healthCenterVisits === "3_A_5"} />
                                    <CheckBox label="6+" checked={r.healthCenterVisits === "6_MAS"} />
                                    <CheckBox label="0" checked={r.healthCenterVisits === "NINGUNA"} />
                                </View>
                            </View>
                            <View style={[styles.row, styles.bTop, { paddingTop: 2, justifyContent: "space-between" }]}>
                                <Text style={styles.textXs}>4.2.4 ¿Tiene seguro de salud?</Text>
                                <View style={styles.row}>
                                    <CheckBox label="Sí" checked={r.healthInsurance} />
                                    <CheckBox label="No" checked={!r.healthInsurance} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 4.3 y 4.4 */}
                    <View style={[styles.bAll, styles.p1, { marginBottom: 2 }]}>
                        <Text
                            style={[
                                styles.textXs,
                                styles.fontBold,
                                styles.bgGray,
                                styles.bBottom,
                                { padding: 1, marginBottom: 2 },
                            ]}
                        >
                            4.3 SERVICIOS BÁSICOS / 4.4 INTERNET
                        </Text>
                        <View style={[styles.row, styles.bBottom, { paddingBottom: 2, marginBottom: 2 }]}>
                            <View style={styles.w25}>
                                <View style={styles.row}>
                                    <Text style={[styles.textXs, styles.fontBold]}>Agua: </Text>
                                    <CheckBox label="Sí" checked={r.water} />
                                    <CheckBox label="No" checked={!r.water} />
                                </View>
                            </View>
                            <View style={styles.w25}>
                                <View style={styles.row}>
                                    <Text style={[styles.textXs, styles.fontBold]}>Baño: </Text>
                                    <CheckBox label="Sí" checked={r.bathroom} />
                                    <CheckBox label="No" checked={!r.bathroom} />
                                </View>
                            </View>
                            <View style={styles.w25}>
                                <View style={styles.row}>
                                    <Text style={[styles.textXs, styles.fontBold]}>Alcant: </Text>
                                    <CheckBox label="Sí" checked={r.sewage} />
                                    <CheckBox label="No" checked={!r.sewage} />
                                </View>
                            </View>
                            <View style={styles.w25}>
                                <View style={styles.row}>
                                    <Text style={[styles.textXs, styles.fontBold]}>Luz: </Text>
                                    <CheckBox label="Sí" checked={r.electricity} />
                                    <CheckBox label="No" checked={!r.electricity} />
                                </View>
                            </View>
                        </View>
                        <View style={[styles.row, styles.bBottom, { paddingBottom: 2, marginBottom: 2 }]}>
                            <View style={styles.w50}>
                                <View style={styles.row}>
                                    <Text style={[styles.textXs, styles.fontBold]}>Basura: </Text>
                                    <CheckBox label="Sí" checked={r.garbage} />
                                    <CheckBox label="No" checked={!r.garbage} />
                                </View>
                            </View>
                            <View style={styles.w50}>
                                <View style={styles.row}>
                                    <Text style={[styles.textXs, styles.fontBold]}>Tipo Vivienda: </Text>
                                    <Text style={[styles.textXs, styles.uppercase]}>{r.housingType}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.w50, styles.bRight, { paddingRight: 2 }]}>
                                <Text style={[styles.textXs, styles.fontBold]}>4.4.1 Acceso a internet en:</Text>
                                <View style={styles.row}>
                                    <CheckBox label="Viv." checked={r.internetAccess?.includes("VIVIENDA")} />
                                    <CheckBox label="UE" checked={r.internetAccess?.includes("UNIDAD_EDUCATIVA")} />
                                    <CheckBox label="Pub." checked={r.internetAccess?.includes("LUGARES_PUBLICOS")} />
                                    <CheckBox label="Cel." checked={r.internetAccess?.includes("CELULAR")} />
                                </View>
                            </View>
                            <View style={[styles.w50, { paddingLeft: 4 }]}>
                                <Text style={[styles.textXs, styles.fontBold]}>4.4.2 Frecuencia de uso:</Text>
                                <View style={styles.row}>
                                    <CheckBox label="Diario" checked={r.internetFrequency === "DIARIAMENTE"} />
                                    <CheckBox label="1x Sem" checked={r.internetFrequency === "UNA_VEZ_SEMANA"} />
                                    <CheckBox label="+1x Sem" checked={r.internetFrequency === "MAS_UNA_VEZ_SEMANA"} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 4.5, 4.6, 4.7 */}
                    <View style={[styles.row, styles.bAll, { marginBottom: 2 }]}>
                        <View style={[styles.w100, styles.bBottom, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 1 }]}>
                                (+) 4.5 ACTIVIDAD LABORAL
                            </Text>
                            <View style={styles.row}>
                                <Text style={styles.textXs}>¿Trabajó? </Text>
                                <CheckBox label="Sí" checked={r.didWork === "SI"} />
                                <CheckBox label="No" checked={r.didWork === "NO"} />
                                <Text style={[styles.textXs, styles.bLeft, { paddingLeft: 4, marginLeft: 2 }]}>
                                    Meses: <Text style={styles.uppercase}>{r.workedMonths?.join(", ")}</Text>
                                </Text>
                                <Text style={[styles.textXs, styles.bLeft, { paddingLeft: 4, marginLeft: 2 }]}>
                                    Actividad: <Text style={styles.uppercase}>{r.workType}</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.row, styles.bAll, { borderTopWidth: 0, marginBottom: 4 }]}>
                        <View style={[styles.w50, styles.bRight, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 1 }]}>
                                4.6 TRANSPORTE A LA U.E.
                            </Text>
                            <Text style={[styles.textXs, { marginBottom: 1 }]}>
                                Medio: <Text style={styles.uppercase}>{r.transportType?.replace(/_/g, " ")}</Text>
                            </Text>
                            <Text style={styles.textXs}>
                                Tiempo: <Text style={styles.uppercase}>{r.transportTime?.replace(/_/g, " ")}</Text>
                            </Text>
                        </View>
                        <View style={[styles.w50, styles.p1]}>
                            <Text style={[styles.textXs, styles.fontBold, { marginBottom: 1 }]}>
                                (+) 4.7 ABANDONO GESTIÓN ANTERIOR
                            </Text>
                            <View style={[styles.row, { marginBottom: 1 }]}>
                                <Text style={styles.textXs}>¿Abandonó? </Text>
                                <CheckBox label="Sí" checked={r.abandonedLastYear} />
                                <CheckBox label="No" checked={!r.abandonedLastYear} />
                            </View>
                            <Text style={styles.textXs}>
                                Razones: <Text style={styles.uppercase}>{r.abandonReasons?.join(", ")}</Text>
                            </Text>
                        </View>
                    </View>

                    {/* V. DATOS PADRES / TUTORES */}
                    <SectionHeader num="V" title="DATOS DEL PADRE, MADRE O TUTOR (A) DE LA O EL ESTUDIANTE" />
                    <View style={[styles.bAll, styles.bgLight, styles.p1, { borderTopWidth: 0, marginBottom: 2 }]}>
                        <Text style={[styles.textXs, styles.fontBold]}>
                            (+) 5.1 EL/LA ESTUDIANTE VIVE CON:{" "}
                            <Text style={styles.uppercase}>{r.livesWith?.replace(/_/g, " ")}</Text>
                        </Text>
                    </View>

                    <View style={[styles.row, { gap: 4, marginBottom: 4 }]}>
                        {/* PADRE */}
                        <View style={[styles.w50, styles.bAll]}>
                            <View style={[styles.bgGray, styles.bBottom, styles.p1]}>
                                <Text style={[styles.textXs, styles.fontBold]}>5.2 DATOS DEL PADRE</Text>
                            </View>
                            <View style={styles.p1}>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>C.I.</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>
                                        {padre.ci} {padre.expedition}
                                    </Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Apellidos</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>
                                        {padre.lastNamePaterno} {padre.lastNameMaterno}
                                    </Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Nombres</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>{padre.names}</Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Ocupación</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>{padre.occupation}</Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Celular</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>{padre.phone}</Text>
                                </View>
                            </View>
                        </View>
                        {/* MADRE */}
                        <View style={[styles.w50, styles.bAll]}>
                            <View style={[styles.bgGray, styles.bBottom, styles.p1]}>
                                <Text style={[styles.textXs, styles.fontBold]}>5.3 DATOS DE LA MADRE</Text>
                            </View>
                            <View style={styles.p1}>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>C.I.</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>
                                        {madre.ci} {madre.expedition}
                                    </Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Apellidos</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>
                                        {madre.lastNamePaterno} {madre.lastNameMaterno}
                                    </Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Nombres</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>{madre.names}</Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Ocupación</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>{madre.occupation}</Text>
                                </View>
                                <View style={[styles.row, { marginBottom: 1 }]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Celular</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>{madre.phone}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* TUTOR EXTRA */}
                    {(tutor.names || tutorExtra.names) && (
                        <View style={[styles.bAll, { marginBottom: 4 }]}>
                            <View style={[styles.bgGray, styles.bBottom, styles.p1]}>
                                <Text style={[styles.textXs, styles.fontBold]}>
                                    5.4 / 5.5 DATOS DEL TUTOR(A) / TUTOR EXTRAORDINARIO
                                </Text>
                            </View>
                            <View style={[styles.row, styles.p1]}>
                                <View style={[styles.w50, styles.row]}>
                                    <Text style={[styles.w30, styles.textXxs]}>Nombre Comp.</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>
                                        {tutorExtra.names
                                            ? `${tutorExtra.lastNamePaterno} ${tutorExtra.names}`
                                            : `${tutor.lastNamePaterno} ${tutor.names}`}
                                    </Text>
                                </View>
                                <View style={[styles.w25, styles.row]}>
                                    <Text style={[styles.w30, styles.textXxs]}>CI/Cel</Text>
                                    <Text style={[styles.w70, styles.textXs, styles.fontBold]}>
                                        {tutorExtra.ci || tutor.ci} / {tutorExtra.phone || tutor.phone}
                                    </Text>
                                </View>
                                <View style={[styles.w25, styles.row]}>
                                    <Text style={[styles.w40, styles.textXxs]}>Parentesco</Text>
                                    <Text style={[styles.w60, styles.textXs, styles.fontBold]}>
                                        {tutorExtra.names ? tutorExtra.jobTitle : "TUTOR"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* FIRMAS Y SELLO */}
                    <View
                        style={[
                            styles.row,
                            {
                                marginTop: "auto",
                                paddingTop: 30,
                                borderTop: "2pt solid #000",
                                justifyContent: "space-around",
                            },
                        ]}
                    >
                        <View style={{ alignItems: "center" }}>
                            <View style={{ width: 150, borderTop: "1pt solid #000", marginBottom: 2 }} />
                            <Text style={styles.textMd}>Firma del padre/madre o tutor</Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <View style={{ width: 150, borderTop: "1pt solid #000", marginBottom: 2 }} />
                            <Text style={styles.textMd}>Sello y Firma del Director(a)</Text>
                        </View>
                    </View>

                    <Text style={[styles.textXs, styles.fontBold, styles.textCenter, { marginTop: 10 }]}>
                        FIN DEL FORMULARIO - GENERADO POR SISTEMA U.E.C.G.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
