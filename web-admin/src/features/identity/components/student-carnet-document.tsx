import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Student, Enrollment } from '../types/identity.types'

// Formato CR80 (Tamaño Carnet Estándar PVC: 54mm x 86mm)
const CARNET_SIZE: [number, number] = [153, 243]

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  // =====================================
  // ESTILOS: ANVERSO (FRONT) - SIN FOTO
  // =====================================
  headerFront: {
    backgroundColor: '#000060',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottom: '3pt solid #2563EB',
  },
  schoolTitle: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'extrabold',
    letterSpacing: 1.5,
  },
  nameBox: {
    paddingHorizontal: 10,
    marginTop: 20, // Más margen superior ya que no hay foto
    alignItems: 'center',
  },
  shortName: {
    fontSize: 10, // Un poco más pequeño para evitar cortes con guiones
    fontWeight: 'extrabold',
    color: '#0F172A',
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  courseBox: {
    backgroundColor: '#F8FAFC',
    borderTop: '1pt solid #E2E8F0',
    borderBottom: '1pt solid #E2E8F0',
    paddingVertical: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  courseText: {
    fontSize: 7.5,
    fontWeight: 'extrabold',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrContainer: {
    flex: 1, // Ocupa todo el espacio sobrante
    alignItems: 'center',
    justifyContent: 'center', // Centra el QR verticalmente
  },
  qrImage: {
    width: 85, // QR mucho más grande y legible
    height: 85,
  },
  footerBar: {
    backgroundColor: '#000060',
    height: 8,
    width: '100%',
  },

  // =====================================
  // ESTILOS: REVERSO (BACK)
  // =====================================
  backHeader: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottom: '1pt solid #E2E8F0',
  },
  backTitle: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 1,
  },
  detailsBox: {
    padding: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 4.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  divider: {
    borderBottom: '1pt solid #E2E8F0',
    marginVertical: 4,
  },
  rulesText: {
    fontSize: 4.5,
    color: '#64748B',
    textAlign: 'justify',
    lineHeight: 1.5,
    marginTop: 2,
  },
  signatureBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 8,
  },
  signatureLine: {
    width: 70,
    borderBottom: '1pt solid #94A3B8',
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 5,
    color: '#64748B',
    fontWeight: 'bold',
  },
  backFooter: {
    backgroundColor: '#000060',
    paddingVertical: 6,
    alignItems: 'center',
  },
  backFooterText: {
    fontSize: 5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
})

interface StudentCarnetDocumentProps {
  student: Student
  enrollment: Enrollment
  qrBase64: string
}

export const StudentCarnetDocument = ({
  student,
  enrollment,
  qrBase64,
}: StudentCarnetDocumentProps) => {
  const firstName = student?.names?.split(' ')[0] || ''
  const firstLastName = student?.lastNamePaterno || ''
  const shortName = `${firstName} ${firstLastName}`

  const fullName = `${student?.names} ${student?.lastNamePaterno} ${student?.lastNameMaterno || ''}`.trim()

  return (
    <Document>
      {/* CARA A: ANVERSO */}
      <Page size={CARNET_SIZE} style={styles.page}>
        <View style={styles.headerFront}>
          <Text style={styles.schoolTitle}>U.E. CHE GUEVARA</Text>
        </View>

        <View style={styles.nameBox}>
          <Text style={styles.shortName}>{shortName}</Text>
        </View>

        <View style={styles.courseBox}>
          <Text style={styles.courseText}>
            {enrollment?.classroom?.grade} "{enrollment?.classroom?.section}"{' '}
            {enrollment?.classroom?.level}
          </Text>
        </View>

        <View style={styles.qrContainer}>
          {/* Si qrBase64 existe, pinta la imagen. Si no, no pinta nada pero mantiene el espacio */}
          {qrBase64 ? <Image src={qrBase64} style={styles.qrImage} /> : null}
        </View>

        <View style={styles.footerBar} />
      </Page>

      {/* CARA B: REVERSO */}
      <Page size={CARNET_SIZE} style={styles.page}>
        <View style={styles.backHeader}>
          <Text style={styles.backTitle}>IDENTIFICACIÓN INSTITUCIONAL</Text>
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.detailLabel}>Estudiante</Text>
          <Text style={styles.detailValue}>{fullName}</Text>

          <Text style={styles.detailLabel}>Cédula de Identidad</Text>
          <Text style={styles.detailValue}>{student?.ci || 'S/N'}</Text>

          <Text style={styles.detailLabel}>Código RUDE</Text>
          <Text style={styles.detailValue}>{student?.rudeCode || 'EN TRÁMITE'}</Text>

          <View style={styles.divider} />

          <Text style={styles.rulesText}>
            Este documento es personal e intransferible y acredita al portador como estudiante regular
            de la Institución. En caso de extravío, favor comunicarse con secretaría académica.
          </Text>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Sello y Firma Dirección</Text>
          </View>
        </View>

        <View style={styles.backFooter}>
          <Text style={styles.backFooterText}>
            SUCRE - BOLIVIA | GESTIÓN{' '}
            {enrollment?.academicYear?.year || new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
export default StudentCarnetDocument
