import { Helmet } from 'react-helmet-async'

import { SetupLayout } from '../layouts/setup-layout'

import { SetupPasswordForm } from '../components/setup-password-form'

export function SetupPasswordPage() {
  return (
    <>
      <Helmet>
        <title>
          Configuración de Seguridad
        </title>
      </Helmet>

      <SetupLayout>
        <SetupPasswordForm />
      </SetupLayout>
    </>
  )
}
