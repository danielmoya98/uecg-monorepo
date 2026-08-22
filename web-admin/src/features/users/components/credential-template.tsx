import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  container: {
    border: '4pt solid #000060',
    padding: 30,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '2pt solid #E5E7EB',
    paddingBottom: 20,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 42,
    fontWeight: 'extrabold',
    color: '#000060',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  valueName: {
    fontSize: 22,
    fontWeight: 'extrabold',
    color: '#111827',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: '#000089',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  credentialsBox: {
    backgroundColor: '#F3F4F6',
    border: '1pt solid #D1D5DB',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  valueEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  passwordContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  passwordBox: {
    fontFamily: 'Courier-Bold',
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    border: '1pt solid #000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
})

interface CredentialTemplateProps {
  mode: string
  fullName: string
  role: string
  generatedEmail: string
  generatedPassword?: string
}

export const CredentialTemplate = ({
  mode,
  fullName,
  role,
  generatedEmail,
  generatedPassword,
}: CredentialTemplateProps) => (
  <Document>
    <Page size="A5" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>U.E.C.G.</Text>
          <Text style={styles.subtitle}>
            {mode === 'reset' ? 'Recuperación de Acceso' : 'Credencial de Acceso al Sistema'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Titular</Text>
          <Text style={styles.valueName}>{fullName || 'Nombre de Usuario'}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>Rol: {role}</Text>
          </View>
        </View>

        <View style={styles.credentialsBox}>
          <Text style={styles.label}>Correo Institucional (Usuario)</Text>
          <Text style={styles.valueEmail}>{generatedEmail || 'usuario@uecg.edu.bo'}</Text>

          <Text style={styles.label}>
            {mode === 'reset' ? 'Nueva Contraseña Temporal' : 'Contraseña Temporal'}
          </Text>
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordBox}>{generatedPassword || '********'}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)
